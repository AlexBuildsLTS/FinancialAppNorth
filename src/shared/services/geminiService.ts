import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../../lib/supabase';
import { decryptMessage } from '../../lib/crypto'; 

// --- Configuration ---
const GLOBAL_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// Helper to safely decrypt
const decrypt = (encryptedKey: string): string => {
  try {
    return decryptMessage(encryptedKey);
  } catch (error) {
    return encryptedKey;
  }
};

// Cache to remember which model/key actually worked
let cachedGeminiApiKey: string | null = null;
let cachedWorkingModel: string | null = null;

// Expanded list including legacy and preview models to ensure ONE works
const MODEL_FALLBACK_LIST = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.0-pro',
  'gemini-pro',
  'gemini-1.5-flash-latest'
];

// --- 1. Get API Key ---
export const getGeminiApiKey = async (userId?: string): Promise<string | null> => {
  if (cachedGeminiApiKey) return cachedGeminiApiKey;

  // 1. Try Global Key first (Fastest)
  if (!userId && GLOBAL_API_KEY) return GLOBAL_API_KEY;

  // 2. Try Fetching User Key
  if (userId) {
    const { data } = await supabase
      .from('user_secrets')
      .select('api_key_encrypted')
      .eq('user_id', userId)
      .eq('service', 'gemini')
      .maybeSingle();

    if (data?.api_key_encrypted) {
      const key = decrypt(data.api_key_encrypted);
      if (key) {
        cachedGeminiApiKey = key;
        return key;
      }
    }
  }

  return GLOBAL_API_KEY || null;
};

// --- 2. Generate Content (Robust Fallback) ---
export const generateContent = async (question: string, userId?: string): Promise<string> => {
  const apiKey = await getGeminiApiKey(userId);
  
  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please add it in Settings.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // A. Try Cached Model First
  if (cachedWorkingModel) {
    try {
      const model = genAI.getGenerativeModel({ model: cachedWorkingModel });
      const result = await model.generateContent(question);
      return result.response.text();
    } catch (e: any) {
      console.warn(`⚠️ Cached model ${cachedWorkingModel} failed. Resetting...`);
      cachedWorkingModel = null;
    }
  }

  // B. Iterate Fallback List
  for (const modelName of MODEL_FALLBACK_LIST) {
    try {
      console.log(`🤖 AI Attempting: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(question);
      const responseText = result.response.text();
      
      console.log(`✅ AI Success with: ${modelName}`);
      cachedWorkingModel = modelName;
      return responseText;

    } catch (error: any) {
      console.warn(`❌ ${modelName} failed: ${error.message?.slice(0, 50)}...`);
    }
  }

  throw new Error("AI Service Unavailable. Please check your API Key permissions.");
};

export const getFinancialAdvice = async (question: string, userId?: string) => {
  return await generateContent(
    `Act as a financial advisor. Answer briefly: ${question}`, 
    userId
  );
};