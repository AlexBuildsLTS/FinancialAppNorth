import { supabase } from '../lib/supabase';
import { ChatbotMessage } from '../types';
import { generateContent } from '../shared/services/geminiService'; 

// ==========================================
// 1. CHAT HISTORY
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
  // Ensure profile exists to prevent FK errors (Self-Healing)
  if (sender === 'user') {
     const { data: profile } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
     if (!profile) {
         // This works because we unlocked the INSERT policy in SQL
         await supabase.from('profiles').insert({ id: userId, email: 'user@temp.com', role: 'member' });
     }
  }

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
// 2. UNIFIED CHAT FUNCTION
// ==========================================

export const sendUserMessageToAI = async (userId: string, text: string): Promise<string> => {
  try {
    // 1. Save User Message
    await addChatbotMessage(userId, 'user', text);

    // 2. Call AI (Delegated to the robust geminiService)
    // This will try all models until one works
    const aiResponseText = await generateContent(text, userId);

    // 3. Save AI Response
    await addChatbotMessage(userId, 'ai', aiResponseText);

    return aiResponseText;
  } catch (error: any) {
    console.error("AI Conversation Failed:", error);
    const errorMessage = error.message || "Could not connect to AI.";
    
    // Add a system error message to the chat so the user sees it
    await addChatbotMessage(userId, 'ai', `Error: ${errorMessage}`);
    throw error;
  }
};

// ==========================================
// 3. DASHBOARD INSIGHTS
// ==========================================

export const generateFinancialInsight = async (userId: string, transactions: any[]): Promise<string> => {
  try {
    if (transactions.length === 0) return "No transactions to analyze yet.";

    const summary = transactions.slice(0, 10).map(t => 
      `${t.date}: ${t.description} (${t.amount})`
    ).join('\n');

    const prompt = `
      Analyze these recent financial transactions:
      ${summary}
      
      Provide a 1-sentence insight about spending habits. 
      Be concise and friendly.
    `;

    return await generateContent(prompt, userId);
  } catch (e) {
    return "Insight unavailable.";
  }
};