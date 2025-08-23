import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.2.1';

const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);

Deno.serve(async (req) => {
  try {
    const { record: document } = await req.json();
    if (!document) throw new Error('Document record is missing.');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')!
    );

    // In a real app, you would add OCR logic here to get text from the image file.
    // For now, we will use the file name as the source text.
    const extractedText = `Document content for: ${document.file_name}`;

    await supabaseAdmin
      .from('documents')
      .update({ status: 'processing', extracted_text: extractedText })
      .eq('id', document.id);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `
      You are a financial data extraction assistant. Based on the following text,
      extract the vendor name, the total amount, and the transaction date.
      Return the data ONLY as a valid JSON object with the keys "vendor", "total", and "date" (YYYY-MM-DD).
      Text: "${extractedText}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponseText = response.text();
    const jsonString = aiResponseText.replace(/```json/g, '').replace(/```g, '').trim();
    const processedData = JSON.parse(jsonString || '{}');

    await supabaseAdmin
      .from('documents')
      .update({ status: 'processed', processed_data: processedData })
      .eq('id', document.id);

    return new Response(JSON.stringify({ message: `Processed document ${document.id}` }), {
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