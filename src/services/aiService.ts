import { supabase } from '../lib/supabase';
import { ChatbotMessage } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ==========================================
// 1. API KEY MANAGEMENT
// ==========================================

export const saveGeminiKey = async (userId: string, apiKey: string) => {
  const { data: existing } = await supabase
    .from('user_secrets')
    .select('id')
    .eq('user_id', userId)
    .eq('service', 'gemini')
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('user_secrets').update({ api_key_encrypted: apiKey }).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('user_secrets').insert({ user_id: userId, service: 'gemini', api_key_encrypted: apiKey });
    if (error) throw error;
  }
};

export const getGeminiKey = async (userId: string): Promise<string | null> => {
  const { data } = await supabase
    .from('user_secrets')
    .select('api_key_encrypted')
    .eq('user_id', userId)
    .eq('service', 'gemini')
    .maybeSingle();

  return data?.api_key_encrypted || null;
};

// ==========================================
// 2. CORE GEMINI INTERACTION (SDK BASED)
// ==========================================

const callGeminiDirectly = async (prompt: string, apiKey: string) => {
  try {
    // Initialize SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use the standard 'gemini-1.5-flash'. 
    // The SDK automatically handles the v1beta/v1 endpoints.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error: any) {
    console.error("Gemini SDK Error:", error);
    // Fallback: If Flash fails, try Pro (older key compatibility)
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      console.warn("Retrying with gemini-pro...");
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await fallbackModel.generateContent(prompt);
        return result.response.text();
      } catch (retryError) {
         throw new Error("AI Service Unavailable. Please check your API Key.");
      }
    }
    throw error;
  }
};

// ==========================================
// 3. CHAT HISTORY
// ==========================================

export const getChatbotMessages = async (userId: string): Promise<ChatbotMessage[]> => {
  const { data, error } = await supabase
    .from('chatbot_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chatbot messages:', error);
    return [];
  }
  return data || [];
};

export const addChatbotMessage = async (userId: string, sender: 'user' | 'ai', text: string) => {
  const { data, error } = await supabase
    .from('chatbot_messages')
    .insert([{ user_id: userId, sender, text }])
    .select()
    .single();

  if (error) throw error; 
  return data;
};

export const clearChatbotMessages = async (userId: string) => {
  const { error } = await supabase
    .from('chatbot_messages')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};

// ==========================================
// 4. UNIFIED CHAT FUNCTION
// ==========================================

export const sendUserMessageToAI = async (userId: string, text: string): Promise<string> => {
  try {
    const apiKey = await getGeminiKey(userId);
    if (!apiKey) throw new Error("No Gemini API Key found. Please add it in Settings > AI Keys.");

    // 1. Save User Message
    await addChatbotMessage(userId, 'user', text);

    // 2. Call AI
    const aiResponseText = await callGeminiDirectly(text, apiKey);

    // 3. Save AI Response
    await addChatbotMessage(userId, 'ai', aiResponseText);

    return aiResponseText;
  } catch (error: any) {
    console.error("AI Conversation Failed:", error);
    // Add a system error message to the chat so the user sees it
    await addChatbotMessage(userId, 'ai', "Error: " + (error.message || "Could not connect to AI."));
    throw error;
  }
};

// ==========================================
// 5. DASHBOARD INSIGHTS
// ==========================================

export const generateFinancialInsight = async (userId: string, transactions: any[]): Promise<string> => {
  try {
    const apiKey = await getGeminiKey(userId);
    if (!apiKey) return "Please set your API Key to get AI insights.";

    if (transactions.length === 0) return "No transactions to analyze yet.";

    const summary = transactions.slice(0, 10).map(t => 
      `${t.date}: ${t.description} (${t.amount})`
    ).join('\n');

    const prompt = `
      Analyze these recent financial transactions:
      ${summary}
      
      Provide a 1-sentence insight about spending habits or a tip to save money. 
      Be concise and friendly.
    `;

    return await callGeminiDirectly(prompt, apiKey);
  } catch (e) {
    return "Insight unavailable.";
  }
};