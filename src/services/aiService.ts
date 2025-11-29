import { supabase } from '../lib/supabase';
import { ChatbotMessage } from '../types';

// ==========================================
// 1. API KEY MANAGEMENT
// ==========================================

export const saveGeminiKey = async (userId: string, apiKey: string) => {
  // Check first to avoid constraint errors
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
// 2. CORE GEMINI INTERACTION (Robust 'fetch' version)
// ==========================================

const callGeminiDirectly = async (prompt: string, apiKey: string) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `AI Error: ${response.status}`);
  }

  // Extract text from Gemini response structure
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("AI returned no content.");
  
  return text;
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

    // 3. Call AI (Direct Fetch)
    const aiResponseText = await callGeminiDirectly(text, apiKey);

    // 4. Save AI Message
    await addChatbotMessage(userId, 'ai', aiResponseText);

    return aiResponseText;
  } catch (error: any) {
    console.error("AI Conversation Failed:", error);
    throw new Error(error.message || "AI failed to respond.");
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