import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API client correctly using the mandatory process.env.API_KEY variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePropertyDescription = async (details: {
  title: string;
  location: string;
  rent: number;
  features: string[];
}) => {
  const prompt = `Write a professional and enticing house rental description for a listing in Bangladesh. 
  Title: ${details.title}
  Location: ${details.location}
  Rent: ৳${details.rent}
  Features: ${details.features.join(', ')}
  Keep it concise but highlight the benefits of the location and the amenities.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate description. Please write manually.";
  }
};