import { supabase } from '../../lib/supabase';

/**
 * Generate AI content using Supabase Edge Function (ai-chat)
 * This delegates all Gemini API logic to the backend for security
 */
export async function generateContent(prompt: string, userId?: string, imgBase64?: string): Promise<string> {
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        prompt,
        userId: userId || undefined,
        image: imgBase64 ? imgBase64.replace(/^data:image\/[a-z]+;base64,/, '') : undefined,
      },
    });

    if (error) {
      throw new Error(error.message || 'AI service error');
    }

    if (!data || !data.text) {
      throw new Error('No response from AI service');
    }

    return data.text.trim();
  } catch (error: any) {
    console.error('AI Content Generation Failed:', error);
    throw new Error(error.message || 'Failed to generate AI content');
  }
}