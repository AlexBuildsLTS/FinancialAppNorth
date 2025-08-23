import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { record: document } = await req.json();
    if (!document) throw new Error('Document record is missing.');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
      throw new Error('Supabase environment variables are not set.');
    }

    // Update status to processing
    await supabaseAdmin
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', document.id);

    // Simulate OCR text extraction
    const extractedText = `Invoice from ${document.file_name.replace(/\.[^/.]+$/, "")}
Date: ${new Date().toLocaleDateString()}
Amount: $${(Math.random() * 1000 + 100).toFixed(2)}
Vendor: Sample Vendor Inc.
Description: Professional services rendered`;

    // Update with extracted text
    await supabaseAdmin
      .from('documents')
      .update({ extracted_text: extractedText })
      .eq('id', document.id);

    // Simulate AI processing
    const processedData = {
      vendor: "Sample Vendor Inc.",
      amount: (Math.random() * 1000 + 100).toFixed(2),
      date: new Date().toISOString().split('T')[0],
      category: "Professional Services",
      confidence: 0.95
    };

    // Update with processed data
    await supabaseAdmin
      .from('documents')
      .update({ 
        status: 'processed', 
        processed_data: processedData 
      })
      .eq('id', document.id);

    return new Response(
      JSON.stringify({ 
        message: `Successfully processed document ${document.id}`,
        data: processedData 
      }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      status: 200,
    });
  } catch (error) {
    console.error('Document processing error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return new Response(
      JSON.stringify({ error: errorMessage, details: errorStack }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      status: 500, // Internal Server Error for unexpected issues
    });
  }
});