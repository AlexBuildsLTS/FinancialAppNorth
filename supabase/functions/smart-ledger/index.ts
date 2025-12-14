import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';
import { decryptMessage } from '../_shared/crypto.ts';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders });

  try {
    const { text, userId } = await req.json();
    if (!text) throw new Error('No text provided.');

    // 1. Get Key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    let apiKey = Deno.env.get('GEMINI_API_KEY');

    if (userId) {
      const { data: secret } = await supabaseAdmin
        .from('user_secrets')
        .select('api_key_encrypted')
        .eq('user_id', userId)
        .eq('service', 'gemini')
        .maybeSingle();
      if (secret && secret.api_key_encrypted) {
        apiKey = decryptMessage(secret.api_key_encrypted);
      }
    }

    if (!apiKey) {
      throw new Error('Could not find API Key.');
    }

    // 2. AI Prompt
    const prompt = `
      Extract transaction data from: "${text}".
      Return ONLY valid JSON:
      {
        "merchant": string (e.g. "Shell"),
        "amount": number (positive),
        "category": string (Food, Transport, Utilities, Shopping, Income, Other),
        "date": "YYYY-MM-DD" (use today if missing),
        "type": "expense" or "income"
      }
    `;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanJson = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const transaction = JSON.parse(cleanJson);

    // 3. Save directly to DB (Optional, or return to frontend to confirm)
    // We return it to frontend so user can confirm before saving
    return new Response(JSON.stringify({ transaction }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
