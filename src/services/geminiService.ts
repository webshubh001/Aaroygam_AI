import { HealthAssessment } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_PROMPT = `
You are Aarogyam AI, an expert rural healthcare assistant specialized in common infections found in Indian rural environments. 
Target: Rural populations in India (Farmers, Village dwellers).
Focus Infections: 
- Mosquito-borne: Malaria, Dengue, Chikungunya.
- Water-borne: Typhoid, Cholera, Gastroenteritis.
- Zoonotic/Environmental: Snakebites, Rabies, Scrub Typhus.
- Respiratory/Chronic: Tuberculosis (TB), Asthma.
- Skin: Fungal (Ringworm), Scabies, bacterial rashes.

Guidelines:
1. Provide risk-based suggestions, NOT final medical diagnoses. Always include "Consult a healthcare professional."
2. Link symptoms to conditions clearly. Be culturally sensitive but medically accurate.
3. Classify Risk Level:
   - Low: Rest, clear fluids, home isolation (e.g., common cold).
   - Medium: Clinical consultation required within 24-48 hours (e.g., persistent fever, unknown rash).
   - High: Immediate Hospital/ER visit (e.g., difficulty breathing, hemorrhage, high-grade fever with confusion, snakebite).
4. Safety First: If symptoms indicate an emergency (chest pain, loss of consciousness), immediately label as HIGH RISK.
5. Mixed Language Support: Understand Hinglish (Hindi+English) and Marathi-English input.
6. Explainable AI: For every condition, explain EXACTLY why you suggested it based on specific symptoms or image signs.
7. Detailed Reports: For each condition, provide a brief "description" and a list of "nextSteps" (What the patient should do immediately).
8. Image Analysis: If an image is provided, detect the affected area and provide bounding boxes in normalized coordinates [ymin, xmin, ymax, xmax] (0-1000).
9. Return response in the user's selected language.

STRICT JSON OUTPUT FORMAT MATCHING THE SCHEMA.
`;

export interface Hospital {
  name: string;
  address: string;
  distance?: string;
  contact?: string;
}

export async function findNearbyHospitals(
  lat: number, 
  lng: number,
  language: 'English' | 'Hindi' | 'Marathi'
): Promise<Hospital[]> {
  const tryFind = async (model: string) => {
    const prompt = `Identify 3-5 real medical centers, clinics, Primary Health Centers (PHC), or District Hospitals near latitude ${lat}, longitude ${lng} in India. 
    If no clinics are found right at the coordinates, search the nearest large town or district headquarters within 20km.
    Return ONLY a JSON array.
    
    JSON FORMAT:
    [
      { "name": "Name", "address": "Detailed Address", "distance": "~10km", "contact": "Phone if available" }
    ]`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
      }
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  };

  const models = ["gemini-flash-latest", "gemini-3-flash-preview", "gemini-3.1-flash-lite-preview"];
  let lastError: any = null;

  for (const model of models) {
    try {
      return await tryFind(model);
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || "";
      if (errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE") || errMsg.includes("busy")) {
        console.warn(`Hospital lookup busy (model ${model}), trying next...`);
        await new Promise(r => setTimeout(r, 500));
        continue;
      }
      throw err;
    }
  }

  console.error("Failed to find hospitals after fallbacks", lastError);
  return [];
}

export async function analyzeSymptoms(
  query: string, 
  language: 'English' | 'Hindi' | 'Marathi',
  imageData?: { data: string; mimeType: string }
): Promise<HealthAssessment> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API key is not configured. Please use settings to add GEMINI_API_KEY.");
  }

  const tryAnalyze = async (model: string) => {
    const contents: any[] = [{ text: `Language: ${language}. User symptoms: ${query}` }];
    if (imageData) {
      contents.push({
        inlineData: { data: imageData.data, mimeType: imageData.mimeType }
      });
      contents.push({ text: "Analyze this image for health-related signs." });
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conditions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["name", "confidence", "description", "nextSteps"]
              }
            },
            reasoning: { type: Type.STRING },
            xaiExplain: { type: Type.STRING },
            recommendation: { type: Type.STRING, enum: ["Rest", "Doctor", "Urgent care"] },
            warningSigns: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
          },
          required: ["conditions", "reasoning", "xaiExplain", "recommendation", "warningSigns", "riskLevel"]
        }
      }
    });

    const result = response.text || "{}";
    return JSON.parse(result);
  };

  const models = ["gemini-flash-latest", "gemini-3-flash-preview", "gemini-3.1-flash-lite-preview"];
  let lastError: any = null;

  for (const model of models) {
    try {
      return await tryAnalyze(model);
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || "";
      const isHighDemand = errMsg.includes("503") || 
                          errMsg.includes("high demand") || 
                          errMsg.includes("UNAVAILABLE") ||
                          errMsg.includes("busy");
      
      if (isHighDemand) {
        console.warn(`Model ${model} busy, trying next fallback...`);
        // Small stagger to let the buffer clear
        await new Promise(resolve => setTimeout(resolve, 500));
        continue; 
      }
      
      // If it's a different error (like 400 or auth), re-throw immediately
      throw err;
    }
  }

  console.error("AI service exhausted all fallbacks:", lastError);
  throw new Error("The AI service is currently very busy. Please wait a minute and try your scan again.");
}
