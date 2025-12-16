import { supabase } from '../lib/supabase';

export async function generateContent(prompt: string, userId?: string): Promise<string> {
  if (!prompt) throw new Error('Prompt is required');

  try {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { 
        prompt: prompt,
        userId: userId || 'anonymous' 
      },
      // Explicitly set headers sometimes helps with CORS/Content-Type issues
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Edge Function Error:', error);
      // Don't throw immediately, return a fallback to keep UI alive
      return "I'm having trouble connecting to the AI. Please try again in a moment.";
    }

    if (!data || !data.text) {
      return "I received an empty response.";
    }

    return data.text;
  } catch (error: any) {
    console.error('AI Service Failed:', error);
    return "AI Service is temporarily unavailable.";
  }
}