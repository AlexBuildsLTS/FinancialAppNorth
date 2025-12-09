import { GoogleGenerativeAI } from '@google/generative-ai';
import { decryptMessage } from '../../lib/crypto';
import { supabase } from '@/lib/supabase';




// --- Configuration ---
// 1. Global Fallback Key (from .env)
const GLOBAL_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
// 2. Decryption Function (from crypto.ts)
// This is used to decrypt the API key fetched from secure storage.
// It's crucial for security that the key is encrypted at rest.
const decrypt = (encryptedKey: string): string => {
  try {
    return decryptMessage(encryptedKey);
  } catch (error) {
    console.error("Failed to decrypt API key:", error);
    return ''; // Return empty string on decryption failure
  }
};

// Cache the working model name to speed up future requests
let cachedGeminiApiKey: string | null = null;

export const getGeminiApiKey = async (userId?: string): Promise<string | null> => {
  if (cachedGeminiApiKey) {
    return cachedGeminiApiKey;
  }

  if (!userId) {
    return GLOBAL_API_KEY || null;
  }

  const { data } = await supabase
    .from('user_secrets')
    .select('api_key_encrypted')
    .eq('user_id', userId)
    .eq('service', 'gemini')
    .maybeSingle();

  if (data?.api_key_encrypted) {
    const decryptedKey = decrypt(data.api_key_encrypted);
    if (decryptedKey) {
      cachedGeminiApiKey = decryptedKey;
      return decryptedKey;
    }
  }
  return GLOBAL_API_KEY || null;
}; 


// --- Model Strategy ---
// Prioritized list. 
// 'gemini-1.5-flash' is fast/cheap.
// 'gemini-pro' is the stable legacy model that rarely 404s.
const MODEL_FALLBACK_LIST = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-001',
  'gemini-1.5-pro',
  'gemini-pro',
];

// Cache the working model name to speed up future requests
let cachedWorkingModel: string | null = null;

// --- Internal Utilities ---

/**
 * Helper to get the best available API Key.
 * 1. Checks if a User ID is provided and has a custom key.
 * 2. Falls back to the global environment variable.
 */
const resolveApiKey = async (userId?: string): Promise<string | null> => {
  if (userId) {
    const userKey = await getGeminiApiKey(userId);
    if (userKey) return userKey;
  }
  return GLOBAL_API_KEY || null;
};

/**
 * Probes available models to find one that accepts requests.
 */
const resolveWorkingModel = async (genAI: GoogleGenerativeAI): Promise<string> => {
  if (cachedWorkingModel) return cachedWorkingModel;

  console.log("🤖 Negotiating AI Model...");

  for (const modelName of MODEL_FALLBACK_LIST) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Lightweight test generation
      await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
      });

      console.log(`✅ Model Active: ${modelName}`);
      cachedWorkingModel = modelName;
      return modelName;

    } catch (error: any) {
      console.warn(`⚠️ Model '${modelName}' unavailable. Trying next...`);
    }
  }

  // Final fallback
  console.error("❌ All models failed negotiation. Defaulting to gemini-pro.");
  return 'gemini-pro';
};

// --- Public API ---

/**
 * Generates AI content with automatic model fallback.
 * @param question User's input prompt
 * @param userId (Optional) ID of the user to fetch their specific API key
 */
export const generateContent = async (question: string, userId?: string): Promise<string> => {
  
  // 1. Resolve API Key
  const apiKey = await resolveApiKey(userId);
  
  if (!apiKey) {
    return "Configuration Error: No Gemini API Key found. Please add it in Settings > AI Keys.";
  }

  try {
    // 2. Initialize SDK with the resolved key
    // We do this PER REQUEST to ensure we use the correct key (User vs Global)
    const genAI = new GoogleGenerativeAI(apiKey);

    // 3. Resolve Working Model
    const modelName = await resolveWorkingModel(genAI);
    const model = genAI.getGenerativeModel({ model: modelName });

    // 4. Generate Content
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: question }],
      }],
    });

    const response = result.response;
    const text = response.text();
    return text || "The AI returned an empty response.";

  } catch (error: any) {
    console.error("🔴 AI Generation Failed:", error);

    // Reset cache if a previously working model crashes
    cachedWorkingModel = null;

    if (error.message?.includes('404')) {
        return "Error: AI Model temporarily unavailable (404). Retrying connection...";
    }
    if (error.message?.includes('API_KEY')) {
        return "Error: Invalid API Key. Please check your settings.";
    }

    return "I'm having trouble connecting to the AI. Please try again.";
  }
};

/**
 * Specialized wrapper for financial advice.
 */
export const getFinancialAdvice = async (question: string, userId?: string): Promise<string> => {
  const context = `You are NorthFinance AI. Provide professional, concise financial advice. Question: ${question}`;
  return await generateContent(context, userId);
};