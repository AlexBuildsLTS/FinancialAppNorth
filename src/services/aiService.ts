import { supabase } from '../lib/supabase';
import { ChatbotMessage } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CORE GEMINI LOGIC ---

export const getGeminiResponse = async (prompt: string, apiKey: string) => {
  try {
    if (!apiKey) throw new Error("API Key is missing");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Gemini Service Error:', error);
    throw new Error('Failed to get response from Gemini AI.');
  }
};

// --- CHAT HISTORY MANAGEMENT ---

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

  if (error) {
    console.error('Error clearing chatbot messages:', error);
    throw error;
  }
};

// --- UNIFIED INTERACTION FUNCTION ---
// This handles the full flow: Save User Msg -> Call AI -> Save AI Msg -> Return Text
export const sendUserMessageToAI = async (userId: string, text: string, apiKey: string): Promise<string> => {
  try {
    // 1. Save User Message
    await addChatbotMessage(userId, 'user', text);

    // 2. Get Response from Gemini
    // We use the direct client call here since you are storing keys in Settings
    const aiResponseText = await getGeminiResponse(text, apiKey);

    // 3. Save AI Message
    await addChatbotMessage(userId, 'ai', aiResponseText);

    return aiResponseText;
  } catch (error) {
    console.error("AI Conversation Failed:", error);
    // Optionally save an error message to the chat
    await addChatbotMessage(userId, 'ai', "I'm sorry, I encountered an error processing your request.");
    throw error;
  }
};