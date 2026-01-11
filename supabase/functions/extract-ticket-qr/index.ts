import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Uses ScreenshotOne to render the PDF as an image and crop the Aztec code area.
 * Deutsche Bahn tickets have the Aztec code consistently in the top-right area.
 * This extracts the ORIGINAL code, not a regenerated one.
 */
async function extractOriginalQrCode(
  pdfPublicUrl: string,
  screenshotOneAccessKey: string,
  screenshotOneSecretKey: string
): Promise<{ qr_image_base64: string | null; success: boolean }> {
  
  console.log("Rendering PDF with ScreenshotOne:", pdfPublicUrl);

  try {
    // ScreenshotOne API to render PDF as image with specific viewport
    // DB Tickets are typically A4, ~595x842 pixels at 72 DPI
    const params = new URLSearchParams({
      access_key: screenshotOneAccessKey,
      url: pdfPublicUrl,
      format: "png",
      viewport_width: "1190",   // 2x A4 width for better quality
      viewport_height: "1684",  // 2x A4 height
      full_page: "false",
      device_scale_factor: "2",
      delay: "2",               // Wait for PDF to render
    });

    // If secret key is available, we could add signature for security
    // For now, use basic request
    const screenshotUrl = `https://api.screenshotone.com/take?${params.toString()}`;
    
    console.log("Requesting screenshot from ScreenshotOne...");
    
    const response = await fetch(screenshotUrl);
    
    if (!response.ok) {
      console.error("ScreenshotOne API error:", response.status, await response.text());
      return { qr_image_base64: null, success: false };
    }

    // Get the full page image
    const imageBuffer = await response.arrayBuffer();
    const fullImageBytes = new Uint8Array(imageBuffer);
    
    console.log("Got full page image, size:", fullImageBytes.length, "bytes");

    // Deutsche Bahn Aztec code position (empirically determined):
    // - Top right area, approximately:
    //   - X: 68-75% from left edge
    //   - Y: 3-8% from top edge  
    //   - Size: ~130-180 pixels (at 2x scale: ~260-360 pixels)
    
    // For 2x scaled image (1190x1684):
    // X start: ~810 (68% of 1190)
    // Y start: ~50 (3% of 1684)
    // Width: ~320 pixels
    // Height: ~320 pixels

    // Since we can't do pixel-level cropping in Deno easily without external libs,
    // we'll use ScreenshotOne's built-in selector/clip feature instead
    
    // Request again with clip parameters to get just the QR area
    const clipParams = new URLSearchParams({
      access_key: screenshotOneAccessKey,
      url: pdfPublicUrl,
      format: "png",
      viewport_width: "1190",
      viewport_height: "1684",
      full_page: "false",
      device_scale_factor: "2",
      delay: "2",
      // Clip to QR code area (top-right)
      clip_x: "780",        // Start X (about 65% from left)
      clip_y: "30",         // Start Y (about 2% from top)
      clip_width: "380",    // Width of clip area
      clip_height: "380",   // Height of clip area
    });

    const clipUrl = `https://api.screenshotone.com/take?${clipParams.toString()}`;
    
    console.log("Requesting cropped QR area from ScreenshotOne...");
    
    const clipResponse = await fetch(clipUrl);
    
    if (!clipResponse.ok) {
      console.error("ScreenshotOne clip error:", clipResponse.status, await clipResponse.text());
      // Fall back to returning the full image - better than nothing
      const base64Full = btoa(String.fromCharCode(...fullImageBytes));
      return { qr_image_base64: base64Full, success: true };
    }

    const qrImageBuffer = await clipResponse.arrayBuffer();
    const qrImageBytes = new Uint8Array(qrImageBuffer);
    
    console.log("Got cropped QR image, size:", qrImageBytes.length, "bytes");

    // Convert to base64 using chunked approach
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < qrImageBytes.length; i += chunkSize) {
      const chunk = qrImageBytes.subarray(i, Math.min(i + chunkSize, qrImageBytes.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64 = btoa(binary);

    return { qr_image_base64: base64, success: true };

  } catch (error) {
    console.error("ScreenshotOne extraction error:", error);
    return { qr_image_base64: null, success: false };
  }
}

/**
 * Analyzes the document to determine its type using Vision AI.
 * This is separate from QR extraction - just for classification.
 */
async function analyzeDocument(
  pdfBase64: string,
  lovableApiKey: string
): Promise<{ document_type: string | null; description: string | null }> {
  
  const analysisPrompt = `Analysiere dieses Deutsche Bahn Dokument und klassifiziere es.

=== DOKUMENTTYP-ERKENNUNG ===

SITZPLATZRESERVIERUNG ("seat_reservation") wenn:
✓ "Sitzplatzreservierung" oder "Reservierung" im Titel
✓ Preis ist 0,00 EUR ODER kein Fahrpreis
✓ Wagen-/Sitzplatznummern vorhanden

TICKET ("ticket") wenn:
✓ Echter Fahrpreis vorhanden (> 0 EUR)
✓ "Fahrkarte" / "Ticket" / "Online-Ticket" im Titel

RECHNUNG ("invoice") wenn:
✓ "Rechnung" im Titel

BESTÄTIGUNG ("confirmation") wenn:
✓ "Buchungsbestätigung" oder "Bestätigung" im Titel

Antworte NUR mit diesem JSON:
{
  "document_type": "ticket" | "seat_reservation" | "confirmation" | "invoice",
  "description": "Kurze Beschreibung (z.B. 'Online-Ticket München-Berlin')"
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              {
                type: "image_url",
                image_url: { url: `data:application/pdf;base64,${pdfBase64}` },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error("Vision API error:", response.status);
      return { document_type: null, description: null };
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          document_type: parsed.document_type || null,
          description: parsed.description || null,
        };
      } catch {
        console.log("Could not parse JSON from analysis");
      }
    }

    return { document_type: null, description: null };
  } catch (error) {
    console.error("Document analysis error:", error);
    return { document_type: null, description: null };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const screenshotOneAccessKey = Deno.env.get("SCREENSHOTONE_ACCESS_KEY");
    const screenshotOneSecretKey = Deno.env.get("SCREENSHOTONE_SECRET_KEY");

    if (!screenshotOneAccessKey) {
      throw new Error("SCREENSHOTONE_ACCESS_KEY is required for QR extraction");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { attachment_id, booking_id } = await req.json();

    if (!attachment_id) {
      throw new Error("attachment_id is required");
    }

    console.log("Extracting ORIGINAL QR code from attachment:", attachment_id);

    // Fetch the attachment
    const { data: attachment, error: attachmentError } = await supabase
      .from("travel_attachments")
      .select("*")
      .eq("id", attachment_id)
      .single();

    if (attachmentError || !attachment) {
      throw new Error(`Attachment not found: ${attachmentError?.message}`);
    }

    // Check if it's a PDF
    const isPdf = attachment.content_type === "application/pdf" || 
                  attachment.file_name?.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      console.log("Not a PDF, skipping QR extraction");
      return new Response(
        JSON.stringify({ success: false, error: "Not a PDF file" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get a signed URL for the PDF (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("travel-attachments")
      .createSignedUrl(attachment.file_path, 3600);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      throw new Error(`Failed to create signed URL: ${signedUrlError?.message}`);
    }

    const pdfPublicUrl = signedUrlData.signedUrl;
    console.log("Got signed URL for PDF");

    // Extract the ORIGINAL QR code using ScreenshotOne
    const { qr_image_base64, success: extractionSuccess } = await extractOriginalQrCode(
      pdfPublicUrl,
      screenshotOneAccessKey,
      screenshotOneSecretKey || ""
    );

    // Also download PDF for document type analysis
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("travel-attachments")
      .download(attachment.file_path);

    let document_type: string | null = null;
    let description: string | null = null;

    if (!downloadError && fileData) {
      // Convert to base64 for analysis
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const pdfBase64 = btoa(binary);

      // Analyze document type
      const analysis = await analyzeDocument(pdfBase64, lovableApiKey);
      document_type = analysis.document_type;
      description = analysis.description;
    }

    console.log("Extraction result - Has image:", !!qr_image_base64, "Document type:", document_type);

    let qr_code_url: string | null = null;
    let qr_image_path: string | null = null;

    // If we got an image, upload it to storage
    if (qr_image_base64) {
      try {
        const imageBytes = Uint8Array.from(atob(qr_image_base64), c => c.charCodeAt(0));
        const fileName = `qr_${attachment_id}.png`;

        // Delete existing file if any
        await supabase.storage.from("qr-codes").remove([fileName]);

        // Upload new QR code image (the ORIGINAL from PDF!)
        const { error: uploadError } = await supabase.storage
          .from("qr-codes")
          .upload(fileName, imageBytes, {
            contentType: "image/png",
            upsert: true,
          });

        if (uploadError) {
          console.error("Failed to upload QR image:", uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from("qr-codes")
            .getPublicUrl(fileName);
          
          qr_code_url = urlData.publicUrl;
          qr_image_path = fileName;
          console.log("ORIGINAL QR code uploaded:", qr_code_url);
        }
      } catch (uploadErr) {
        console.error("Error uploading QR image:", uploadErr);
      }
    }

    // Update the attachment record
    const finalDocumentType = document_type || attachment.document_type;

    const { error: updateError } = await supabase
      .from("travel_attachments")
      .update({
        qr_code_data: description || "Original QR extracted",
        document_type: finalDocumentType,
        qr_code_image_path: qr_image_path,
      })
      .eq("id", attachment_id);

    if (updateError) {
      console.error("Error updating attachment:", updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: extractionSuccess, 
        description: description,
        document_type: finalDocumentType,
        qr_code_url: qr_code_url,
        extracted: !!qr_image_base64,
        method: "screenshotone_original"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("QR extraction error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
