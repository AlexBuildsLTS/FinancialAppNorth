import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';
import { decryptMessage } from '../_shared/crypto.ts';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface ChatRequest {
  prompt: string;
  userId?: string;
  image?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders });

  try {
    const { prompt, userId, image }: ChatRequest = await req.json();
    if (!prompt) throw new Error('No prompt provided.');

    // 1. Init Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 2. Get API Key (check user's custom key first, fallback to system key)
    let apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (userId) {
      try {
        const { data: secret, error: secretError } = await supabaseAdmin
          .from('user_secrets')
          .select('api_key_encrypted')
          .eq('user_id', userId)
          .eq('service', 'gemini')
          .maybeSingle();
          
        if (secretError) {
          console.warn('Error fetching user secret:', secretError.message);
        } else if (secret?.api_key_encrypted) {
          try {
            apiKey = decryptMessage(secret.api_key_encrypted);
          } catch (decryptError) {
            console.warn('Failed to decrypt user key, using system key:', decryptError);
            // Fallback to system key if decryption fails
          }
        }
      } catch (e) {
        console.warn('User key retrieval failed, using system key:', e);
      }
    }
    
    if (!apiKey) {
      throw new Error('Server configuration error: No AI Key available.');
    }

    // 3. Build request parts
    const parts: Array<
      { text: string } | { inline_data: { mime_type: string; data: string } }
    > = [{ text: prompt }];

    if (image) {
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: image,
        },
      });
    }

    // 4. Call Gemini AI
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`AI API failed: ${response.status} ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      throw new Error('AI returned empty response');
    }

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('AI Chat Error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
