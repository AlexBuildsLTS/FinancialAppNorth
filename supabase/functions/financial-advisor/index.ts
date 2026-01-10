// deno-lint-ignore-file no-import-prefix
import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req): Promise<Response> => {
  // Handle CORS for mobile app requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, userId } = await req.json();

    // 1. Initialize Supabase with Service Role (to bypass RLS for data gathering)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Fetch Context: Get last 20 transactions and active budgets
    const [{ data: transactions }, { data: budgets }] = await Promise.all([
      supabase
        .from('transactions')
        .select('amount, category, description, date')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(20),
      supabase.from('budgets').select('amount, period').eq('user_id', userId),
    ]);

    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // 4. Construct the "Active CFO" System Prompt
    const systemContext = `
      You are the "NorthFinance Active CFO". Your goal is to provide predictive steering for wealth management.
      Current User Data:
      - Recent Transactions: ${JSON.stringify(transactions)}
      - Active Budgets: ${JSON.stringify(budgets)}

      Guidelines:
      1. Be concise and professional.
      2. If you see a spending trend (e.g., high marketing spend), point it out.

    `;

    // 5. Generate Content
    const result = await model.generateContent(systemContext + prompt);
    const response = result.response;
    const text = response.text();

    return new Response(JSON.stringify({ message: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
