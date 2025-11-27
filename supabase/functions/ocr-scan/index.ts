import { createClient } from "@supabase/supabase-js"
import { GoogleGenerativeAI } from "@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const authHeader = req.headers.get('Authorization')!

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } }
    })
    
    // Admin client to read secrets (bypassing RLS if needed, though user policy should allow it)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { documentPath } = await req.json()
    if (!documentPath) throw new Error('No document path provided')

    // 1. Get API Key (FIXED COLUMN NAME)
    let geminiKey = Deno.env.get('GEMINI_API_KEY')
    
    // Try to get user's key if system key is missing
    if (!geminiKey) {
        const { data: userSecret } = await supabaseAdmin
        .from('user_secrets')
        .select('api_key_encrypted') // FIX: Correct column name from schema
        .eq('user_id', user.id)
        .eq('service', 'gemini')
        .single()

        if (userSecret?.api_key_encrypted) {
            geminiKey = userSecret.api_key_encrypted
        }
    }

    if (!geminiKey) throw new Error('No AI configuration found. Please add a Gemini API Key in Settings.')

    // 2. Download File
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from('documents')
      .download(documentPath)

    if (downloadError) throw downloadError

    // 3. Process Image
    const arrayBuffer = await fileData.arrayBuffer()
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const mimeType = fileData.type || 'image/jpeg'

    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
      Analyze this financial document (receipt or invoice). 
      Extract the following fields strictly as JSON:
      - merchant_name (string)
      - date (YYYY-MM-DD)
      - total_amount (number)
      - tax_amount (number)
      - currency (ISO code, default to user's currency if unknown)
      - category (Food, Transport, Utilities, Entertainment, Business, Shopping)
      Return ONLY valid JSON, no markdown formatting.
    `

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: mimeType } }
    ])

    const response = await result.response
    const text = response.text()
    
    // Clean Response (remove ```json fences)
    const jsonString = text.replace(/```json|```/g, '').trim()
    const extractedData = JSON.parse(jsonString)

    return new Response(JSON.stringify({ success: true, data: extractedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('OCR Error:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})