export interface HealthAssessment {
  conditions: { 
    name: string; 
    confidence: number;
    description: string;
    nextSteps: string[];
  }[];
  reasoning: string;
  xaiExplain: string;
  imageInsight?: string;
  boundingBoxes?: { box_2d: number[]; label: string }[];
  recommendation: 'Rest' | 'Doctor' | 'Urgent care';
  warningSigns: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
}
