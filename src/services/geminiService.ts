import { supabase } from '../lib/supabase';

/**
 * 💎 Gemini Service: The bridge between React Native and Supabase Edge Functions.
 * Handles payload formatting, error catching, and response validation.
 */
export async function generateContent(prompt: string, userId?: string, image?: string): Promise<string> {
  // 1. Strict Input Validation
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('Prompt is required and must be a non-empty string');
  }

  const trimmedPrompt = prompt.trim();

  try {
    // 2. Construct Payload
    // We send a plain object. Supabase Client handles the stringify.
    const payload: { prompt: string; userId?: string; image?: string } = {
      prompt: trimmedPrompt,
    };

    if (userId?.trim()) payload.userId = userId.trim();

    // Handle Image cleaning on client side to save bandwidth/processing
    if (image?.trim()) {
      const cleanImage = image.includes(',') ? image.split(',')[1] : image.trim();
      if (cleanImage.length > 0) payload.image = cleanImage;
    }

    console.log('[GeminiService] 📡 Invoking Edge Function...', { promptLen: trimmedPrompt.length, hasImage: !!payload.image });

    // 3. Network Call
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: payload, 
    });

    // 4. Error Handling
    if (error) {
      console.error('[GeminiService] ❌ Edge Function Error:', error);
      
      // Try to parse the Edge Function's custom error message
      let msg = "I'm having trouble connecting to the AI brain.";
      if (error instanceof Error) msg = `AI Error: ${error.message}`;
      
      // Check if context contains body details
      try {
          const body = (error as any).context?.body;
          if (body) {
              const parsed = JSON.parse(body);
              if (parsed.error) msg = parsed.error;
          }
      } catch (e) { /* ignore parse error */ }
      
      return msg;
    }

    // 5. Response Validation
    if (!data || !data.text) {
      return "I analyzed the data but couldn't generate a text response.";
    }

    return data.text;

  } catch (err: any) {
    console.error('[GeminiService] 💥 Critical Failure:', err);
    return "AI Service is temporarily unavailable. Please check your network.";
  }
}