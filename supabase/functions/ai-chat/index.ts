// deno-lint-ignore no-import-prefix
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';
import { decryptMessage } from '../_shared/crypto.ts';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// --- Type Definitions ---
interface TextPart {
  text: string;
}

interface InlineDataPart {
  inline_data: {
    mime_type: string;
    data: string;
  };
}

// Union type to satisfy TypeScript checks
type Part = TextPart | InlineDataPart;

Deno.serve(async (req) => {
  // 1. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Parse Body safely
    let body;
    try {
      body = await req.json();
    } catch (_e) { // Prefixed with _ to ignore unused variable warning
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { prompt, userId, image } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Initialize Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4. Get API Key
    let apiKey = Deno.env.get('GEMINI_API_KEY');

    // If User ID provided, check for custom key
    if (userId) {
      const { data: secret } = await supabase
        .from('user_secrets')
        .select('api_key_encrypted')
        .eq('user_id', userId)
        .eq('service', 'gemini')
        .single();

      if (secret?.api_key_encrypted) {
        try {
          const decrypted = decryptMessage(secret.api_key_encrypted);
          if (decrypted) apiKey = decrypted;
        } catch (e) {
          console.error("Failed to decrypt user key:", e);
        }
      }
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'No API Key configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 5. Construct Gemini Payload
    // We explicitly type 'parts' as Part[] to fix the 'inline_data' error
    const parts: Part[] = [{ text: prompt }];
    
    if (image) {
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: image
        }
      });
    }

    // 6. Call Gemini
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error("Gemini API Error:", errorText);
      return new Response(JSON.stringify({ error: 'AI Service Error', details: errorText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    // Type guard for unknown error
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Function Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});