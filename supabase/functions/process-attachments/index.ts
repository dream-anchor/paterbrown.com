import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AttachmentInfo {
  name: string;
  contentType: string;
  url?: string;
  content?: string;
  size?: number;
}

async function downloadFromUrl(url: string): Promise<{ content: Uint8Array; contentType: string } | null> {
  try {
    console.info("Downloading from URL:", url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Download failed:", response.status);
      return null;
    }
    const content = new Uint8Array(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    console.info("Downloaded:", content.length, "bytes");
    return { content, contentType };
  } catch (error) {
    console.error("Download error:", error);
    return null;
  }
}

function base64ToUint8Array(base64: string): Uint8Array {
  // Handle data URLs
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Extract attachments using regex from raw payload text (handles corrupted JSON from Make/HEY)
function extractAttachmentsFromPayloadText(payloadText: string): AttachmentInfo[] {
  const result: AttachmentInfo[] = [];
  
  // Pattern to find attachment objects with their buffer data
  // Matches: {"contentType":"application/pdf","fileName":"name.pdf","fileSize":12345,"contentId":"...","data":{"type":"Buffer","data":[...]}}
  const attachmentPattern = /\{[^{}]*"contentType"\s*:\s*"([^"]+)"[^{}]*"fileName"\s*:\s*"([^"]+)"[^{}]*"fileSize"\s*:\s*(\d+)[^{}]*"data"\s*:\s*\{"type"\s*:\s*"Buffer"\s*,\s*"data"\s*:\s*\[([0-9,\s]+)\]\}/g;
  
  let match;
  while ((match = attachmentPattern.exec(payloadText)) !== null) {
    const contentType = match[1];
    const fileName = match[2];
    const fileSize = parseInt(match[3]);
    const bufferDataStr = match[4];
    
    console.info("Found attachment via regex:", fileName, "type:", contentType);
    
    // Convert buffer data string to base64
    try {
      const bufferArray = bufferDataStr.split(",").map(n => parseInt(n.trim()));
      const bytes = new Uint8Array(bufferArray);
      let binaryStr = "";
      for (let i = 0; i < bytes.length; i++) {
        binaryStr += String.fromCharCode(bytes[i]);
      }
      const base64Content = btoa(binaryStr);
      
      result.push({
        name: fileName,
        contentType,
        content: base64Content,
        size: fileSize,
      });
      console.info("Converted to base64, length:", base64Content.length);
    } catch (e) {
      console.error("Failed to convert buffer for", fileName, e);
    }
  }
  
  // Also try a simpler pattern for PDFs specifically
  if (result.filter(a => a.contentType === "application/pdf").length === 0) {
    // Fallback: find PDF metadata without buffer (for logging)
    const pdfMetaPattern = /"contentType"\s*:\s*"application\/pdf"\s*,\s*"fileName"\s*:\s*"([^"]+)"/g;
    let pdfMatch;
    while ((pdfMatch = pdfMetaPattern.exec(payloadText)) !== null) {
      console.info("Found PDF reference (metadata only):", pdfMatch[1]);
    }
  }
  
  console.info("Extracted", result.length, "attachments via regex from payload text");
  return result;
}

// Extract attachments from raw_payload (handles escaped JSON strings from Make/HEY)
function extractAttachmentsFromPayload(rawPayload: unknown): AttachmentInfo[] {
  if (!rawPayload || typeof rawPayload !== "object") return [];
  
  const payload = rawPayload as Record<string, unknown>;
  const attachments = payload.attachments || payload.Attachments || payload.files;
  
  if (!attachments || !Array.isArray(attachments)) return [];
  
  const result: AttachmentInfo[] = [];
  
  for (const att of attachments) {
    let parsed = att;
    
    // Handle escaped JSON strings (from Make/HEY)
    if (typeof att === "string") {
      try {
        parsed = JSON.parse(att);
        console.info("Parsed attachment from JSON string:", (parsed as Record<string, unknown>)?.fileName);
      } catch {
        continue; // Not valid JSON
      }
    }
    
    if (typeof parsed !== "object" || parsed === null) continue;
    
    const a = parsed as Record<string, unknown>;
    
    // Handle Buffer data format (inline binary data)
    let contentData: string | undefined = undefined;
    if (a.data && typeof a.data === "object") {
      const dataObj = a.data as Record<string, unknown>;
      if (dataObj.type === "Buffer" && Array.isArray(dataObj.data)) {
        // Convert Buffer array to base64
        const bytes = new Uint8Array(dataObj.data as number[]);
        let binaryStr = "";
        for (let i = 0; i < bytes.length; i++) {
          binaryStr += String.fromCharCode(bytes[i]);
        }
        contentData = btoa(binaryStr);
        console.info("Converted buffer to base64, length:", contentData.length);
      }
    } else if (a.Content || a.content || a.base64) {
      contentData = String(a.Content || a.content || a.base64);
    }
    
    const name = String(a.Name || a.name || a.FileName || a.fileName || a.filename || "attachment");
    const contentType = String(a.ContentType || a.contentType || a.content_type || a.mime_type || "application/octet-stream");
    
    result.push({
      name,
      contentType,
      url: a.url ? String(a.url) : undefined,
      content: contentData,
      size: a.ContentLength || a.contentLength || a.fileSize || a.size 
        ? Number(a.ContentLength || a.contentLength || a.fileSize || a.size) 
        : undefined,
    });
  }
  
  console.info("Extracted", result.length, "attachments from structured payload");
  return result;
}

serve(async (req) => {
  console.info("=== PROCESS ATTACHMENTS ===");
  console.info("Timestamp:", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if specific email_id was provided
    let emailId: string | null = null;
    try {
      const body = await req.json();
      emailId = body.email_id || null;
    } catch {
      // No body provided, will process next pending email
    }

    // Get ONE pending email to process
    let query = supabase
      .from("travel_emails")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1);
    
    if (emailId) {
      query = supabase
        .from("travel_emails")
        .select("*")
        .eq("id", emailId)
        .limit(1);
    }

    const { data: emails, error: fetchError } = await query;

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw fetchError;
    }

    if (!emails || emails.length === 0) {
      console.info("No pending emails to process");
      return new Response(
        JSON.stringify({ success: true, message: "No pending emails" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const email = emails[0];
    console.info("Processing email:", email.id);
    console.info("Subject:", email.subject);

    // Update status to processing
    await supabase
      .from("travel_emails")
      .update({ status: "processing" })
      .eq("id", email.id);

    // Get attachments - try attachment_urls first, fallback to raw_payload extraction
    let attachmentInfos = (email.attachment_urls || []) as AttachmentInfo[];
    
    if (attachmentInfos.length === 0 && email.raw_payload) {
      console.info("No attachment_urls found, extracting from raw_payload...");
      attachmentInfos = extractAttachmentsFromPayload(email.raw_payload);
    }
    
    // If still no attachments, try regex extraction from raw payload text (handles corrupted JSON)
    if (attachmentInfos.length === 0 && email.raw_payload) {
      console.info("Structured extraction failed, trying regex extraction...");
      const payloadText = JSON.stringify(email.raw_payload);
      attachmentInfos = extractAttachmentsFromPayloadText(payloadText);
    }
    
    console.info("Attachments to process:", attachmentInfos.length);

    let processedCount = 0;

    for (const att of attachmentInfos) {
      console.info("Processing attachment:", att.name);

      let fileContent: Uint8Array | null = null;
      let contentType = att.contentType;

      // Try URL download first
      if (att.url) {
        const downloaded = await downloadFromUrl(att.url);
        if (downloaded) {
          fileContent = downloaded.content;
          contentType = downloaded.contentType;
        }
      }
      
      // Try base64 content
      if (!fileContent && att.content) {
        try {
          fileContent = base64ToUint8Array(att.content);
        } catch (e) {
          console.error("Base64 decode failed:", e);
        }
      }

      if (!fileContent) {
        console.warn("Could not get content for:", att.name);
        continue;
      }

      // Upload to Supabase Storage
      const fileName = `${email.id}/${Date.now()}-${att.name}`;
      const { error: uploadError } = await supabase.storage
        .from("travel-attachments")
        .upload(fileName, fileContent, {
          contentType: contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      console.info("Uploaded:", fileName);

      // Save attachment record
      await supabase.from("travel_attachments").insert({
        email_id: email.id,
        file_name: att.name,
        file_path: fileName,
        content_type: contentType,
        file_size: fileContent.length,
      });

      processedCount++;
    }

    console.info("Processed attachments:", processedCount);

    // Trigger AI analysis
    console.info("Triggering AI analysis...");
    const { error: analyzeError } = await supabase.functions.invoke(
      "analyze-travel-booking",
      { body: { email_id: email.id } }
    );

    if (analyzeError) {
      console.error("Analysis trigger error:", analyzeError);
      // Don't fail - email is still saved
    }

    return new Response(
      JSON.stringify({
        success: true,
        email_id: email.id,
        attachments_processed: processedCount,
        analysis_triggered: !analyzeError,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
