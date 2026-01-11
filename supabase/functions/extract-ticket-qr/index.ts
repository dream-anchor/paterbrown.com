import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Uses Vision AI to find the QR/Aztec code position and extract it as an image.
 * Deutsche Bahn tickets have the Aztec code in the top-right area.
 */
async function extractQrCodeImage(
  pdfBase64: string,
  lovableApiKey: string
): Promise<{ 
  qr_data: string | null; 
  description: string | null; 
  document_type: string | null;
  qr_image_base64: string | null;
}> {
  
  const extractionPrompt = `Analysiere dieses Deutsche Bahn Ticket-Dokument.

WICHTIG: Ich brauche den Aztec/QR-Code als BILD extrahiert.

Der Aztec-Code auf DB-Tickets befindet sich typischerweise:
- Oben rechts auf der ersten Seite
- Ca. 100-200 Pixel vom oberen Rand
- Ca. 100-200 Pixel vom rechten Rand
- Größe etwa 150x150 bis 200x200 Pixel
- Es ist ein schwarzes, quadratisches Aztec-Muster auf weißem Hintergrund

AUFGABE:
1. Finde den Aztec-Code im Dokument
2. Wenn du ihn findest, extrahiere NUR den Code-Bereich als Bild
3. Klassifiziere das Dokument (ticket, seat_reservation, confirmation, invoice)

=== DOKUMENTTYP-ERKENNUNG ===

SITZPLATZRESERVIERUNG wenn:
✓ "Sitzplatzreservierung" oder "Reservierung" im Titel
✓ Preis ist 0,00 EUR ODER kein Fahrpreis
✓ Wagen-/Sitzplatznummern vorhanden

TICKET wenn:
✓ Echter Fahrpreis vorhanden (> 0 EUR)
✓ "Fahrkarte" / "Ticket" / "Online-Ticket" im Titel

Antworte im JSON-Format:
{
  "code_found": true/false,
  "code_type": "aztec" | "qr" | null,
  "position": "oben rechts" | "mitte" | etc.,
  "code_content": "bfrn.de/xxx oder alphanumerischer Code",
  "document_type": "ticket" | "seat_reservation" | "confirmation" | "invoice",
  "description": "Kurze Beschreibung des Dokuments",
  "traveler_name": "Name des Reisenden falls erkennbar"
}`;

  try {
    // First, analyze the document structure
    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              { type: "text", text: extractionPrompt },
              {
                type: "image_url",
                image_url: { url: `data:application/pdf;base64,${pdfBase64}` },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!analysisResponse.ok) {
      console.error("Vision API error:", analysisResponse.status, await analysisResponse.text());
      return { qr_data: null, description: null, document_type: null, qr_image_base64: null };
    }

    const analysisResult = await analysisResponse.json();
    const analysisContent = analysisResult.choices?.[0]?.message?.content || "";
    
    console.log("Vision API analysis:", analysisContent);

    // Parse the analysis
    let parsed: any = {};
    const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        console.log("Could not parse JSON, using raw content");
      }
    }

    // Now request image extraction of the QR code
    if (parsed.code_found) {
      console.log("Code found, attempting image extraction...");
      
      const imageExtractionPrompt = `Extrahiere NUR den Aztec/QR-Code aus diesem Dokument als Bild.

Der Code befindet sich ${parsed.position || "oben rechts"}.

Schneide genau den quadratischen Code-Bereich aus - nur das Aztec-Muster ohne Umgebung.
Gib das Bild als Ausgabe zurück.`;

      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${lovableApiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: imageExtractionPrompt },
                {
                  type: "image_url",
                  image_url: { url: `data:application/pdf;base64,${pdfBase64}` },
                },
              ],
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (imageResponse.ok) {
        const imageResult = await imageResponse.json();
        const extractedImage = imageResult.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (extractedImage && extractedImage.startsWith("data:image")) {
          // Extract base64 from data URL
          const base64Match = extractedImage.match(/base64,(.+)/);
          if (base64Match) {
            console.log("Successfully extracted QR code image");
            return {
              qr_data: parsed.code_content || parsed.likely_content || null,
              description: parsed.description || null,
              document_type: parsed.document_type || null,
              qr_image_base64: base64Match[1],
            };
          }
        }
        console.log("Image extraction response:", JSON.stringify(imageResult).substring(0, 500));
      } else {
        console.log("Image extraction failed:", imageResponse.status);
      }
    }

    // Return analysis results even if image extraction failed
    return {
      qr_data: parsed.code_content || parsed.likely_content || null,
      description: parsed.description || null,
      document_type: parsed.document_type || null,
      qr_image_base64: null,
    };

  } catch (error) {
    console.error("Vision extraction error:", error);
    return { qr_data: null, description: null, document_type: null, qr_image_base64: null };
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { attachment_id, booking_id } = await req.json();

    if (!attachment_id) {
      throw new Error("attachment_id is required");
    }

    console.log("Extracting QR code from attachment:", attachment_id, "for booking:", booking_id);

    // Fetch the attachment
    const { data: attachment, error: attachmentError } = await supabase
      .from("travel_attachments")
      .select("*")
      .eq("id", attachment_id)
      .single();

    if (attachmentError || !attachment) {
      throw new Error(`Attachment not found: ${attachmentError?.message}`);
    }

    // Get the booking_id from attachment if not provided
    const targetBookingId = booking_id || attachment.booking_id;

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

    // Download the PDF from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("travel-attachments")
      .download(attachment.file_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download PDF: ${downloadError?.message}`);
    }

    // Convert to base64 using chunked approach to avoid stack overflow
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Process in chunks to avoid stack overflow with large files
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64 = btoa(binary);

    console.log("PDF downloaded, size:", arrayBuffer.byteLength, "bytes");

    // Extract QR code using vision AI
    const { qr_data, description, document_type, qr_image_base64 } = 
      await extractQrCodeImage(base64, lovableApiKey);

    console.log("Extraction result - QR data:", qr_data, "Document type:", document_type, "Has image:", !!qr_image_base64);

    let qr_code_url: string | null = null;
    let qr_image_path: string | null = null;

    // If we got an image, upload it to storage - SAVE PER ATTACHMENT (not per booking)
    if (qr_image_base64) {
      try {
        const imageBytes = Uint8Array.from(atob(qr_image_base64), c => c.charCodeAt(0));
        // Use attachment_id for unique filename per ticket/person
        const fileName = `qr_${attachment_id}.png`;

        // Delete existing file if any
        await supabase.storage.from("qr-codes").remove([fileName]);

        // Upload new QR code image
        const { error: uploadError } = await supabase.storage
          .from("qr-codes")
          .upload(fileName, imageBytes, {
            contentType: "image/png",
            upsert: true,
          });

        if (uploadError) {
          console.error("Failed to upload QR image:", uploadError);
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from("qr-codes")
            .getPublicUrl(fileName);
          
          qr_code_url = urlData.publicUrl;
          qr_image_path = fileName;
          console.log("QR code image uploaded per attachment:", qr_code_url);
        }
      } catch (uploadErr) {
        console.error("Error uploading QR image:", uploadErr);
      }
    }

    // Determine the best document_type
    const finalDocumentType = document_type || 
      (description?.toLowerCase().includes("reservierung") || description?.toLowerCase().includes("sitzplatz") ? "seat_reservation" : 
       description?.toLowerCase().includes("ticket") || description?.toLowerCase().includes("fahrkarte") ? "ticket" : 
       attachment.document_type);

    // Update the attachment record with QR code on ATTACHMENT level (not booking level)
    const { error: updateError } = await supabase
      .from("travel_attachments")
      .update({
        qr_code_data: qr_data || description || "No QR code found",
        document_type: finalDocumentType,
        qr_code_image_path: qr_image_path, // Store path per attachment
      })
      .eq("id", attachment_id);

    if (updateError) {
      console.error("Error updating attachment:", updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        qr_data: qr_data,
        description: description,
        document_type: finalDocumentType,
        qr_code_url: qr_code_url,
        extracted: !!qr_data || !!qr_image_base64
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
