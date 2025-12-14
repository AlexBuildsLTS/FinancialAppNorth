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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Get API Key (check user's custom key first)
    let apiKey = Deno.env.get('GEMINI_API_KEY');
    if (userId) {
      const { data: secret } = await supabaseAdmin
        .from('user_secrets')
        .select('api_key_encrypted')
        .eq('user_id', userId)
        .eq('service', 'gemini')
        .maybeSingle();
      if (secret?.api_key_encrypted) {
        apiKey = decryptMessage(secret.api_key_encrypted);
      }
    }
    if (!apiKey) throw new Error('Server configuration error: No AI Key.');

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

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

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
