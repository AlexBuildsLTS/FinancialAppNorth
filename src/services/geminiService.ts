import { supabase } from '../lib/supabase';

/**
 * 💎 NorthFinance Unified Gemini Bridge
 * Handles Chat, Vision (OCR), and JSON Extraction.
 */
export async function generateContent(
  prompt: string, 
  userId?: string, 
  image?: string, 
  isJsonMode: boolean = false
): Promise<string> {
  if (!prompt?.trim()) return "No prompt provided.";

  try {
    console.log(`[GeminiService] 📡 Invoking 'ai-chat'... Prompt length: ${prompt.length}`);

    // Increased timeout for complex financial reasoning (45 seconds)
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { 
        prompt: prompt.trim(), 
        userId, 
        image: image ? (image.includes(',') ? image.split(',')[1] : image) : undefined 
      }
    });

    if (error) {
      console.error('[GeminiService] ❌ Invocation Error:', error);
      // Return the specific error for debugging
      return `Error: ${error.message || 'The connection was interrupted.'}`;
    }

    if (!data) return "No data returned from AI.";

    // Logic: If we expect JSON (like for transaction logging), we want the rawest string.
    // If it's a chat, we use the "Paranoid Parser" to clean artifacts like "{text:}"
    
    let text = "";
    if (typeof data === 'object' && data.text) {
      text = data.text;
    } else if (typeof data === 'string') {
      text = data;
    } else {
      text = JSON.stringify(data);
    }

    if (isJsonMode) {
       // Just return the rawest string to let the caller handle JSON.parse
       return text.replace(/```json|```/g, '').trim();
    }

    // Paranoid Parser for Chat UI
    return text
      .replace(/^{?\s*"?text"?\s*:\s*/i, '') // Remove start "text:"
      .replace(/}\s*$/, '')                   // Remove end "}"
      .replace(/^"|"$/g, '')                  // Remove surrounding quotes
      .trim();

  } catch (err: any) {
    console.error('[GeminiService] 💥 System Failure:', err);
    return "The system is currently unable to reach the AI brain. Please check your internet.";
  }
}