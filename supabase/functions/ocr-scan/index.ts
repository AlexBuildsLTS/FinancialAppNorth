import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';
import { decryptMessage } from '../_shared/crypto.ts';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface OcrRequest {
  imageBase64: string;
  userId?: string;
}

interface OcrResponse {
  merchant?: string;
  date?: string;
  total?: number;
  currency?: string;
  category?: string;
  items?: Array<{ name: string; price: number }>;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { imageBase64, userId }: OcrRequest = await req.json();
    
    if (!imageBase64) {
      throw new Error("No image data provided.");
    }

    // Validate base64 format
    const base64Pattern = /^data:image\/[a-z]+;base64,|^[A-Za-z0-9+/=]+$/;
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    if (!base64Pattern.test(cleanBase64)) {
      throw new Error("Invalid image format. Expected base64 encoded image.");
    }

    // 1. Setup Admin Client
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
    
    // 2. Resolve API Key (System or User Custom)
    let apiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (userId) {
      try {
        const { data: secret, error: secretError } = await supabaseAdmin
          .from("user_secrets")
          .select("api_key_encrypted")
          .eq("user_id", userId)
          .eq("service", "gemini")
          .maybeSingle();
          
        if (secretError) {
          console.warn("Error fetching user secret:", secretError.message);
        } else if (secret?.api_key_encrypted) {
          try {
            apiKey = decryptMessage(secret.api_key_encrypted);
          } catch (decryptError) {
            console.warn("Failed to decrypt user key, using system key:", decryptError);
            // Fallback to system key
          }
        }
      } catch (e) {
        console.warn("User key retrieval failed, using system key:", e);
      }
    }

    if (!apiKey) {
      throw new Error("AI Configuration Missing: No Gemini API key available.");
    }

    // 3. Construct OCR Prompt
    const prompt = `
      Analyze this receipt image and extract financial transaction data.
      Return ONLY valid JSON (no markdown, no code blocks, no explanations):
      {
        "merchant": "string (business name)",
        "date": "YYYY-MM-DD (ISO format, use today if not visible)",
        "total": number (total amount as positive number),
        "currency": "USD" | "EUR" | "SEK" | "GBP" | "JPY",
        "category": "string (best fit: Food, Travel, Utilities, Entertainment, Shopping, Health, Business, Other)",
        "items": [{"name": "string", "price": number}]
      }
      
      Rules:
      - If date is not visible, use today's date in YYYY-MM-DD format
      - Total must be a positive number
      - Currency should be inferred from symbols or text
      - Category should be one of the listed options
      - Items array can be empty if not itemized
    `;

    // 4. Call Gemini Vision API
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { 
              inline_data: { 
                mime_type: "image/jpeg", 
                data: cleanBase64 
              } 
            }
          ]
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`OCR API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) {
      throw new Error("OCR failed: No text extracted from image.");
    }

    // 5. Parse and Clean JSON Response
    let cleanJson = rawText.trim();
    
    // Remove markdown code blocks if present
    cleanJson = cleanJson.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Remove any leading/trailing whitespace or newlines
    cleanJson = cleanJson.replace(/^\s+|\s+$/g, '');
    
    // Try to extract JSON if wrapped in other text
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
    }

    let ocrResult: OcrResponse;
    try {
      ocrResult = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw response:", rawText);
      throw new Error("Failed to parse OCR response as JSON. The AI may have returned invalid format.");
    }

    // 6. Validate and Normalize Response
    if (!ocrResult.total || ocrResult.total <= 0) {
      throw new Error("Invalid total amount extracted from receipt.");
    }

    // Ensure date is in correct format
    if (ocrResult.date) {
      const dateMatch = ocrResult.date.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        ocrResult.date = dateMatch[1];
      } else {
        // Use today if date parsing fails
        ocrResult.date = new Date().toISOString().split('T')[0];
      }
    } else {
      ocrResult.date = new Date().toISOString().split('T')[0];
    }

    // Default currency if missing
    if (!ocrResult.currency) {
      ocrResult.currency = "USD";
    }

    // Default category if missing
    if (!ocrResult.category) {
      ocrResult.category = "Other";
    }

    // 7. Success Response
    return new Response(JSON.stringify(ocrResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("OCR Scan Error:", error);
    
    const errorResponse: OcrResponse = {
      error: error.message || "An unexpected error occurred during OCR processing."
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
