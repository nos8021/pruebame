
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeDocument = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Por favor, resume el siguiente texto de forma concisa y estructurada para un lector que busca los puntos clave:\n\n${text}`,
      config: {
        systemInstruction: "Eres un asistente de lectura experto. Tu objetivo es ayudar al usuario a entender documentos largos extrayendo lo esencial de forma elegante y minimalista.",
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing document:", error);
    return "No se pudo generar el resumen en este momento.";
  }
};
