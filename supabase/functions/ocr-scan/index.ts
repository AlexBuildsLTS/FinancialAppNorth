import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';
import { decryptMessage } from '../_shared/crypto.ts';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface OcrRequest {
  imageBase64: string;
  userId?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { imageBase64, userId }: OcrRequest = await req.json();
    if (!imageBase64) throw new Error("No image data provided.");

    // 1. Setup Client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // 2. Resolve Key (System or User Custom)
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

    // 3. Prompt
    const prompt = `
      Analyze this receipt. Return ONLY valid JSON (no markdown):
      {
        "merchant": "string",
        "date": "YYYY-MM-DD",
        "total": number,
        "currency": "USD" | "EUR" | "SEK",
        "category": "string",
        "items": [{ "name": "string", "price": number }]
      }
    `;

    // 4. Call Gemini with Image
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
          ]
        }]
      }),
    });

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) throw new Error("OCR failed");

    // Clean markdown from JSON
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return new Response(cleanJson, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});