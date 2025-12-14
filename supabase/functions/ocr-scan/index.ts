import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders });

  try {
    const { documentPath, userId } = await req.json(); // Accept userId to look up custom keys
    if (!documentPath) throw new Error('No document path provided');

    // 1. Init Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Get API Key (Robust logic)
    let apiKey = Deno.env.get('GEMINI_API_KEY');
    if (userId) {
      const { data: secret } = await supabaseAdmin
        .from('user_secrets')
        .select('api_key_encrypted')
        .eq('user_id', userId)
        .eq('service', 'gemini')
        .maybeSingle();
      if (secret?.api_key_encrypted) apiKey = secret.api_key_encrypted;
    }
    if (!apiKey) throw new Error('Server configuration error: No AI Key.');

    // 3. Download File
    const { data: fileData, error: dlError } = await supabaseAdmin.storage
      .from('documents')
      .download(documentPath);
    if (dlError) throw new Error(`Download failed: ${dlError.message}`);

    // 4. Encode Image
    const arrayBuffer = await fileData.arrayBuffer();
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    // 5. Call AI
    const prompt = `
      Analyze this receipt/invoice. Return ONLY valid JSON:
      {
        "merchant_name": string,
        "date": "YYYY-MM-DD",
        "total_amount": number,
        "category": string (Food, Transport, Utilities, Business, Shopping, Other)
      }
      If fields are missing, set to null.
    `;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: fileData.type || 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // 6. Parse & Clean
    const cleanJson = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const extractedData = JSON.parse(cleanJson);

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
