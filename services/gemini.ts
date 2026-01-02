
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
    // Calling generateContent with the model name and prompt directly
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Accessing the .text property of GenerateContentResponse
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate description. Please write manually.";
  }
};

export const getSmartAssistance = async (query: string, currentContext?: string) => {
  const prompt = `You are the UrbanNest Smart Assistant, an expert in the Bangladesh real estate market. 
  User query: "${query}"
  Context of current listings: ${currentContext || 'Multiple premium apartments in Dhaka, Chittagong, and Sylhet.'}
  Help the user with their rental search or owner listing questions. Be polite, helpful, and specific to the Bangladesh context.`;

  try {
    // Calling generateContent with the model name and prompt directly
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Accessing the .text property of GenerateContentResponse
    return response.text;
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    return "I'm having trouble connecting right now. How else can I help you with your house search?";
  }
};
