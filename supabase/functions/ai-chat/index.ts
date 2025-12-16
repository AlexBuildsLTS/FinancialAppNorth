import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';
import { decryptMessage } from '../_shared/crypto.ts';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface ChatRequest {
  prompt: string;
  userId?: string;
  image?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders });

  try {
    // Parse request body with better error handling
    let requestBody: ChatRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { prompt, userId, image } = requestBody;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required and must be a non-empty string' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 1. Init Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 2. Get API Key (check user's custom key first, fallback to system key)
    let apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (userId && typeof userId === 'string') {
      try {
        const { data: secret, error: secretError } = await supabaseAdmin
          .from('user_secrets')
          .select('api_key_encrypted')
          .eq('user_id', userId)
          .eq('service', 'gemini')
          .maybeSingle();
          
        if (secretError) {
          console.warn('Error fetching user secret:', secretError.message);
        } else if (secret?.api_key_encrypted) {
          try {
            apiKey = decryptMessage(secret.api_key_encrypted);
          } catch (decryptError) {
            console.warn('Failed to decrypt user key, using system key:', decryptError);
            // Fallback to system key if decryption fails
          }
        }
      } catch (e) {
        console.warn('User key retrieval failed, using system key:', e);
      }
    }
    
    if (!apiKey || apiKey.trim().length === 0) {
      console.error('No API key available');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: No AI Key available. Please configure GEMINI_API_KEY or provide a user API key.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Build request parts
    const parts: Array<
      { text: string } | { inline_data: { mime_type: string; data: string } }
    > = [{ text: prompt.trim() }];

    if (image && typeof image === 'string' && image.length > 0) {
      // Remove data URL prefix if present
      const base64Data = image.includes(',') ? image.split(',')[1] : image;
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: base64Data,
        },
      });
    }

    // 4. Call Gemini AI
    const apiUrl = `${GEMINI_API_URL}?key=${apiKey}`;
    console.log('Calling Gemini API:', { url: GEMINI_API_URL, hasImage: !!image, promptLength: prompt.length });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return new Response(
        JSON.stringify({ 
          error: `AI API failed: ${response.status} ${response.statusText}`,
          details: errorText.substring(0, 200) // Limit error details length
        }),
        {
          status: response.status >= 400 && response.status < 500 ? response.status : 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text || text.trim().length === 0) {
      console.error('AI returned empty response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'AI returned empty response' }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('AI Chat Error:', {
      message: errorMessage,
      stack: errorStack
    });
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        type: error instanceof Error ? error.constructor.name : 'Unknown'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
