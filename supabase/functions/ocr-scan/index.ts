import { createClient } from "jsr:@supabase/supabase-js@2"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } }
    })
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 2. Auth Check
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    // 3. Parse Request
    const { documentPath } = await req.json()
    if (!documentPath) throw new Error('No document path provided')

    // 4. Get API Key
    let geminiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!geminiKey) {
        const { data: userSecret } = await supabaseAdmin
        .from('user_secrets')
        .select('api_key_encrypted')
        .eq('user_id', user.id)
        .eq('service', 'gemini')
        .maybeSingle()

        if (userSecret?.api_key_encrypted) {
            geminiKey = userSecret.api_key_encrypted
        }
    }

    if (!geminiKey) throw new Error('No AI configuration found. Please add a Gemini API Key in Settings.')

    // 5. Download File
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from('documents')
      .download(documentPath)

    if (downloadError) throw new Error(`Download failed: ${downloadError.message}`)

    // 6. Prepare Image
    const arrayBuffer = await fileData.arrayBuffer()
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    // Default to jpeg if mimeType is missing
    const mimeType = fileData.type || 'image/jpeg'

    // 7. AI Processing
    const genAI = new GoogleGenerativeAI(geminiKey)
    
    // Use the stable model ID
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) 

    const prompt = `
      Analyze this financial document (receipt or invoice). 
      Extract fields strictly as JSON:
      - merchant_name (string)
      - date (YYYY-MM-DD)
      - total_amount (number)
      - category (string: Food, Transport, Utilities, Business, Shopping, Other)

      If a field is not found or unclear, set it to null.
      Return ONLY valid JSON. Do not use markdown blocks.
    `

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: mimeType } }
    ])

    const response = await result.response
    const text = response.text()
    console.log("OCR Raw Output:", text)

    // 8. Robust JSON Parsing
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim()
    
    let extractedData
    try {
        extractedData = JSON.parse(cleanJson)
    } catch (e) {
        console.error("JSON Parse Error:", e)
        throw new Error("Failed to parse AI response.")
    }

    return new Response(JSON.stringify({ success: true, data: extractedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error('OCR Error:', errorMessage)
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})