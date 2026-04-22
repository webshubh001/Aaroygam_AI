import { GoogleGenAI } from "@google/genai";
import { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || "" });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

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

    const text = response.text();
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
}
