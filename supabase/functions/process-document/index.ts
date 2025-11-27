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
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { documentPath } = await req.json()
    if (!documentPath) throw new Error('No document path provided')

    // 1. Get API Key
    let geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) {
        const { data: secret } = await supabaseAdmin
          .from('user_secrets')
          .select('api_key_encrypted')
          .eq('user_id', user.id)
          .eq('service', 'gemini')
          .single()
        if (secret) geminiKey = secret.api_key_encrypted
    }
    if (!geminiKey) throw new Error('No Gemini API Key found.')

    // 2. Download
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from('documents')
      .download(documentPath)
    if (downloadError) throw downloadError

    // 3. Process
    const arrayBuffer = await fileData.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const mimeType = fileData.type || 'application/pdf'

    // 4. AI Extraction
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
      Extract strictly as JSON:
      - merchant_name (string)
      - date (YYYY-MM-DD)
      - total_amount (number)
      - category (string)
    `

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType: mimeType } }
    ])

    const text = result.response.text()
    const jsonString = text.replace(/```json|```/g, '').trim()
    const extractedData = JSON.parse(jsonString)

    return new Response(JSON.stringify({ success: true, data: extractedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) { // FIX: Added type annotation
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})