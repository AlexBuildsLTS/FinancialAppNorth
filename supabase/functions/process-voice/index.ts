import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from '../_shared/cors.ts';
import { decryptMessage } from '../_shared/crypto.ts';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

Deno.serve(async (req) => {
  // 1. Handle CORS
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { audioUrl, userId } = await req.json();
    if (!audioUrl) throw new Error("No audio URL provided.");

    // 2. Setup Supabase Client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 3. Resolve API Key (System vs User Custom)
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
             apiKey = decryptMessage(secret.api_key_encrypted);
           } catch (_e) {
             console.warn("Failed to decrypt user key, falling back to system key");
           }
       }
    }

    if (!apiKey) throw new Error("AI Configuration Missing (No Gemini Key found)");

    // 4. Download Audio File from Storage
    const fileResponse = await fetch(audioUrl);
    if (!fileResponse.ok) throw new Error(`Failed to download audio: ${fileResponse.statusText}`);
    
    const arrayBuffer = await fileResponse.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // 5. Construct Prompt for Gemini 1.5 Flash (Multimodal)
    const prompt = `
      Listen to this voice command. 
      Transcribe it exactly, then extract the financial details into this strict JSON format (no markdown):
      { 
        "text": "The exact transcription of what was said",
        "merchant": "The merchant name or 'Unknown'",
        "amount": number (positive for income, negative for expense),
        "currency": "USD" (or inferred),
        "category": "Food/Transport/Bills/Salary/etc"
      }
      If the user says "Spent 50", amount is -50. If "Received 50", amount is 50.
    `;

    // 6. Call Gemini API
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "audio/mp3", data: base64Audio } } 
            // Note: Mime type might need adjustment based on upload (m4a/mp3), 
            // but Gemini is generally lenient with "audio/mp3" or "audio/wav" for standard containers.
          ]
        }]
      }),
    });

    const data = await geminiResponse.json();
    
    if (data.error) {
      console.error("Gemini Error:", data.error);
      throw new Error(data.error.message || "AI Processing Error");
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("No transcription generated.");

    // 7. Clean and Return
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return new Response(cleanJson, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Edge Function Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});