import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';
import { decryptMessage } from '../_shared/crypto.ts';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface LedgerRequest {
    text: string;
    userId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { text, userId }: LedgerRequest = await req.json();
    if (!text) throw new Error("No text provided.");

    // 1. Setup Supabase Client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 2. Get API Key (User's or System's)
    let apiKey = Deno.env.get("GEMINI_API_KEY");
    if (userId) {
       const { data: secret } = await supabaseAdmin
         .from("user_secrets")
         .select("api_key_encrypted")
         .eq("user_id", userId)
         .eq("service", "gemini")
         .maybeSingle();
       if (secret?.api_key_encrypted) {
          apiKey = decryptMessage(secret.api_key_encrypted);
       }
    }

    if (!apiKey) throw new Error("AI Configuration Missing");

    // 3. Strict JSON Prompt
    const prompt = `
      Extract transaction data from: "${text}".
      Return ONLY valid JSON (no markdown, no backticks):
      {
        "merchant": string,
        "amount": number,
        "category": string,
        "date": "YYYY-MM-DD" (default to today),
        "type": "expense" | "income"
      }
    `;

    // 4. Call Gemini
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // 5. Clean & Parse
    if (!rawText) throw new Error("AI returned no data");
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Verify it is valid JSON before sending back
    const transaction = JSON.parse(cleanJson);

    return new Response(JSON.stringify({ transaction }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});