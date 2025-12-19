// deno-lint-ignore-file
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import CryptoJS from 'https://esm.sh/crypto-js@4.2.0';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// --- Shared Logic ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Types ---
interface TextPart {
  text: string;
}

interface InlineDataPart {
  inline_data: {
    mime_type: string;
    data: string;
  };
}

type Part = TextPart | InlineDataPart;

// --- Helper: Decrypt User Keys ---
function decryptMessage(cipherText: string): string | null {
  try {
    const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY');
    if (!ENCRYPTION_KEY) {
        console.warn("Server Warning: ENCRYPTION_KEY not set.");
        return null;
    }
    if (!cipherText) return null;

    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    return originalText || null;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

// --- Main Handler ---
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (_e) {
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

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
        // Return 500 explicitly instead of crashing
        return new Response(JSON.stringify({ error: 'Critical: Missing SUPABASE_URL or SERVICE_ROLE_KEY' }), {
           status: 500,
           headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Resolve API Key
    let apiKey = Deno.env.get('GEMINI_API_KEY');

    // If User ID is present, try to fetch their custom encrypted key
    if (userId) {
      const { data: secret } = await supabase
        .from('user_secrets')
        .select('api_key_encrypted')
        .eq('user_id', userId)
        .eq('service', 'gemini')
        .maybeSingle();

      if (secret?.api_key_encrypted) {
        const decryptedKey = decryptMessage(secret.api_key_encrypted);
        if (decryptedKey) {
            apiKey = decryptedKey; // Override with user key
        }
      }
    }

    if (!apiKey) {
      console.error("No API key found in env or user secrets");
      return new Response(JSON.stringify({ error: 'AI Service not configured (Missing API Key)' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Construct Payload
    const parts: Part[] = [{ text: prompt }];
    
    if (image) {
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: image
        }
      });
    }

    // Call Gemini
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error("Gemini API Error:", geminiRes.status, errorText);
      return new Response(JSON.stringify({ 
        error: 'AI Provider Error', 
        details: `Gemini responded with ${geminiRes.status}` 
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Fatal Function Error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});