import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { decryptMessage } from '../_shared/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase Clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    );
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Auth Check: Ensure user is logged in
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    // 3. Parse Request Body
    const { documentPath } = await req.json();
    if (!documentPath) throw new Error('No document path provided');

    // 4. Get Gemini API Key (Check Env first, then DB)
    let geminiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiKey) {
      // Fetch from user_secrets table securely
      const { data: secret } = await supabaseAdmin
        .from('user_secrets')
        .select('api_key_encrypted')
        .eq('user_id', user.id)
        .eq('service', 'gemini')
        .maybeSingle();

      if (secret && secret.api_key_encrypted) {
        geminiKey = decryptMessage(secret.api_key_encrypted);
      }
    }

    if (!geminiKey) {
      throw new Error(
        'No Gemini API Key found. Please add it in Settings > AI Keys.'
      );
    }

    // 5. Download Document from Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('documents')
      .download(documentPath);

    if (downloadError)
      throw new Error(`Download failed: ${downloadError.message}`);

    // 6. Prepare Image Data for Gemini
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    // Default to jpeg if type is missing, Gemini handles most image types
    const mimeType = fileData.type || 'image/jpeg';

    // 7. Call Gemini AI
    const genAI = new GoogleGenerativeAI(geminiKey);

    // "gemini-1.5-flash" is the stable, standard model ID.
    // If you ever get a 404 on this, switch to "gemini-pro" or "gemini-1.5-pro"
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are a financial data extraction assistant.
      Analyze this image (receipt or invoice) and extract data strictly in valid JSON format.
      
      Fields to extract:
      - merchant_name (string, e.g., "Walmart", "Uber")
      - date (string, format YYYY-MM-DD)
      - total_amount (number, just the value, e.g., 24.50)
      - category (string, choose one: Food, Transport, Utilities, Business, Shopping, Other)

      If a field is missing or unreadable, return null for that field.
      Do not wrap the response in markdown blocks (like \`\`\`json). Return ONLY the raw JSON string.
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType: mimeType } },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('Gemini Raw Output:', text); // Useful for debugging in Supabase logs

    // 8. Robust JSON Parsing
    // Strip markdown code blocks if the AI adds them despite instructions
    const cleanJson = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let extractedData;
    try {
      extractedData = JSON.parse(cleanJson);
    } catch (e) {
      console.error('JSON Parse Error:', e);
      throw new Error(
        'Failed to parse AI response. The document might be unclear.'
      );
    }

    // 9. Return Success Response
    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Processing Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Return 400 so the frontend knows it failed
    });
  }
});
