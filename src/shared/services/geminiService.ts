import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../../lib/supabase';
import { decryptMessage } from '../../lib/crypto'; 

// --- Configuration ---
// Fallback to a global key if user hasn't set one (Optional, for dev)
const GLOBAL_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// List of models to try in order. If one fails (404/503), the next is attempted.
const MODEL_FALLBACK_LIST = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.0-pro',
  'gemini-pro'
];

// --- Helper: Get & Decrypt Key ---
export const getGeminiApiKey = async (userId?: string): Promise<string | null> => {
  // 1. Try User Settings first (Privacy first)
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
        console.warn("Key decryption failed, trying raw value");
        return data.api_key_encrypted;
      }
    }
  }

  // 2. Fallback to Env Var
  return GLOBAL_API_KEY || null;
};

// --- Main Function: Generate Content ---
export const generateContent = async (prompt: string, userId?: string): Promise<string> => {
  const apiKey = await getGeminiApiKey(userId);
  
  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please add it in Settings > Security.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Loop through models until one works
  for (const modelName of MODEL_FALLBACK_LIST) {
    try {
      console.log(`🤖 AI Attempting: ${modelName}`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: "You are NorthAI, an elite financial advisor. Be concise, professional, and helpful. Format your answers clearly."
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ AI Success with: ${modelName}`);
      return text;

    } catch (error: any) {
      console.warn(`❌ ${modelName} failed:`, error.message);
      // If it's the last model and it failed, throw the error
      if (modelName === MODEL_FALLBACK_LIST[MODEL_FALLBACK_LIST.length - 1]) {
        throw new Error("AI Service Unavailable. Please check your API Key or try again later.");
      }
      // Otherwise, continue to next model in loop
    }
  }

  throw new Error("Unexpected AI Error");
};

// --- Helper: Financial Specific ---
export const getFinancialAdvice = async (financialData: any, userId?: string) => {
  const prompt = `
    Analyze this financial summary and give 3 bullet points of advice:
    Income: ${financialData.income}
    Expenses: ${financialData.expense}
    Net Balance: ${financialData.balance}
    Recent Transactions: ${JSON.stringify(financialData.recent_transactions || [])}
  `;
  return await generateContent(prompt, userId);
};