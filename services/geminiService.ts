

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { WATER_SYSTEM_INSTRUCTION } from '../constants';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const sendMessageToGemini = async (message: string, systemInstruction?: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction || WATER_SYSTEM_INSTRUCTION,
        temperature: 0.3, 
      },
    });

    return response.text || "خطایی در دریافت پاسخ رخ داده است.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const analyzeImageWithGemini = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    if (!apiKey) {
      throw new Error("API Key is missing.");
    }
  
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Image
                    }
                }
            ]
        },
        config: {
          systemInstruction: WATER_SYSTEM_INSTRUCTION + "\n\nتمرکز ویژه: تحلیل پوشش گیاهی، فرسایش خاک و پیشنهاد گونه‌های گیاهی مقاوم به خشکی برای تغذیه آبخوان.",
          temperature: 0.4, 
        },
      });
  
      return response.text || "خطایی در تحلیل تصویر رخ داده است.";
    } catch (error) {
      console.error("Gemini Vision Error:", error);
      throw error;
    }
  };