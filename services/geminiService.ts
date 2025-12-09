import { GoogleGenAI } from "@google/genai";
import { WATER_SYSTEM_INSTRUCTION } from '../constants';

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const sendMessageToGemini = async (message: string, systemInstruction?: string): Promise<string> => {
  if (!ai) {
    throw new Error("API Key is not configured. Please set the API_KEY environment variable.");
  }
  
  try {
    const finalSystemInstruction = systemInstruction || WATER_SYSTEM_INSTRUCTION;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: 0.3,
      },
    });

    // FIX: Per @google/genai guidelines, extract text using the .text property.
    return response.text ?? "خطایی در دریافت پاسخ رخ داده است.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const analyzeImageWithGemini = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    if (!ai) {
      throw new Error("API Key is not configured. Please set the API_KEY environment variable.");
    }
    
    try {
      const finalSystemInstruction = WATER_SYSTEM_INSTRUCTION + "\n\nتمرکز ویژه: تحلیل پوشش گیاهی، فرسایش خاک و پیشنهاد گونه‌های گیاهی مقاوم به خشکی برای تغذیه آبخوان.";

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mimeType, data: base64Image } }
          ]
        },
        config: {
          systemInstruction: finalSystemInstruction,
          temperature: 0.4,
        },
      });

      // FIX: Per @google/genai guidelines, extract text using the .text property.
      return response.text ?? "خطایی در تحلیل تصویر رخ داده است.";

    } catch (error)      {
      console.error("Gemini Vision Error:", error);
      throw error;
    }
};
