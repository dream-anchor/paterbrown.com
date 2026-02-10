import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { JSZip } from "https://deno.land/x/jszip@0.11.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Extract text from a DOCX file stored in Supabase Storage,
 * send it to parse-events, and insert results into admin_events with dedup.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { bucket, filePath, sourceFilter } = await req.json();

    if (!bucket || !filePath) {
      return new Response(
        JSON.stringify({ error: "bucket and filePath are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Downloading DOCX from ${bucket}/${filePath}...`);

    // 1. Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return new Response(
        JSON.stringify({ error: `Failed to download: ${downloadError?.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Downloaded ${fileData.size} bytes`);

    // 2. Extract text from DOCX (ZIP containing word/document.xml)
    const arrayBuffer = await fileData.arrayBuffer();
    const zip = new JSZip();
    await zip.loadAsync(arrayBuffer);

    const documentXml = zip.file("word/document.xml");
    if (!documentXml) {
      return new Response(
        JSON.stringify({ error: "Not a valid DOCX file (no word/document.xml)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const xmlContent = await documentXml.async("text");
    
    // Strip XML tags to get plain text, preserve paragraph breaks
    const textContent = xmlContent
      .replace(/<w:p[^>]*\/>/g, "\n") // self-closing paragraphs
      .replace(/<\/w:p>/g, "\n")      // paragraph ends
      .replace(/<w:tab\/>/g, "\t")    // tabs
      .replace(/<w:br[^>]*\/>/g, "\n") // line breaks
      .replace(/<[^>]+>/g, "")        // strip all remaining tags
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\n{3,}/g, "\n\n")     // collapse multiple newlines
      .trim();

    console.log(`Extracted ${textContent.length} chars of text`);
    console.log("Text preview:", textContent.substring(0, 500));

    // If sourceFilter provided, only send that section
    let contentToSend = textContent;
    if (sourceFilter) {
      console.log(`Applying source filter: ${sourceFilter}`);
      // Content is sent as-is but we add instruction for the AI
      contentToSend = `WICHTIG: Extrahiere NUR die Termine von "${sourceFilter}" aus folgendem Text. Ignoriere alle anderen Termine.\n\n${textContent}`;
    }

    // 3. Call parse-events with the text
    console.log("Calling parse-events...");
    const { data: parseResult, error: parseError } = await supabase.functions.invoke("parse-events", {
      body: { content: contentToSend },
    });

    if (parseError) {
      console.error("parse-events error:", parseError);
      return new Response(
        JSON.stringify({ error: `parse-events failed: ${parseError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const events = parseResult?.events;
    if (!Array.isArray(events) || events.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No events extracted",
          textLength: textContent.length,
          textPreview: textContent.substring(0, 1000)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Extracted ${events.length} events, inserting with dedup...`);

    // 4. Insert into admin_events with dedup
    let inserted = 0;
    let skipped = 0;
    const insertedEvents: any[] = [];
    const skippedEvents: any[] = [];

    for (const evt of events) {
      if (!evt.date || !evt.city) continue;

      const startTime = evt.start_time
        ? `${evt.date}T${evt.start_time}:00`
        : `${evt.date}T20:00:00`;
      const location = evt.city + (evt.state ? `, ${evt.state}` : "");

      // Dedup: same location + same date
      const { data: existing } = await supabase
        .from("admin_events")
        .select("id")
        .eq("location", location)
        .gte("start_time", `${evt.date}T00:00:00`)
        .lt("start_time", `${evt.date}T23:59:59`)
        .is("deleted_at", null)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`Skipping duplicate: ${evt.city} on ${evt.date}`);
        skippedEvents.push({ city: evt.city, date: evt.date, source: evt.source });
        skipped++;
        continue;
      }

      const eventData = {
        title: `Pater Brown – ${evt.city}`,
        location,
        start_time: startTime,
        end_time: evt.end_time ? `${evt.date}T${evt.end_time}:00` : null,
        source: evt.source || "unknown",
        state: evt.state || null,
        latitude: evt.latitude || null,
        longitude: evt.longitude || null,
        venue_name: evt.venue || null,
        venue_address: evt.venue_address || null,
        venue_url: evt.venue_url || null,
        note: evt.note || null,
      };

      const { error: insertError } = await supabase.from("admin_events").insert(eventData);

      if (insertError) {
        console.error(`Insert error for ${evt.city}:`, insertError);
      } else {
        insertedEvents.push({ city: evt.city, date: evt.date, source: evt.source });
        inserted++;
      }
    }

    console.log(`Done. Inserted: ${inserted}, Skipped (dupes): ${skipped}`);

    return new Response(
      JSON.stringify({
        success: true,
        totalExtracted: events.length,
        inserted,
        skipped,
        insertedEvents,
        skippedEvents,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
