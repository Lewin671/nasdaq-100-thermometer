import { GoogleGenAI } from "@google/genai";
import { MarketData } from "../types";

export const generateMarketAnalysis = async (marketData: MarketData): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured. Unable to generate AI analysis.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are a senior financial analyst. Based on the following Nasdaq 100 data:
      Date: ${marketData.date}
      PE Ratio: ${marketData.pe} (${marketData.peStatus})
      VIX Index: ${marketData.vix} (${marketData.vixStatus})
      
      Provide a very concise, 2-sentence market commentary. 
      The tone should be professional but punchy.
      First sentence: Interpret the data sentiment.
      Second sentence: Give a direct tip based on the "Buy/Wait/Sell" implied status.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Analysis temporarily unavailable.";
  }
};