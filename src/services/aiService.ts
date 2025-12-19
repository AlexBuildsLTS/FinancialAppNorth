import { supabase } from '../lib/supabase';
import { ChatbotMessage, ParsedVoiceCommand } from '../types';
import { generateContent } from './geminiService';

/**
 * 🧠 AI Service Wrapper
 * Provides specific business logic capabilities on top of the generic geminiService.
 */

// Internal helper to enforce usage of the robust service
const generateContentWithHistory = async (userText: string, userId?: string, imgBase64?: string): Promise<string> => {
  if (!userText || !userText.trim()) return "Please provide a valid prompt.";
  return await generateContent(userText.trim(), userId, imgBase64);
};

// --- History & Persistence ---

export const getChatbotMessages = async (userId: string): Promise<ChatbotMessage[]> => {
  const { data, error } = await supabase
    .from('chatbot_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  return error ? [] : (data || []);
};

export const addChatbotMessage = async (userId: string, sender: 'user' | 'ai', text: string) => {
  // Self-Healing: Ensure profile exists
  if (sender === 'user') {
     const { data: profile } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
     if (!profile) {
         await supabase.from('profiles').insert({ 
             id: userId, 
             email: 'user@placeholder.com', 
             role: 'member',
             updated_at: new Date().toISOString()
         });
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

export const sendUserMessageToAI = async (userId: string, text: string): Promise<string> => {
  try {
    await addChatbotMessage(userId, 'user', text);
    const aiResponseText = await generateContentWithHistory(text, userId);
    await addChatbotMessage(userId, 'ai', aiResponseText);
    return aiResponseText;
  } catch (error: any) {
    const msg = error.message || "Connection failed.";
    await addChatbotMessage(userId, 'ai', `Error: ${msg}`);
    throw error;
  }
};

// --- Titan 2: Financial Intelligence ---

export const generateFinancialInsight = async (userId: string, transactions: any[]): Promise<string> => {
  if (!transactions?.length) return "No transactions to analyze.";
  
  const summary = transactions.slice(0, 10).map(t => 
    `- ${t.date || 'N/A'}: ${t.description || 'Unknown'} (${t.amount})`
  ).join('\n');

  const prompt = `Analyze these recent transactions and give 1 brief financial tip:\n${summary}`;
  return await generateContentWithHistory(prompt, userId);
};

// --- Smart Ledger (Voice & Text Parsing) ---

export const parseVoiceCommand = async (voiceText: string): Promise<ParsedVoiceCommand> => {
  // 1. Try to find Amount
  const amountMatch = voiceText.match(/\$?(\d+(?:\.\d{2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  // 2. Identify Keywords
  const lower = voiceText.toLowerCase();
  let category = 'Other';
  
  if (lower.includes('food') || lower.includes('lunch') || lower.includes('restaurant')) category = 'Food';
  else if (lower.includes('gas') || lower.includes('uber') || lower.includes('taxi')) category = 'Transport';
  else if (lower.includes('bill') || lower.includes('rent')) category = 'Utilities';

  return {
    amount,
    description: voiceText,
    merchant: 'Unknown', // Logic for merchant extraction requires more complex regex or AI
    category,
    date: new Date()
  };
};