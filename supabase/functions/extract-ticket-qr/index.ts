import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to extract QR/Aztec code data using AI vision
async function extractQrCodeWithVision(
  pdfBase64: string,
  lovableApiKey: string
): Promise<{ qr_data: string | null; description: string | null }> {
  
  const extractionPrompt = `Analysiere dieses Dokument und suche nach einem QR-Code oder Aztec-Code (typisch für Deutsche Bahn Tickets).

WICHTIG: Deutsche Bahn Tickets verwenden AZTEC-Codes (quadratische Codes mit einem schwarzen Quadrat in der Mitte).

Falls ein Code gefunden wird:
1. Beschreibe die Position des Codes im Dokument
2. Falls Text/Zahlen UNTER oder NEBEN dem Code stehen, extrahiere diese
3. Der Code enthält typischerweise eine URL wie "bfrn.de/..." oder einen alphanumerischen Buchungscode

Antworte im JSON-Format:
{
  "code_found": true/false,
  "code_type": "aztec" | "qr" | "barcode" | null,
  "position": "oben rechts" | "unten links" | etc.,
  "code_text_nearby": "Text der beim Code steht",
  "likely_content": "bfrn.de/xxx oder Buchungscode",
  "description": "Kurze Beschreibung des Dokuments"
}`;

  try {
    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
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

    if (!response.ok) {
      console.error("Vision API error:", response.status, await response.text());
      return { qr_data: null, description: null };
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";
    
    console.log("Vision API response:", content);

    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          qr_data: parsed.likely_content || parsed.code_text_nearby || null,
          description: parsed.description || null,
        };
      } catch {
        return { qr_data: null, description: content };
      }
    }

    return { qr_data: null, description: content };
  } catch (error) {
    console.error("Vision extraction error:", error);
    return { qr_data: null, description: null };
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
    const { attachment_id } = await req.json();

    if (!attachment_id) {
      throw new Error("attachment_id is required");
    }

    console.log("Extracting QR code from attachment:", attachment_id);

    // Fetch the attachment
    const { data: attachment, error: attachmentError } = await supabase
      .from("travel_attachments")
      .select("*")
      .eq("id", attachment_id)
      .single();

    if (attachmentError || !attachment) {
      throw new Error(`Attachment not found: ${attachmentError?.message}`);
    }

    // Check if already extracted
    if (attachment.qr_code_data) {
      console.log("QR code already extracted for this attachment");
      return new Response(
        JSON.stringify({ 
          success: true, 
          already_extracted: true,
          qr_data: attachment.qr_code_data 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    // Download the PDF from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("travel-attachments")
      .download(attachment.file_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download PDF: ${downloadError?.message}`);
    }

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log("PDF downloaded, size:", arrayBuffer.byteLength, "bytes");

    // Extract QR code using vision AI
    const { qr_data, description } = await extractQrCodeWithVision(base64, lovableApiKey);

    console.log("Extraction result - QR data:", qr_data, "Description:", description);

    // Update the attachment record
    const { error: updateError } = await supabase
      .from("travel_attachments")
      .update({
        qr_code_data: qr_data || description || "No QR code found",
        document_type: description?.toLowerCase().includes("reservierung") ? "seat_reservation" : 
                       description?.toLowerCase().includes("ticket") ? "ticket" : 
                       attachment.document_type,
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
        extracted: !!qr_data
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
