import { supabase } from '../lib/supabase';

/**
 * 🚀 Gemini AI Service
 * Communicates with the Supabase Edge Function to get AI responses.
 */
export async function generateContent(
  prompt: string, 
  userId?: string, 
  image?: string, 
  isJsonMode: boolean = false
): Promise<string> {
  if (!prompt?.trim()) return "Please enter a message.";

  try {
    let cleanImage = undefined;
    if (image && image.length > 0) {
       // Strip standard data:image/jpeg;base64, prefix if present
       cleanImage = image.includes('base64,') ? image.split('base64,')[1] : image;
    }

    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { 
        prompt: prompt.trim(), 
        userId, 
        image: cleanImage 
      }
    });

    if (error) {
      console.error('[Gemini Service] Edge Function Invocation Error:', error);
      throw error;
    }

    const text = data?.text || "";

    if (isJsonMode) {
        // Remove markdown code blocks (```json ... ```)
        return text.replace(/```json|```/g, '').trim();
    }

    // Clean standard JSON artifacts if the model accidentally returns a JSON string
    const cleanText = text
      .replace(/^\{\s*"text":\s*"/i, '') 
      .replace(/"\s*\}$/, '')
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .trim();

    return cleanText || "The AI brain processed your request but returned no text.";

  } catch (err: any) {
    console.error('[Gemini] Service Exception:', err);
    return "The AI system is temporarily unavailable. Please try again in a few seconds.";
  }
}