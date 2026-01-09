import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FlexibleEmailPayload {
  from?: unknown;
  From?: unknown;
  fromFull?: unknown;
  FromFull?: unknown;
  sender?: unknown;
  to?: unknown;
  To?: unknown;
  toFull?: unknown;
  ToFull?: unknown;
  recipient?: unknown;
  subject?: unknown;
  Subject?: unknown;
  textBody?: unknown;
  TextBody?: unknown;
  text?: unknown;
  body?: unknown;
  Body?: unknown;
  plain?: unknown;
  Plain?: unknown;
  htmlBody?: unknown;
  HtmlBody?: unknown;
  html?: unknown;
  Html?: unknown;
  date?: unknown;
  Date?: unknown;
  received_at?: unknown;
  attachments?: unknown;
  Attachments?: unknown;
  files?: unknown;
}

function extractEmailAddress(value: unknown): string {
  if (!value) return "unknown";
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if (obj.Email) return String(obj.Email);
    if (obj.email) return String(obj.email);
    if (obj.address) return String(obj.address);
  }
  if (typeof value === "string") {
    if (value.startsWith("{")) {
      try {
        const parsed = JSON.parse(value);
        if (parsed.address) return parsed.address;
        if (parsed.Email) return parsed.Email;
      } catch {
        // Not JSON
      }
    }
    const emailMatch = value.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) return emailMatch[0];
    return value;
  }
  return "unknown";
}

interface AttachmentInfo {
  name: string;
  contentType: string;
  url?: string;
  content?: string;
  size?: number;
}

function extractAttachmentInfo(attachments: unknown): AttachmentInfo[] {
  if (!attachments) return [];
  
  // Handle URL string format (Zapier S3)
  if (typeof attachments === "string") {
    if (attachments.includes("http")) {
      return attachments.split(",").map((url) => ({
        name: "attachment.pdf",
        contentType: "application/pdf",
        url: url.trim(),
      })).filter((a) => a.url);
    }
    return [];
  }
  
  if (!Array.isArray(attachments)) return [];
  
  return attachments.map((att: unknown) => {
    // Handle escaped JSON strings (from Make/HEY)
    let parsedAtt = att;
    if (typeof att === "string") {
      try {
        parsedAtt = JSON.parse(att);
        console.info("Parsed attachment from JSON string:", (parsedAtt as Record<string, unknown>)?.fileName || (parsedAtt as Record<string, unknown>)?.name);
      } catch {
        return null; // Not valid JSON
      }
    }
    
    if (typeof parsedAtt !== "object" || parsedAtt === null) return null;
    const a = parsedAtt as Record<string, unknown>;
    
    // Handle Buffer data format from email parsers (e.g., HEY/Make)
    let contentData: string | undefined = undefined;
    if (a.data && typeof a.data === "object") {
      const dataObj = a.data as Record<string, unknown>;
      if (dataObj.type === "Buffer" && Array.isArray(dataObj.data)) {
        // Convert Buffer array to base64
        const bytes = new Uint8Array(dataObj.data as number[]);
        contentData = btoa(String.fromCharCode(...bytes));
      }
    } else if (a.Content || a.content || a.base64) {
      contentData = String(a.Content || a.content || a.base64);
    }
    
    return {
      name: String(a.Name || a.name || a.FileName || a.fileName || a.filename || "attachment"),
      contentType: String(a.ContentType || a.contentType || a.content_type || a.mime_type || "application/octet-stream"),
      url: a.url ? String(a.url) : undefined,
      content: contentData,
      size: a.ContentLength || a.contentLength || a.fileSize || a.size ? Number(a.ContentLength || a.contentLength || a.fileSize || a.size) : undefined,
    };
  }).filter(Boolean) as AttachmentInfo[];
}

// Extract PDF links from HTML body (for forwarded emails like HEY)
function extractPdfLinksFromBody(htmlBody: string): AttachmentInfo[] {
  if (!htmlBody) return [];
  
  const pdfAttachments: AttachmentInfo[] = [];
  const seenUrls = new Set<string>();
  
  // Pattern 1: Direct PDF links
  const pdfLinkPattern = /https?:\/\/[^\s"'<>]+\.pdf(?:\?[^\s"'<>]*)?/gi;
  
  // Pattern 2: HEY file links (files.hey.com)
  const heyFilePattern = /https?:\/\/files\.hey\.com\/[^\s"'<>]+/gi;
  
  // Pattern 3: Generic file download links with PDF in path or query
  const genericPdfPattern = /https?:\/\/[^\s"'<>]+(?:download|attachment|file)[^\s"'<>]*\.pdf[^\s"'<>]*/gi;
  
  // Pattern 4: Links in anchor tags with PDF text/title
  const anchorPdfPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*(?:pdf|PDF|\.pdf)[^<]*)<\/a>/gi;
  
  // Pattern 5: Common file hosting services
  const fileHostingPattern = /https?:\/\/(?:drive\.google\.com|dropbox\.com|onedrive\.live\.com|sharepoint\.com|wetransfer\.com)[^\s"'<>]+/gi;
  
  // Extract PDF links
  for (const match of htmlBody.matchAll(pdfLinkPattern)) {
    const url = match[0].replace(/['"<>].*$/, '');
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      const fileName = url.split('/').pop()?.split('?')[0] || 'document.pdf';
      pdfAttachments.push({
        name: decodeURIComponent(fileName),
        contentType: 'application/pdf',
        url: url,
      });
    }
  }
  
  // Extract HEY file links
  for (const match of htmlBody.matchAll(heyFilePattern)) {
    const url = match[0].replace(/['"<>].*$/, '');
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      const fileName = url.split('/').pop()?.split('?')[0] || 'hey-file.pdf';
      pdfAttachments.push({
        name: decodeURIComponent(fileName),
        contentType: 'application/pdf',
        url: url,
      });
    }
  }
  
  // Extract from anchor tags with PDF content
  for (const match of htmlBody.matchAll(anchorPdfPattern)) {
    const url = match[1];
    if (url && !seenUrls.has(url) && !url.startsWith('mailto:')) {
      seenUrls.add(url);
      const linkText = match[2]?.trim() || 'document.pdf';
      const fileName = linkText.endsWith('.pdf') ? linkText : `${linkText}.pdf`;
      pdfAttachments.push({
        name: fileName,
        contentType: 'application/pdf',
        url: url,
      });
    }
  }
  
  console.info(`Extracted ${pdfAttachments.length} PDF links from body`);
  return pdfAttachments;
}

serve(async (req) => {
  console.info("=== PROCESS TRAVEL EMAIL (FAST) ===");
  console.info("Timestamp:", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: FlexibleEmailPayload = await req.json();
    console.info("Payload keys:", Object.keys(payload));

    // Extract email metadata ONLY - no heavy processing
    const fromAddress = extractEmailAddress(
      payload.from || payload.From || payload.fromFull || payload.FromFull || payload.sender
    );
    
    const toRaw = payload.to || payload.To || payload.toFull || payload.ToFull || payload.recipient;
    const toAddress = Array.isArray(toRaw) 
      ? extractEmailAddress(toRaw[0]) 
      : extractEmailAddress(toRaw);
    
    const subject = String(
      payload.subject || payload.Subject || "No Subject"
    );
    
    const textBody = String(
      payload.textBody || payload.TextBody || payload.text || payload.body || payload.Body || payload.plain || payload.Plain || ""
    );
    
    const htmlBody = String(
      payload.htmlBody || payload.HtmlBody || payload.html || payload.Html || ""
    );
    
    const receivedAt = payload.date || payload.Date || payload.received_at
      ? new Date(String(payload.date || payload.Date || payload.received_at)).toISOString()
      : new Date().toISOString();

    // Extract attachment info without downloading
    const attachmentInfo = extractAttachmentInfo(
      payload.attachments || payload.Attachments || payload.files
    );
    
    // Also extract PDF links from HTML body (for forwarded emails)
    const bodyPdfLinks = extractPdfLinksFromBody(htmlBody);
    
    // Combine both sources, body PDFs are often the actual attachments when forwarding
    const allAttachments = [...attachmentInfo, ...bodyPdfLinks];

    console.info("From:", fromAddress);
    console.info("To:", toAddress);
    console.info("Subject:", subject);
    console.info("Attachments from payload:", attachmentInfo.length);
    console.info("Attachments with Base64 content:", attachmentInfo.filter(a => a.content).length);
    console.info("PDF links from body:", bodyPdfLinks.length);
    console.info("Total attachments queued:", allAttachments.length);

    // Save email with attachment info for async processing
    const { data: emailData, error: emailError } = await supabase
      .from("travel_emails")
      .insert({
        from_address: fromAddress,
        to_address: toAddress,
        subject: subject,
        body_text: textBody,
        body_html: htmlBody,
        received_at: receivedAt,
        status: "pending",
        attachment_urls: allAttachments,
        raw_payload: payload,
      })
      .select()
      .single();

    if (emailError) {
      console.error("Error saving email:", emailError);
      throw emailError;
    }

    console.info("Email saved:", emailData.id);

    // ===== UPLOAD ATTACHMENTS WITH BASE64 CONTENT TO STORAGE =====
    let uploadedCount = 0;
    const attachmentsWithContent = attachmentInfo.filter(a => a.content);
    
    for (const attachment of attachmentsWithContent) {
      try {
        console.info(`Uploading attachment: ${attachment.name}`);
        
        // Decode Base64
        const cleanBase64 = attachment.content!.includes(',') 
          ? attachment.content!.split(',')[1] 
          : attachment.content!;
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create unique file path
        const sanitizedFilename = attachment.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${emailData.id}/${Date.now()}-${sanitizedFilename}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("travel-attachments")
          .upload(filePath, bytes, {
            contentType: attachment.contentType || "application/pdf",
            upsert: false
          });
        
        if (uploadError) {
          console.error(`Upload error for ${attachment.name}:`, uploadError);
          continue;
        }
        
        // Create attachment record in database
        const { error: insertError } = await supabase.from("travel_attachments").insert({
          email_id: emailData.id,
          file_name: attachment.name,
          file_path: filePath,
          content_type: attachment.contentType,
          file_size: bytes.length
        });
        
        if (insertError) {
          console.error(`DB insert error for ${attachment.name}:`, insertError);
          continue;
        }
        
        uploadedCount++;
        console.info(`✓ Attachment saved: ${filePath} (${bytes.length} bytes)`);
        
      } catch (attError) {
        console.error(`Error processing attachment ${attachment.name}:`, attError);
      }
    }
    
    console.info(`Uploaded ${uploadedCount}/${attachmentsWithContent.length} attachments to storage`);

    // Return immediately
    return new Response(
      JSON.stringify({
        success: true,
        email_id: emailData.id,
        message: "Email queued for processing",
        attachments_queued: allAttachments.length,
        attachments_uploaded: uploadedCount,
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
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
