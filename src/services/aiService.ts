import { supabase } from '../lib/supabase';
import { ChatbotMessage } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { settingsService } from '../shared/services/settingsService';

// --- CORE GEMINI LOGIC ---

export const getGeminiResponse = async (prompt: string, apiKey: string) => {
  try {
    if (!apiKey) throw new Error("API Key is missing");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Updated model name
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
// This is the main function your UI should call.
// It handles: 1. Getting Key, 2. Saving User Msg, 3. Calling AI, 4. Saving AI Msg
export const sendUserMessageToAI = async (userId: string, text: string, apiKey: string): Promise<string> => {
  try {
    // 1. Save User Message
    await addChatbotMessage(userId, 'user', text);

    // 2. Get Response from Gemini
    // We use the direct client call here since we have the key from settings
    const aiResponseText = await getGeminiResponse(text, apiKey);

    // 3. Save AI Message
    await addChatbotMessage(userId, 'ai', aiResponseText);

    return aiResponseText;
  } catch (error) {
    console.error("AI Conversation Failed:", error);
    // Optionally save an error message to the chat so the user sees it in history
    await addChatbotMessage(userId, 'ai', "I'm sorry, I encountered an error connecting to the AI service. Please check your API key.");
    throw error;
  }
};