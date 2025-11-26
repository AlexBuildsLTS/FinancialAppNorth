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

    // Create Client
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } }
    })
    
    // Admin Client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Verify User
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { documentPath } = await req.json()
    if (!documentPath) throw new Error('No document path provided')

    // Get API Key
    let geminiKey = Deno.env.get('GEMINI_API_KEY')
    
    const { data: userSecret } = await supabaseAdmin
      .from('user_secrets')
      .select('gemini_key')
      .eq('user_id', user.id)
      .single()

    if (userSecret?.gemini_key) {
      geminiKey = userSecret.gemini_key
    }

    if (!geminiKey) throw new Error('No AI configuration found. Please add a Gemini API Key in Settings.')

    // Download File
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from('documents')
      .download(documentPath)

    if (downloadError) throw downloadError

    // Prepare Image
    const arrayBuffer = await fileData.arrayBuffer()
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const mimeType = fileData.type || 'image/jpeg'

    // Call Gemini
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
      Analyze this financial document. 
      Extract strictly as JSON:
      - merchant_name (string)
      - date (YYYY-MM-DD)
      - total_amount (number)
      - tax_amount (number)
      - currency (ISO code)
      - category (Food, Transport, Utilities, Entertainment, Business, Shopping)
      Return ONLY valid JSON.
    `

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: mimeType } }
    ])

    const response = await result.response
    const text = response.text()
    
    // Clean Response
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