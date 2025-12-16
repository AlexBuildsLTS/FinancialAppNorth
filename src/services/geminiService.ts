import { supabase } from '../lib/supabase';



/**
 * 🔒 SECURITY BRIDGE
 * Delegates AI logic to the server (Supabase Edge Function)
 */
export async function generateContent(prompt: string, userId?: string): Promise<string> {
  if (!prompt) throw new Error('Prompt is required');

  try {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { prompt, userId: userId || 'anonymous' },
    });

    if (error) {
      console.error('Edge Function Error:', error);
      throw new Error('Secure connection to NorthAI failed.');
    }

    if (!data || !data.text) {
      return "I analyzed the data but couldn't generate a text response.";
    }

    return data.text;
  } catch (error: any) {
    console.error('AI Service Failed:', error);
    // Return a safe string so the app doesn't crash
    return "System Maintenance: AI Brain temporarily offline.";
  }
}