/* ocr-scan.ts – Supabase Edge Function */
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.3";

/* --------------------------------------------------------------
   1️⃣  Initialise Supabase client with Service Role (secure)
   -------------------------------------------------------------- */
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/* --------------------------------------------------------------
   2️⃣  Simple OCR helper – replace with your provider
   -------------------------------------------------------------- */
async function callOcrProvider(imageUrl: string): Promise<string> {
  // Example: Google Cloud Vision API (you must set GOOGLE_API_KEY)
  const apiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) throw new Error("Missing GOOGLE_API_KEY env var");

  const requestBody = {
    requests: [
      {
        image: { source: { imageUri: imageUrl } },
        features: [{ type: "TEXT_DETECTION", maxResults: 1 }],
      },
    ],
  };

  const resp = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`OCR failed: ${resp.status} ${txt}`);
  }

  const result = await resp.json();
  const annotation =
    result.responses?.[0]?.fullTextAnnotation?.text ?? "";
  return annotation;
}

/* --------------------------------------------------------------
   3️⃣  Handler – expects JSON:
        {
          documentId: string,      // row in public.documents
          storagePath: string       // full public URL to the image
        }
   -------------------------------------------------------------- */
serve(async (req: Request) => {
  try {
    const { documentId, storagePath } = await req.json();

    if (!documentId || !storagePath) {
      return new Response(
        JSON.stringify({ error: "documentId and storagePath required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // NEW: check for OCR provider API key early and fail gracefully
    const apiKey = Deno.env.get("GOOGLE_API_KEY");
    if (!apiKey) {
      // mark document as errored and store a helpful message
      await supabase
        .from("documents")
        .update({ status: "error", processed_data: { error: "OCR provider not configured (GOOGLE_API_KEY missing)" } })
        .eq("id", documentId);

      // notify user if possible
      const { data: doc } = await supabase
        .from("documents")
        .select("user_id")
        .eq("id", documentId)
        .single();

      if (doc?.user_id) {
        await supabase.from("notifications").insert([
          {
            user_id: doc.user_id,
            title: "Document processing failed",
            body: "OCR is not configured. Please contact support or try again later.",
            is_read: false,
          },
        ]);
      }

      return new Response(JSON.stringify({ error: "OCR not configured" }), { status: 503, headers: { "Content-Type": "application/json" } });
    }

    // 1️⃣ Pull OCR text
    const extracted = await callOcrProcessor(storagePath);

    // 2️⃣ Update the document row (status & processed_data)
    const { error: updErr } = await supabase
      .from("documents")
      .update({
        status: "processed",
        processed_data: { ocr_text: extracted },
      })
      .eq("id", documentId);

    if (updErr) throw updErr;

    // 3️⃣ Notify the user (optional – push a notification row)
    const { data: doc } = await supabase
      .from("documents")
      .select("user_id")
      .eq("id", documentId)
      .single();

    if (doc?.user_id) {
      await supabase.from("notifications").insert([
        {
          user_id: doc.user_id,
          title: "Document processed",
          body: `Your receipt ${documentId} is now searchable.`,
          is_read: false,
        },
      ]);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/* --------------------------------------------------------------
   Helper – wraps the OCR provider call (kept separate for testability)
   -------------------------------------------------------------- */
async function callOcrProcessor(url: string): Promise<string> {
  // you can swap out the implementation above; keep the name stable
  return await callOcrProvider(url);
}