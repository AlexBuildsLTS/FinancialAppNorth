// deno-lint-ignore-file
import { createClient } from "@supabase/supabase-js";

// Inline CORS to prevent relative import 502/504 errors
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

console.log("🚀 Webhook Ingest Function: Online and Stable");

Deno.serve(async (req) => {
  // 1. Handle CORS Preflight immediately
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Security Check: Validate Secret
    const secret = req.headers.get('x-webhook-secret');
    const expectedSecret = Deno.env.get('WEBHOOK_SECRET');

    if (!expectedSecret || secret !== expectedSecret) {
      console.error("⛔ Unauthorized Webhook Attempt");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Parse and Validate Body
    const body = await req.json();
    const { source, userId, data } = body;

    if (!source || !userId || !data) {
      return new Response(JSON.stringify({ error: "Missing required fields: source, userId, or data" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Initialize Client using deno.json bare specifier
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let transactionPayload = null;

    // 5. Normalization Logic (Preserved your business logic)
    switch (source.toLowerCase()) {
      case 'stripe':
        transactionPayload = {
          user_id: userId,
          amount: data.amount_paid / 100,
          type: 'income',
          description: `Stripe Invoice: ${data.customer_email}`,
          date: new Date(data.created * 1000).toISOString(),
        };
        break;

      case 'hubspot':
      case 'salesforce':
        transactionPayload = {
          user_id: userId,
          amount: Number(data.properties?.amount || 0),
          type: 'income',
          description: `Deal Won: ${data.properties?.dealname || 'CRM Deal'}`,
          date: new Date().toISOString(),
        };
        break;

      case 'zapier':
        transactionPayload = {
          user_id: userId,
          amount: Number(data.amount),
          type: data.type || 'expense',
          description: data.description || 'Zapier Import',
          date: data.date || new Date().toISOString(),
        };
        break;

      default:
        throw new Error(`Unsupported source: ${source}`);
    }

    // 6. Database Insertion
    if (transactionPayload) {
      const { data: inserted, error } = await supabase
        .from('transactions')
        .insert([transactionPayload])
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Successfully ingested from ${source}: ${inserted.id}`);

      return new Response(JSON.stringify({ success: true, id: inserted.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: "No payload generated" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("❌ Webhook Error:", error.message);
    
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});