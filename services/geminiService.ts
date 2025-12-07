import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// The specific model requested is "Nano banana", which maps to 'gemini-2.5-flash-image'
const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Generates an image based on a reference image and a text prompt.
 * 
 * @param base64Image The source image in base64 format (stripped of data prefix).
 * @param mimeType The mime type of the source image.
 * @param prompt The prompt describing the desired transformation/style.
 * @returns The generated image as a base64 data URL string.
 */
export const generateStyledPortrait = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      // Note: We do not set responseMimeType or responseSchema for image models 
      // as per guidelines for nano banana series.
    });

    const candidate = response.candidates?.[0];

    // Check for safety finish reason
    if (candidate?.finishReason === 'SAFETY') {
      throw new Error("图片生成被安全策略拦截。请尝试更正规的肖像照片。");
    }

    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          // Construct the data URL
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }

    // If no image part found but finishReason was not safety (e.g. STOP but only text returned)
    throw new Error(`生成未返回图片数据 (原因: ${candidate?.finishReason || '未知'})`);

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Rethrow with a user-friendly message if possible
    throw error;
  }
};

/**
 * Helper to strip the data URL prefix (e.g., "data:image/jpeg;base64,")
 */
export const extractBase64Data = (dataUrl: string): { data: string; mimeType: string } => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 data URL");
  }
  return {
    mimeType: matches[1],
    data: matches[2],
  };
};