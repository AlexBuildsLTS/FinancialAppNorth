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
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

    const { prompt } = await req.json();
    if (!prompt) throw new Error('Prompt is missing');

    // 1. Construct the request with safety overrides
    // We set thresholds to BLOCK_NONE so it doesn't return "UNKNOWN" or empty responses for financial data
    const geminiBody = {
      contents: [{ parts: [{ text: prompt }] }],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody)
    });

    const data = await geminiRes.json();

    // 2. Comprehensive Response Parsing
    const candidate = data.candidates?.[0];
    let outputText = "";

    if (candidate?.content?.parts?.[0]?.text) {
      outputText = candidate.content.parts[0].text;
    } else {
      // If we are here, the model returned a 200 but no text.
      // This usually means it didn't like the prompt structure.
      console.error("Gemini Raw Error Response:", JSON.stringify(data));
      
      const finishReason = candidate?.finishReason || "EMPTY_RESPONSE";
      
      if (finishReason === "SAFETY") {
          outputText = "I analyzed your request, but I cannot provide a response due to safety filters. Please try rephrasing.";
      } else if (finishReason === "OTHER" || finishReason === "RECITATION") {
          outputText = "The AI was unable to generate a response for this specific query. Try a different question.";
      } else {
          // Absolute fallback: If Gemini fails, give a basic financial response based on the prompt
          outputText = "I'm currently having trouble generating a detailed response. Please check your financial dashboard for live updates.";
      }
    }

    return new Response(JSON.stringify({ text: outputText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Handler Error:", error.message);
    return new Response(JSON.stringify({ text: `Connection Error: ${error.message}` }), {
      status: 200, // Return 200 so the UI displays the error instead of crashing
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});