import { GoogleGenerativeAI } from '@google/generative-ai';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------

/**
 * Securely access the API key from environment variables.
 * Ensure EXPO_PUBLIC_GEMINI_API_KEY is defined in your .env file.
 */
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("CRITICAL: EXPO_PUBLIC_GEMINI_API_KEY is missing.");
}

/**
 * Initialize the Google Generative AI Client.
 */
const genAI = new GoogleGenerativeAI(API_KEY || '');

/**
 * Prioritized list of models to attempt.
 * The service will probe these in order until one responds successfully.
 */
const MODEL_FALLBACK_LIST = [
  'gemini-1.5-flash',      // Priority 1: Fast & efficient
  'gemini-1.5-flash-001',  // Priority 2: Specific version
  'gemini-1.5-pro',        // Priority 3: Higher intelligence
  'gemini-pro',            // Priority 4: Legacy stable
];

// ------------------------------------------------------------------
// STATE MANAGEMENT
// ------------------------------------------------------------------

/**
 * Caches the name of the validated working model to avoid repeated probing.
 */
let cachedWorkingModel: string | null = null;

// ------------------------------------------------------------------
// INTERNAL UTILITIES
// ------------------------------------------------------------------

/**
 * Probes the model list to find the first one that accepts a generation request.
 * This effectively bypasses the lack of 'listModels' in the client SDK.
 * * @returns {Promise<string>} The name of a functioning model.
 * @throws Will throw an error if no models are reachable.
 */
const resolveWorkingModel = async (): Promise<string> => {
  // Return cached model if available to optimize performance
  if (cachedWorkingModel) return cachedWorkingModel;

  console.log("🤖 Negotiating AI Model...");

  for (const modelName of MODEL_FALLBACK_LIST) {
    try {
      // Attempt a minimal generation task to test the model
      const model = genAI.getGenerativeModel({ model: modelName });
      await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Hi' }] }]
      });

      // If successful, cache and return this model
      console.log(`✅ Model Active: ${modelName}`);
      cachedWorkingModel = modelName;
      return modelName;

    } catch (error: any) {
      // Log warning but continue to next model
      console.warn(`⚠️ Model '${modelName}' failed or unavailable.`, error.message?.split(':')[0]);
    }
  }

  // Fallback to default if negotiation fails entirely
  console.error("❌ All models failed negotiation. Defaulting to 'gemini-pro'.");
  return 'gemini-pro';
};

// ------------------------------------------------------------------
// PUBLIC API
// ------------------------------------------------------------------

/**
 * Generates AI content for a given prompt using the best available model.
 * Handles errors gracefully and returns user-friendly messages.
 * * @param {string} question - The user's input prompt.
 * @returns {Promise<string>} The AI's textual response.
 */
export const generateContent = async (question: string): Promise<string> => {
  if (!API_KEY) return "Configuration Error: Missing API Key.";

  try {
    // 1. Resolve Model
    const modelName = await resolveWorkingModel();
    const model = genAI.getGenerativeModel({ model: modelName });

    // 2. Execute Generation
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: question }],
      }],
    });

    // 3. Extract Response
    const responseText = result.response.text();
    return responseText || "The AI processed the request but returned no text.";

  } catch (error: any) {
    console.error("🔴 Generation Failed:", error);

    // Reset cache if a previously working model fails (e.g., rate limit or outage)
    cachedWorkingModel = null;

    if (error.message?.includes('404')) {
        return "Service temporarily unavailable (Model Not Found). Retrying connection...";
    }
    
    return "I'm having trouble connecting to the AI service right now. Please try again.";
  }
};

/**
 * Specialized wrapper for financial advice.
 * Injects a system persona prompt to guide the AI's behavior.
 * * @param {string} question - The user's financial question.
 * @returns {Promise<string>} Tailored financial advice.
 */
export const getFinancialAdvice = async (question: string): Promise<string> => {
  const personaContext = `
    You are NorthFinance AI, an expert financial assistant. 
    Provide concise, actionable, and professional financial advice. 
    User Question: "${question}"
  `;
  
  return await generateContent(personaContext);
};