import { GoogleGenerativeAI } from '@google/generative-ai';
import { settingsService } from './settingsService';

// Fallback models in case one is deprecated/unavailable
const MODEL_FALLBACKS = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];

export const generateContent = async (
  prompt: string, 
  userId?: string, 
  imageBase64?: string
): Promise<string> => {
  
  // 1. Get Key securely
  if (!userId) throw new Error("User ID required for AI.");
  
  const apiKey = await settingsService.getApiKey(userId, 'gemini');
  if (!apiKey) {
    throw new Error("Gemini API Key not found. Please add it in Settings > AI Configuration.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // 2. Iterate through models until one works
  let lastError = null;

  for (const modelName of MODEL_FALLBACKS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      let result;
      if (imageBase64) {
        // Image + Text Request (Multimodal)
        result = await model.generateContent([
          prompt,
          { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }
        ]);
      } else {
        // Text Only Request
        result = await model.generateContent(prompt);
      }

      const response = await result.response;
      return response.text();

    } catch (error: any) {
      console.warn(`[AI] Model ${modelName} failed:`, error.message);
      lastError = error;
      // Continue to next model...
    }
  }

  throw new Error(`AI Service Failed: ${lastError?.message || 'All models unavailable'}`);
};

/**
 * Specialized helper for financial insights
 */
export const generateFinancialInsight = async (userId: string, transactions: any[]) => {
  // Simplify data to save tokens
  const txSummary = transactions.slice(0, 20).map(t => 
    `${t.date}: ${t.description} (${t.amount}) - ${typeof t.category === 'string' ? t.category : t.category?.name}`
  ).join('\n');

  const prompt = `
    Act as a financial advisor. Analyze these recent transactions:
    ${txSummary}
    
    Provide a single, short, actionable insight (max 2 sentences) about spending habits or saving opportunities.
    Do not use markdown formatting.
  `;

  try {
    return await generateContent(prompt, userId);
  } catch (e) {
    return "Add your Gemini API Key in settings to unlock AI insights.";
  }
};