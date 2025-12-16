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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Log request details for debugging
    console.log('Request received:', {
      method: req.method,
      url: req.url,
      contentType: req.headers.get('content-type'),
      contentLength: req.headers.get('content-length')
    });

    // Parse request body with better error handling
    let requestBody: ChatRequest;
    let rawBody: string | null = null;
    
    try {
      // Try to read the raw body first for debugging
      const bodyText = await req.text();
      rawBody = bodyText;
      console.log('Raw request body:', {
        length: bodyText.length,
        preview: bodyText.substring(0, 200),
        isEmpty: bodyText.trim().length === 0
      });
      
      if (!bodyText || bodyText.trim().length === 0) {
        console.error('Request body is empty');
        return new Response(
          JSON.stringify({ error: 'Request body is required and cannot be empty' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      requestBody = JSON.parse(bodyText);
      console.log('Parsed request body:', { 
        hasPrompt: !!requestBody.prompt, 
        promptType: typeof requestBody.prompt,
        promptLength: requestBody.prompt?.length || 0,
        promptPreview: requestBody.prompt ? requestBody.prompt.substring(0, 100) : 'N/A',
        hasUserId: !!requestBody.userId,
        userIdType: typeof requestBody.userId,
        hasImage: !!requestBody.image,
        imageLength: requestBody.image?.length || 0,
        fullBodyKeys: Object.keys(requestBody)
      });
    } catch (parseError) {
      console.error('Failed to parse request body:', {
        error: parseError instanceof Error ? parseError.message : String(parseError),
        stack: parseError instanceof Error ? parseError.stack : undefined,
        rawBodyPreview: rawBody ? rawBody.substring(0, 200) : 'null',
        rawBodyLength: rawBody?.length || 0
      });
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { prompt, userId, image } = requestBody;
    
    // Validate prompt with detailed logging
    if (!prompt) {
      console.error('Prompt is missing:', { requestBody });
      return new Response(
        JSON.stringify({ error: 'Prompt is required and must be a non-empty string' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (typeof prompt !== 'string') {
      console.error('Prompt is not a string:', { prompt, type: typeof prompt });
      return new Response(
        JSON.stringify({ error: 'Prompt must be a string' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0) {
      console.error('Prompt is empty after trimming:', { originalLength: prompt.length });
      return new Response(
        JSON.stringify({ error: 'Prompt cannot be empty' }),
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
    
    if (userId && typeof userId === 'string' && userId.trim().length > 0) {
      try {
        const { data: secret, error: secretError } = await supabaseAdmin
          .from('user_secrets')
          .select('api_key_encrypted')
          .eq('user_id', userId.trim())
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
    > = [{ text: trimmedPrompt }];

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
    console.log('Calling Gemini API:', { url: GEMINI_API_URL, hasImage: !!image, promptLength: trimmedPrompt.length });
    
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
