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

// Convert Buffer array to base64 in chunks (avoids stack overflow)
function bufferArrayToBase64(bufferData: number[]): string | null {
  try {
    const bytes = new Uint8Array(bufferData);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
  } catch (err) {
    console.error("Buffer to base64 conversion failed:", err);
    return null;
  }
}

// Extract attachment from regex match in corrupted JSON string
function extractAttachmentFromString(attString: string): AttachmentInfo | null {
  console.info(`[AttachmentParser] Trying to parse string of length ${attString.length}`);
  
  // First try: standard JSON parse
  try {
    const parsed = JSON.parse(attString);
    if (typeof parsed === "object" && parsed !== null) {
      return extractAttachmentFromObject(parsed);
    }
  } catch {
    console.info("[AttachmentParser] JSON.parse failed, trying regex fallback");
  }
  
  // Second try: URL extraction
  const urlMatch = attString.match(/https?:\/\/[^\s"'<>,]+/);
  if (urlMatch) {
    const url = urlMatch[0];
    const nameMatch = url.match(/\/([^\/\?]+\.pdf)(\?|$)/i);
    const name = nameMatch ? decodeURIComponent(nameMatch[1]) : "attachment.pdf";
    console.info(`[AttachmentParser] Extracted URL: ${url}, name: ${name}`);
    return {
      name,
      contentType: "application/pdf",
      url,
    };
  }
  
  // Third try: Regex extraction for Buffer format
  const contentTypeMatch = attString.match(/"contentType"\s*:\s*"([^"]+)"/);
  const fileNameMatch = attString.match(/"(?:fileName|filename|name|Name)"\s*:\s*"([^"]+)"/);
  const fileSizeMatch = attString.match(/"(?:fileSize|size|contentLength)"\s*:\s*(\d+)/);
  const bufferMatch = attString.match(/"data"\s*:\s*\{"type"\s*:\s*"Buffer"\s*,\s*"data"\s*:\s*\[([0-9,\s]+)\]\}/);
  
  if (fileNameMatch) {
    const name = fileNameMatch[1];
    const contentType = contentTypeMatch ? contentTypeMatch[1] : "application/octet-stream";
    const size = fileSizeMatch ? parseInt(fileSizeMatch[1]) : undefined;
    
    let content: string | undefined;
    if (bufferMatch) {
      try {
        const bufferData = bufferMatch[1].split(",").map(n => parseInt(n.trim()));
        content = bufferArrayToBase64(bufferData) || undefined;
        console.info(`[AttachmentParser] Extracted buffer data: ${bufferData.length} bytes -> ${content?.length || 0} base64 chars`);
      } catch (e) {
        console.error("[AttachmentParser] Buffer extraction failed:", e);
      }
    }
    
    console.info(`[AttachmentParser] Regex extracted: ${name}, type: ${contentType}, hasContent: ${!!content}`);
    return { name, contentType, content, size };
  }
  
  console.info("[AttachmentParser] Could not extract attachment info from string");
  return null;
}

// Extract attachment from parsed object
function extractAttachmentFromObject(a: Record<string, unknown>): AttachmentInfo | null {
  // Get basic metadata
  const name = String(a.Name || a.name || a.FileName || a.fileName || a.filename || "attachment");
  const contentType = String(a.ContentType || a.contentType || a.content_type || a.mime_type || "application/octet-stream");
  const size = a.ContentLength || a.contentLength || a.fileSize || a.size 
    ? Number(a.ContentLength || a.contentLength || a.fileSize || a.size) 
    : undefined;
  
  // Try to get content
  let content: string | undefined;
  
  // Handle Buffer data format
  if (a.data && typeof a.data === "object") {
    const dataObj = a.data as Record<string, unknown>;
    if (dataObj.type === "Buffer" && Array.isArray(dataObj.data)) {
      const bufferData = dataObj.data as number[];
      console.info(`[AttachmentParser] Converting Buffer: ${bufferData.length} bytes`);
      content = bufferArrayToBase64(bufferData) || undefined;
    }
  } else if (a.Content || a.content || a.base64) {
    content = String(a.Content || a.content || a.base64);
  }
  
  // Get URL if available
  const url = a.url ? String(a.url) : undefined;
  
  console.info(`[AttachmentParser] Object extracted: ${name}, type: ${contentType}, hasContent: ${!!content}, hasUrl: ${!!url}`);
  
  return { name, contentType, content, url, size };
}

function extractAttachmentInfo(attachments: unknown): AttachmentInfo[] {
  if (!attachments) return [];
  
  console.info("[extractAttachmentInfo] Input type:", typeof attachments);
  console.info("[extractAttachmentInfo] Is array:", Array.isArray(attachments));
  
  // Handle URL string format (Zapier S3)
  if (typeof attachments === "string") {
    if (attachments.includes("http")) {
      const urls = attachments.split(",").filter(u => u.trim().startsWith("http"));
      console.info(`[extractAttachmentInfo] Found ${urls.length} URLs in string`);
      return urls.map((url) => ({
        name: url.split('/').pop()?.split('?')[0] || "attachment.pdf",
        contentType: "application/pdf",
        url: url.trim(),
      }));
    }
    
    // Try to extract as single attachment string
    const singleAtt = extractAttachmentFromString(attachments);
    if (singleAtt) return [singleAtt];
    
    return [];
  }
  
  if (!Array.isArray(attachments)) {
    // Maybe it's a single object
    if (typeof attachments === "object" && attachments !== null) {
      const singleAtt = extractAttachmentFromObject(attachments as Record<string, unknown>);
      if (singleAtt) return [singleAtt];
    }
    console.info("[extractAttachmentInfo] Not an array, skipping");
    return [];
  }
  
  console.info(`[extractAttachmentInfo] Processing ${attachments.length} attachments`);
  
  const result: AttachmentInfo[] = [];
  
  for (let i = 0; i < attachments.length; i++) {
    const att = attachments[i];
    console.info(`[Attachment ${i}] Type: ${typeof att}`);
    
    let attInfo: AttachmentInfo | null = null;
    
    if (typeof att === "string") {
      attInfo = extractAttachmentFromString(att);
    } else if (typeof att === "object" && att !== null) {
      attInfo = extractAttachmentFromObject(att as Record<string, unknown>);
    }
    
    if (attInfo) {
      result.push(attInfo);
    } else {
      console.info(`[Attachment ${i}] Could not extract info`);
    }
  }
  
  console.info(`[extractAttachmentInfo] Extracted ${result.length} valid attachments`);
  return result;
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
  
  console.info(`[extractPdfLinksFromBody] Extracted ${pdfAttachments.length} PDF links`);
  return pdfAttachments;
}

// Sanitize raw_payload to remove large attachment data (don't store files in DB)
function sanitizePayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  
  const sanitized = { ...(payload as Record<string, unknown>) };
  
  // Remove large attachment data, keep only metadata
  if (sanitized.attachments && Array.isArray(sanitized.attachments)) {
    sanitized.attachments = (sanitized.attachments as unknown[]).map((att) => {
      if (typeof att === "string") {
        // For string attachments, only keep first 200 chars for debugging
        return att.length > 200 ? `[TRUNCATED: ${att.length} chars]` : att;
      }
      if (typeof att === "object" && att !== null) {
        const a = att as Record<string, unknown>;
        return {
          name: a.Name || a.name || a.FileName || a.fileName,
          contentType: a.ContentType || a.contentType,
          size: a.ContentLength || a.contentLength || a.fileSize || a.size,
          hasContent: !!(a.Content || a.content || a.base64 || a.data),
          // Explicitly remove data/content fields
        };
      }
      return "[UNKNOWN FORMAT]";
    });
  }
  
  // Also handle Attachments (capitalized)
  if (sanitized.Attachments && Array.isArray(sanitized.Attachments)) {
    sanitized.Attachments = (sanitized.Attachments as unknown[]).map((att) => {
      if (typeof att === "string") {
        return att.length > 200 ? `[TRUNCATED: ${att.length} chars]` : att;
      }
      if (typeof att === "object" && att !== null) {
        const a = att as Record<string, unknown>;
        return {
          name: a.Name || a.name || a.FileName || a.fileName,
          contentType: a.ContentType || a.contentType,
          size: a.ContentLength || a.contentLength || a.fileSize || a.size,
          hasContent: !!(a.Content || a.content || a.base64 || a.data),
        };
      }
      return "[UNKNOWN FORMAT]";
    });
  }
  
  return sanitized;
}

serve(async (req) => {
  console.info("=== PROCESS TRAVEL EMAIL (ROBUST) ===");
  console.info("Timestamp:", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.info("Payload keys:", Object.keys(payload));

    // ===== CHECK IF THIS IS AN ATTACHMENT-ONLY REQUEST =====
    const isAttachmentOnly = payload.mail_id && 
      !payload.from && !payload.From && !payload.sender &&
      !payload.subject && !payload.Subject &&
      payload.content && payload.filename;

    if (isAttachmentOnly) {
      console.info("=== ATTACHMENT-ONLY MODE ===");
      console.info("mail_id:", payload.mail_id);
      console.info("filename:", payload.filename);
      console.info("content length:", payload.content?.length || 0);
      
      const { data: existingEmail, error: searchError } = await supabase
        .from("travel_emails")
        .select("id")
        .eq("id", payload.mail_id)
        .maybeSingle();
      
      if (searchError) {
        console.error("Search error:", searchError);
        return new Response(
          JSON.stringify({ success: false, error: "Database search failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (!existingEmail) {
        console.error("No email found for mail_id:", payload.mail_id);
        return new Response(
          JSON.stringify({ success: false, error: "Email not found for mail_id", mail_id: payload.mail_id }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.info("Found existing email:", existingEmail.id);
      
      try {
        const cleanBase64 = payload.content.includes(',') 
          ? payload.content.split(',')[1] 
          : payload.content;
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const sanitizedFilename = payload.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${existingEmail.id}/${Date.now()}-${sanitizedFilename}`;
        
        const { error: uploadError } = await supabase.storage
          .from("travel-attachments")
          .upload(filePath, bytes, {
            contentType: payload.contentType || "application/pdf",
            upsert: false
          });
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          return new Response(
            JSON.stringify({ success: false, error: uploadError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const { error: insertError } = await supabase.from("travel_attachments").insert({
          email_id: existingEmail.id,
          file_name: payload.filename,
          file_path: filePath,
          content_type: payload.contentType,
          file_size: bytes.length
        });
        
        if (insertError) {
          console.error("DB insert error:", insertError);
        }
        
        console.info("✓ Attachment saved:", filePath, `(${bytes.length} bytes)`);
        
        console.info("Triggering analyze-travel-booking for email:", existingEmail.id);
        try {
          const { error: invokeError } = await supabase.functions.invoke("analyze-travel-booking", {
            body: { email_id: existingEmail.id }
          });
          if (invokeError) {
            console.error("AI analysis invoke error:", invokeError);
          } else {
            console.info("✓ AI analysis triggered successfully");
          }
        } catch (err) {
          console.error("AI analysis trigger failed:", err);
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            mode: "attachment-only",
            email_id: existingEmail.id,
            file_path: filePath,
            file_size: bytes.length,
            message: "Attachment added to existing email and AI analysis triggered"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      } catch (decodeError) {
        console.error("Base64 decode error:", decodeError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to decode attachment" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ===== ORIGINAL EMAIL PROCESSING =====
    const typedPayload = payload as FlexibleEmailPayload;

    const fromAddress = extractEmailAddress(
      typedPayload.from || typedPayload.From || typedPayload.fromFull || typedPayload.FromFull || typedPayload.sender
    );
    
    const toRaw = typedPayload.to || typedPayload.To || typedPayload.toFull || typedPayload.ToFull || typedPayload.recipient;
    const toAddress = Array.isArray(toRaw) 
      ? extractEmailAddress(toRaw[0]) 
      : extractEmailAddress(toRaw);
    
    const subject = String(
      typedPayload.subject || typedPayload.Subject || "No Subject"
    );
    
    const textBody = String(
      typedPayload.textBody || typedPayload.TextBody || typedPayload.text || typedPayload.body || typedPayload.Body || typedPayload.plain || typedPayload.Plain || ""
    );
    
    const htmlBody = String(
      typedPayload.htmlBody || typedPayload.HtmlBody || typedPayload.html || typedPayload.Html || ""
    );
    
    const receivedAt = typedPayload.date || typedPayload.Date || typedPayload.received_at
      ? new Date(String(typedPayload.date || typedPayload.Date || typedPayload.received_at)).toISOString()
      : new Date().toISOString();

    // Extract attachment info with robust parsing
    const attachmentInfo = extractAttachmentInfo(
      typedPayload.attachments || typedPayload.Attachments || typedPayload.files
    );
    
    // Also extract PDF links from HTML body (for forwarded emails)
    const bodyPdfLinks = extractPdfLinksFromBody(htmlBody);
    
    // Combine both sources
    const allAttachments = [...attachmentInfo, ...bodyPdfLinks];
    const attachmentsWithContent = attachmentInfo.filter(a => a.content);
    const attachmentsWithUrl = allAttachments.filter(a => a.url && !a.content);

    console.info("=== ATTACHMENT SUMMARY ===");
    console.info("From:", fromAddress);
    console.info("To:", toAddress);
    console.info("Subject:", subject);
    console.info("Attachments from payload:", attachmentInfo.length);
    console.info("  - With Base64 content:", attachmentsWithContent.length);
    console.info("  - With URL only:", attachmentInfo.filter(a => a.url && !a.content).length);
    console.info("PDF links from body:", bodyPdfLinks.length);
    console.info("Total attachments queued:", allAttachments.length);

    // Sanitize payload before storing (no large attachment data in DB!)
    const sanitizedPayload = sanitizePayload(typedPayload);

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
        raw_payload: sanitizedPayload,
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
    
    for (const attachment of attachmentsWithContent) {
      try {
        console.info(`Uploading attachment: ${attachment.name}`);
        
        const cleanBase64 = attachment.content!.includes(',') 
          ? attachment.content!.split(',')[1] 
          : attachment.content!;
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const sanitizedFilename = attachment.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${emailData.id}/${Date.now()}-${sanitizedFilename}`;
        
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

    // ===== AUTOMATIC FOLLOW-UP PROCESSING =====
    // If we have URL-only attachments that weren't uploaded, trigger process-attachments
    if (attachmentsWithUrl.length > 0 && uploadedCount === 0) {
      console.info(`Triggering process-attachments for ${attachmentsWithUrl.length} URL-based attachments...`);
      try {
        const { error: processError } = await supabase.functions.invoke("process-attachments", {
          body: { email_id: emailData.id }
        });
        if (processError) {
          console.error("process-attachments invoke error:", processError);
        } else {
          console.info("✓ process-attachments triggered successfully");
        }
      } catch (err) {
        console.error("process-attachments trigger failed:", err);
      }
    }
    
    // If we uploaded at least one attachment, trigger AI analysis directly
    if (uploadedCount > 0) {
      console.info("Triggering analyze-travel-booking for uploaded attachments...");
      try {
        const { error: analyzeError } = await supabase.functions.invoke("analyze-travel-booking", {
          body: { email_id: emailData.id }
        });
        if (analyzeError) {
          console.error("analyze-travel-booking invoke error:", analyzeError);
        } else {
          console.info("✓ analyze-travel-booking triggered successfully");
        }
      } catch (err) {
        console.error("analyze-travel-booking trigger failed:", err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        email_id: emailData.id,
        message: "Email processed",
        attachments_queued: allAttachments.length,
        attachments_uploaded: uploadedCount,
        attachments_pending_download: attachmentsWithUrl.length,
        analysis_triggered: uploadedCount > 0,
        process_attachments_triggered: attachmentsWithUrl.length > 0 && uploadedCount === 0,
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
