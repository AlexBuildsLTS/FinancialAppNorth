import { createClient } from "npm:@supabase/supabase-js"
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. Setup Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const authHeader = req.headers.get('Authorization')!

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } }
    })
    
    // Service client for privileged actions (fetching secrets/files)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 2. Get User ID
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { documentPath } = await req.json()
    if (!documentPath) throw new Error('No document path provided')

    // 3. DETERMINE WHICH API KEY TO USE
    // Priority: User's Personal Key -> System Fallback Key
    let geminiKey = Deno.env.get('GEMINI_API_KEY')
    
    // Check if user has their own key in user_secrets
    const { data: userSecret } = await supabaseAdmin
      .from('user_secrets')
      .select('gemini_key')
      .eq('user_id', user.id)
      .single()

    if (userSecret?.gemini_key) {
      geminiKey = userSecret.gemini_key
      console.log(`Using personal Gemini key for user ${user.id}`)
    } else {
      console.log(`Using system Gemini key`)
    }

    if (!geminiKey) throw new Error('No AI configuration found. Please add a Gemini API Key in Settings.')

    // 4. Download Image from Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from('documents')
      .download(documentPath)

    if (downloadError) throw downloadError

    // 5. Prepare for Gemini (Convert to Base64)
    const arrayBuffer = await fileData.arrayBuffer()
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const mimeType = fileData.type || 'image/jpeg'

    // 6. Call Gemini API (Vision)
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
      Analyze this financial document (receipt/invoice). 
      Extract the following data strictly as JSON:
      - merchant_name (string)
      - date (YYYY-MM-DD format, string)
      - total_amount (number)
      - tax_amount (number, 0 if not found)
      - currency (ISO code e.g. USD, EUR)
      - category (guess one: Food, Transport, Utilities, Entertainment, Business, Shopping)
      
      Return ONLY the JSON string. No markdown formatting.
    `

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ])

    const response = await result.response
    const text = response.text()

    // Clean up potential markdown code blocks (```json ... ```)
    const jsonString = text.replace(/```json|```/g, '').trim()
    let extractedData
    try {
      extractedData = JSON.parse(jsonString)
    } catch (_e) { // Renamed 'e' to '_e' to indicate it's intentionally unused
      console.error("Failed to parse AI response:", text)
      throw new Error("Failed to parse document data")
    }

    return new Response(JSON.stringify({ success: true, data: extractedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('OCR Error:', error instanceof Error ? error.message : error) // Added type assertion for 'error'
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "An unknown error occurred" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})