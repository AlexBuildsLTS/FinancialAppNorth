import { supabase } from '../lib/supabase';
import { ChatbotMessage } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ==========================================
// 1. API KEY MANAGEMENT
// ==========================================

export const saveGeminiKey = async (userId: string, apiKey: string) => {
  // FIX: Uses upsert to ensure the row is created if it doesn't exist
  const { error } = await supabase
    .from('user_secrets')
    .upsert(
      { user_id: userId, service: 'gemini', api_key_encrypted: apiKey },
      { onConflict: 'user_id, service' }
    );

  if (error) {
    console.error("Save API Key Error:", error);
    throw error;
  }
};

export const getGeminiKey = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('user_secrets')
    .select('api_key_encrypted')
    .eq('user_id', userId)
    .eq('service', 'gemini')
    .single();

  if (error || !data) return null;
  return data.api_key_encrypted;
};

// ==========================================
// 2. CORE GEMINI INTERACTION
// ==========================================

export const getGeminiResponse = async (prompt: string, apiKey: string) => {
  try {
    if (!apiKey) throw new Error("API Key is missing");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error: any) {
    console.error('Gemini Service Error:', error);
    throw new Error(error.message || 'Failed to get response from AI.');
  }
};

// ==========================================
// 3. CHAT HISTORY (Database)
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

  if (error) {
    console.error('Error adding chatbot message:', error);
    throw error; 
  }
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
// 4. UNIFIED CHAT FUNCTION (UI calls this)
// ==========================================

export const sendUserMessageToAI = async (userId: string, text: string): Promise<string> => {
  try {
    // 1. Get API Key
    const apiKey = await getGeminiKey(userId);
    if (!apiKey) throw new Error("No Gemini API Key found. Please add it in Settings > AI Keys.");

    // 2. Save User Message
    await addChatbotMessage(userId, 'user', text);

    // 3. Call AI
    const aiResponseText = await getGeminiResponse(text, apiKey);

    // 4. Save AI Message
    await addChatbotMessage(userId, 'ai', aiResponseText);

    return aiResponseText;
  } catch (error) {
    console.error("AI Conversation Failed:", error);
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

    return await getGeminiResponse(prompt, apiKey);
  } catch (e) {
    return "Insight unavailable.";
  }
};