import express from "express";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || "" });

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

app.post("/api/analyze", async (req, res) => {
  const { query, language, imageData } = req.body;
  
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "API key missing" });
  }

  try {
    const model = "gemini-3-flash-preview";
    const contents: any[] = [
      { text: `Language: ${language}. User symptoms: ${query}` }
    ];

    if (imageData) {
      contents.push({
        inlineData: {
          data: imageData.data,
          mimeType: imageData.mimeType
        }
      });
      contents.push({ text: "Also analyze this skin image if it's related to health." });
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
                  nextSteps: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["name", "confidence", "description", "nextSteps"]
              }
            },
            reasoning: { type: Type.STRING },
            xaiExplain: { type: Type.STRING },
            imageInsight: { type: Type.STRING },
            boundingBoxes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  box_2d: { 
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER }
                  },
                  label: { type: Type.STRING }
                }
              }
            },
            recommendation: { 
              type: Type.STRING,
              enum: ["Rest", "Doctor", "Urgent care"]
            },
            warningSigns: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            riskLevel: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High"]
            }
          },
          required: ["conditions", "reasoning", "xaiExplain", "recommendation", "warningSigns", "riskLevel"]
        }
      }
    });

    const result = response.text;
    res.json(JSON.parse(result));
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze symptoms" });
  }
});

app.post("/api/hospitals", async (req, res) => {
  const { lat, lng, language } = req.body;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "API key missing" });
  }

  try {
    const model = "gemini-3-flash-preview";
    const prompt = `Find at least 3-5 actual medical facilities (hospitals or clinics) near the coordinates (${lat}, ${lng}). 
    Return the results in ${language}. 
    If no specific data is found, mention general government hospitals in that district.
    
    STRICT JSON OUTPUT FORMAT:
    [
      { "name": "string", "address": "string", "distance": "string (optional)", "contact": "string (optional)" }
    ]`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
      }
    });

    const text = response.text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      res.json([]);
    }
  } catch (error: any) {
    console.error("Hospital Search Error:", error);
    res.status(500).json({ error: "Failed to find hospitals" });
  }
});

export default app;
