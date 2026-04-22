import { HealthAssessment } from "../types";

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
  try {
    const response = await fetch('/api/hospitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, language })
    });
    
    if (!response.ok) throw new Error("Failed to fetch hospitals");
    return await response.json();
  } catch (e) {
    console.error("Failed to find hospitals", e);
    return [];
  }
}

export async function analyzeSymptoms(
  query: string, 
  language: 'English' | 'Hindi' | 'Marathi',
  imageData?: { data: string; mimeType: string }
): Promise<HealthAssessment> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, language, imageData })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to analyze symptoms");
  }
  
  return await response.json();
}
