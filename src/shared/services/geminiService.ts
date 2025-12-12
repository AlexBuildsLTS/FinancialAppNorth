import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../../lib/supabase';
import { decryptMessage } from '../../lib/crypto'; 

// --- Configuration ---
const GLOBAL_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// Updated Model List (Prioritizing Stable Models)
const MODEL_FALLBACK_LIST = [
  'gemini-pro',       // Most stable
  'gemini-1.5-flash', // Newer, might be gated
  'gemini-1.0-pro'    // Legacy
];

// --- Helper: Get & Decrypt Key ---
export const getGeminiApiKey = async (userId?: string): Promise<string | null> => {
  if (userId) {
    const { data } = await supabase
      .from('user_secrets')
      .select('api_key_encrypted')
      .eq('user_id', userId)
      .eq('service', 'gemini')
      .maybeSingle();

    if (data?.api_key_encrypted) {
      try {
        return decryptMessage(data.api_key_encrypted);
      } catch (e) {
        return data.api_key_encrypted; // Return raw if not encrypted
      }
    }
  }
  return GLOBAL_API_KEY || null;
};

// --- Main Function: Generate Content ---
export const generateContent = async (prompt: string, userId?: string, imgBase64?: string): Promise<string> => {
  const apiKey = await getGeminiApiKey(userId);
  
  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please add it in Settings > Security.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Loop through models
  for (const modelName of MODEL_FALLBACK_LIST) {
    try {
      console.log(`🤖 AI Attempting: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ AI Success with: ${modelName}`);
      return text;

    } catch (error: any) {
      console.warn(`❌ ${modelName} failed:`, error.message);
      // Continue to next model
    }
  }

  throw new Error("AI Service Unavailable. Please check your API Key permissions.");
};

export const getFinancialAdvice = async (data: any, userId?: string) => {
  return await generateContent(`Act as a financial advisor. Analyze: ${JSON.stringify(data)}`, userId);
};