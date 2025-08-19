import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('Hello from Functions!');

Deno.serve(async (req: { json: () => PromiseLike<{ record: any; }> | { record: any; }; }) => {
  try {
    const { record } = await req.json();
    const documentId = record.id;

    if (!documentId) {
      throw new Error('Document ID is missing in the request body.');
    }

    // Create a Supabase client with the required service_role key
    // This is secure because it runs on the server, not the client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Step 1: Update the document status to 'processing'
    const { error: updateError } = await supabaseAdmin
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    if (updateError) throw updateError;

    // --- AI PROCESSING LOGIC WILL GO HERE IN THE NEXT STEP ---
    // For now, we simulate a delay and then mark it as complete.

    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate AI work

    // Step 2: Update the document with processed data (mocked for now)
    const { error: finalUpdateError } = await supabaseAdmin
      .from('documents')
      .update({
        status: 'processed',
        extracted_text: 'Mock OCR text from the document.',
        processed_data: { vendor: 'MockMart', total: 12.99, date: '2025-08-19' }
      })
      .eq('id', documentId);

    if (finalUpdateError) throw finalUpdateError;

    return new Response(JSON.stringify({ message: `Successfully processed document ${documentId}` }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});