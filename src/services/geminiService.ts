import { supabase } from '../lib/supabase';

export async function generateContent(prompt: string, userId?: string, image?: string): Promise<string> {
  // 1. Validation
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('Prompt is required and must be a non-empty string');
  }

  const trimmedPrompt = prompt.trim();

  try {
    // 2. Prepare Payload (Plain Object)
    const payload: { prompt: string; userId?: string; image?: string } = {
      prompt: trimmedPrompt,
    };

    if (userId?.trim()) {
      payload.userId = userId.trim();
    }

    if (image?.trim()) {
      // Send only the base64 part if it contains the data prefix
      payload.image = image.includes(',') ? image.split(',')[1] : image.trim();
    }

    console.log('[GeminiService] Invoking Edge Function:', { 
      promptLength: trimmedPrompt.length,
      hasUserId: !!payload.userId,
      hasImage: !!payload.image
    });

    // 3. Invoke Edge Function
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: payload, // Supabase client handles JSON.stringify automatically
    });

    // 4. Handle Response
    if (error) {
      console.error('[GeminiService] Edge Function Error:', error);
      
      // Try to parse error details if available
      let errorMessage = "I'm having trouble connecting to the AI brain.";
      
      if (error instanceof Error) {
        // Check for specific Supabase function errors
        try {
          // Sometimes the error context body contains the real JSON error from the server
          const contextBody = (error as any).context?.body;
          if (contextBody) {
             const parsed = typeof contextBody === 'string' ? JSON.parse(contextBody) : contextBody;
             if (parsed.error) errorMessage = `AI Error: ${parsed.error}`;
          }
        } catch (e) {
          // Fallback to basic message
          errorMessage = `AI Error: ${error.message}`;
        }
      }
      return errorMessage;
    }

    if (!data || !data.text) {
      console.warn('[GeminiService] Empty response received:', data);
      return "I analyzed your request but couldn't generate a text response.";
    }

    return data.text;

  } catch (err: any) {
    console.error('[GeminiService] Critical Failure:', err);
    return "AI Service is temporarily unavailable. Please try again later.";
  }
}