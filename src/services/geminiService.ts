import { supabase } from '../lib/supabase';

export async function generateContent(
  prompt: string, 
  userId?: string, 
  image?: string, 
  isJsonMode: boolean = false
): Promise<string> {
  if (!prompt?.trim()) return "Please enter a message.";

  try {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { 
        prompt: prompt.trim(), 
        userId, 
        image: image ? (image.includes(',') ? image.split(',')[1] : image) : undefined 
      }
    });

    if (error) {
        console.error('[Gemini] Invocation Error:', error);
        return "I'm having trouble reaching the server. Please try again in a moment.";
    }

    // Safely extract text
    const text = data?.text || "";

    // If we're in JSON mode (for Ledger), return the raw string
    if (isJsonMode) {
        return text.replace(/```json|```/g, '').trim();
    }

    // For Chat: Paranoid Cleaning
    const cleanText = text
      .replace(/^{?\s*"?text"?\s*:\s*/i, '') 
      .replace(/}\s*$/, '')
      .replace(/^"|"$/g, '')
      .trim();

    if (!cleanText || cleanText === '""') {
        return "The AI brain processed your request but didn't have anything to say. Try asking specifically about your transactions or balances.";
    }

    return cleanText;

  } catch (err: any) {
    console.error('[Gemini] Critical Failure:', err);
    return "Service error. Please check your internet connection.";
  }
}