
import { supabase } from '../lib/supabase';
import { ChatbotMessage } from '../types';
// Function to interact with AI Assistant via Supabase Edge Function


import { GoogleGenerativeAI } from '@google/generative-ai';

export const getGeminiResponse = async (prompt: string, apiKey: string) => {
  try {
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





export const askAiAssistant = async (prompt: string, apiKey: string) => {
  try {
    // Calls the 'chat-bot' Edge Function deployed on Supabase
    const { data, error } = await supabase.functions.invoke('chat-bot', {
      body: { 
        prompt, 
        apiKey // Passed securely
      },
    });

    if (error) throw error;
    return data.reply;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error('Failed to get response from AI Assistant.');

  }
};

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
    .insert([{ user_id: userId, sender, text }]);

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

export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    const apiKey = process.env.SUPABASE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key is not configured.');

    const response = await getGeminiResponse(prompt, apiKey);
    return response;
  } catch (error) {
    console.error('Generate AI Response Error:', error);
    throw error;
  }
};