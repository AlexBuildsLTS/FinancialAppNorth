import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';
import { decryptMessage } from '../_shared/crypto.ts';

// Initialize standard Gemini URL
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

Deno.serve(async (req) => {
  // 1. Handle CORS (Browser pre-flight requests)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, userId } = await req.json();

    if (!text) throw new Error("No text provided for analysis.");

    // 2. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 3. Robust Key Retrieval Strategy
    // Priority 1: Check User's Custom Key in DB
    // Priority 2: Use System Environment Variable (Fallback)
    let apiKey = Deno.env.get("GEMINI_API_KEY");

    if (userId) {
       const { data: secret } = await supabaseAdmin
         .from("user_secrets")
         .select("api_key_encrypted")
         .eq("user_id", userId)
         .eq("service", "gemini")
         .maybeSingle();
         
       if (secret?.api_key_encrypted) {
          try {
            const decryptedKey = decryptMessage(secret.api_key_encrypted);
            if (decryptedKey) {
              apiKey = decryptedKey;
            }
          } catch (e) {
            console.warn("Failed to decrypt user key, using system key:", e);
            // Fallback to system key if decryption fails
          }
       }
    }

    if (!apiKey) {
        throw new Error("Server Configuration Error: GEMINI_API_KEY is missing.");
    }

    // 4. Construct the AI Prompt (Strict JSON Engineering)
    const prompt = `
      You are a financial transaction parser.
      Input: "${text}"
      
      Task: Extract transaction details into a JSON object.
      Rules:
      - 'merchant': The entity paid (e.g. "Starbucks", "Uber"). Infer if missing.
      - 'amount': Number only. Absolute value.
      - 'category': Best fit from [Food, Travel, Utilities, Entertainment, Shopping, Health, Business, Income].
      - 'date': ISO 8601 format (YYYY-MM-DD). Use today if not specified.
      - 'type': 'expense' or 'income'.
      
      Output JSON ONLY. No markdown formatting.
    `;

    // 5. Call Google Gemini
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error: ${errText}`);
    }

    const data = await response.json();
    
    // 6. Parse and Clean Response
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("AI returned empty response.");

    // Remove markdown code blocks if present
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const transaction = JSON.parse(cleanJson);

    // 7. Success Response
    return new Response(JSON.stringify({ transaction }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Smart Ledger Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
