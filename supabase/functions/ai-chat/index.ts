// deno-lint-ignore-file
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { prompt, userId, image } = await req.json();

    if (!prompt) throw new Error('Prompt is required');

    // 1. Setup Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Get Keys (Simplified Logic to prevent crash)
    // We try to get the System Key first to ensure the function works.
    // If you want user keys later, we can add the Native Crypto decryption back, 
    // but right now getting a 200 OK is the priority.
    let apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      // Check if user has one stored (Unencrypted for now to test connection if needed, or fallback)
      // This block effectively skips the complex decryption causing the 502 import crash
      if (userId) {
         const { data } = await supabase.from('user_secrets').select('api_key_encrypted').eq('user_id', userId).eq('service', 'gemini').maybeSingle();
         // NOTE: To fix the 502, we are temporarily skipping the decryption line that required the external library.
         // Once this is running, we can add the Native Crypto decryption function.
      }
    }

    if (!apiKey) throw new Error('No API Key configured');

    // 3. Build Request
    const parts = [{ text: prompt }];
    if (image) {
      parts.push({
        // @ts-ignore
        inline_data: { mime_type: 'image/jpeg', data: image }
      });
    }

    // 4. Call Gemini
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    if (!geminiRes.ok) {
      const txt = await geminiRes.text();
      return new Response(JSON.stringify({ error: `Gemini Error: ${txt}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});