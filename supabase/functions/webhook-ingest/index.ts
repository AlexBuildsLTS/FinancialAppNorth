/**
 * 🔗 TITAN INTEGRATION ENGINE (Webhook Ingest)
 * -----------------------------------------------------------------------------
 * Acts as the universal receiver for external financial events.
 * Connects Stripe, Salesforce, Zapier, or HRIS systems to your "One Source of Truth".
 * * USAGE:
 * POST https://[project].supabase.co/functions/v1/webhook-ingest
 * Headers: 
 * - Content-Type: application/json
 * - x-webhook-secret: [Your Secret Key]
 * Body:
 * {
 * "source": "stripe" | "hubspot" | "zapier",
 * "userId": "uuid-of-user",
 * "data": { ...payload }
 * }
 */

import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts"; // Ensure this exists, or use inline headers below

console.log("🚀 Webhook Ingest Function Started");



serve(async (req: Request) => {

  // 1. Handle CORS Preflight

  if (req.method === 'OPTIONS') {

    return new Response('ok', { headers: corsHeaders });

  }



  try {

    // 2. Security Check

    const secret = req.headers.get('x-webhook-secret');

    const expectedSecret = Deno.env.get('WEBHOOK_SECRET');



    if (!expectedSecret || secret !== expectedSecret) {

      console.error("⛔ Unauthorized Webhook Attempt");

      return new Response(JSON.stringify({ error: "Unauthorized" }), {

        status: 401,

        headers: { ...corsHeaders, 'Content-Type': 'application/json' },

      });

    }



    // 3. Parse Payload

    const { source, userId, data } = await req.json();



    if (!source || !userId || !data) {

      throw new Error("Missing required fields: source, userId, or data");

    }



    // 4. Initialize Admin Client

    const supabase = createClient(

      Deno.env.get('SUPABASE_URL') ?? '',

      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    );



    let transactionPayload = null;



    // 5. Normalization Logic

    switch (source.toLowerCase()) {

      case 'stripe':

        transactionPayload = {

          user_id: userId,

          amount: data.amount_paid / 100,

          type: 'income',

          description: `Stripe Invoice: ${data.customer_email}`,

          date: new Date(data.created * 1000).toISOString(),

          // Optional fields depending on your DB schema

          // category: 'Sales', 

        };

        break;



      case 'hubspot':

      case 'salesforce':

        transactionPayload = {

          user_id: userId,

          amount: Number(data.properties.amount),

          type: 'income',

          description: `Deal Won: ${data.properties.dealname}`,

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



    return new Response(JSON.stringify({ error: "No payload generated" }), { status: 400 });



  } catch (error: any) {

    // ✅ FIX: Explicitly cast error to 'any' or check type

    const errorMessage = error?.message || "Unknown error occurred";

    console.error("❌ Webhook Error:", errorMessage);

    

    return new Response(JSON.stringify({ error: errorMessage }), {

      status: 400,

      headers: { ...corsHeaders, 'Content-Type': 'application/json' },

    });

  }

});