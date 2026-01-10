import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Declare EdgeRuntime for Supabase Edge Functions
declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

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

// Shutdown handler for debugging
addEventListener('beforeunload', (ev: Event) => {
  const detail = (ev as CustomEvent).detail;
  console.log('=== FUNCTION SHUTDOWN ===');
  console.log('Reason:', detail?.reason || 'unknown');
});

serve(async (req) => {
  console.info("=== PROCESS TRAVEL EMAIL (ASYNC) ===");
  console.info("Timestamp:", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    
    // ===== ENHANCED LOGGING: Log EVERY incoming request =====
    console.info("=== INCOMING REQUEST ANALYSIS ===");
    console.info("Payload keys:", Object.keys(payload));
    console.info("filename:", payload.filename || "(nicht vorhanden)");
    console.info("contentType:", payload.contentType || "(nicht vorhanden)");
    console.info("mail_id:", payload.mail_id || "(nicht vorhanden)");
    console.info("Has download_url:", !!payload.download_url);
    console.info("Has content (base64):", !!payload.content);
    console.info("Has from/From/sender:", !!(payload.from || payload.From || payload.sender));
    console.info("Has subject/Subject:", !!(payload.subject || payload.Subject));
    
    // Debug: Show PDF-specific info if detected
    if (payload.contentType === "application/pdf" || 
        (payload.filename && payload.filename.toLowerCase().endsWith('.pdf'))) {
      console.info("=== PDF DETECTED ===");
      console.info("PDF filename:", payload.filename);
      console.info("PDF contentType:", payload.contentType);
      if (payload.download_url) {
        console.info("PDF download_url:", payload.download_url.substring(0, 300));
      }
    }

    // ===== CHECK IF THIS IS AN ATTACHMENT-ONLY REQUEST =====
    // Supports both Base64 content AND OneDrive download_url
    const isAttachmentOnly = payload.mail_id && 
      !payload.from && !payload.From && !payload.sender &&
      !payload.subject && !payload.Subject &&
      (payload.content || payload.download_url) && payload.filename;

    // ===== DEBUG: Why was attachment-only not detected? =====
    if (!isAttachmentOnly && payload.mail_id) {
      console.warn("=== ATTACHMENT-ONLY CHECK FAILED ===");
      console.warn("Condition breakdown:");
      console.warn("  mail_id vorhanden:", !!payload.mail_id, "->", payload.mail_id);
      console.warn("  from/From/sender NICHT vorhanden:", !payload.from && !payload.From && !payload.sender);
      console.warn("    from:", payload.from);
      console.warn("    From:", payload.From);
      console.warn("    sender:", payload.sender);
      console.warn("  subject/Subject NICHT vorhanden:", !payload.subject && !payload.Subject);
      console.warn("    subject:", payload.subject);
      console.warn("    Subject:", payload.Subject);
      console.warn("  content ODER download_url vorhanden:", !!(payload.content || payload.download_url));
      console.warn("    content:", !!payload.content);
      console.warn("    download_url:", !!payload.download_url);
      console.warn("  filename vorhanden:", !!payload.filename, "->", payload.filename);
    }
    
    // Also log if request has mail_id but no content/download_url
    if (payload.mail_id && !payload.content && !payload.download_url) {
      console.warn("=== REQUEST HAS mail_id BUT NO CONTENT/URL ===");
      console.warn("This request cannot be processed as attachment-only!");
      console.warn("Full payload (first 1000 chars):", JSON.stringify(payload).substring(0, 1000));
    }

    // ========================================
    // ATTACHMENT-ONLY MODE (ASYNC)
    // ========================================
    if (isAttachmentOnly) {
      console.info("=== ATTACHMENT-ONLY MODE (ASYNC) ===");
      console.info("mail_id:", payload.mail_id);
      console.info("filename:", payload.filename);
      console.info("contentType:", payload.contentType);
      console.info("Has download_url:", !!payload.download_url);
      console.info("Has content (base64):", !!payload.content);
      if (payload.download_url) {
        console.info("download_url:", payload.download_url);
      }
      
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
      
      // ✅ SOFORTIGE ANTWORT an Make.com
      const immediateResponse = new Response(
        JSON.stringify({
          success: true,
          mode: "attachment-only",
          email_id: existingEmail.id,
          message: "Attachment processing started in background",
          async_processing: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

      // 🔄 BACKGROUND PROCESSING mit EdgeRuntime.waitUntil()
      EdgeRuntime.waitUntil((async () => {
        console.info("=== BACKGROUND: Attachment-Only Processing Started ===");
        
        try {
          let bytes: Uint8Array;
          
          // ===== MODE A: Download from OneDrive URL =====
          if (payload.download_url) {
            console.info("BACKGROUND: Downloading from OneDrive URL...");
            
            const downloadResponse = await fetch(payload.download_url);
            
            if (!downloadResponse.ok) {
              console.error("BACKGROUND: Download failed:", downloadResponse.status, downloadResponse.statusText);
              await supabase.from("travel_emails")
                .update({ status: "error", error_message: `Download failed: ${downloadResponse.status}` })
                .eq("id", existingEmail.id);
              return;
            }
            
            const arrayBuffer = await downloadResponse.arrayBuffer();
            bytes = new Uint8Array(arrayBuffer);
            console.info("BACKGROUND: ✓ Downloaded from OneDrive:", bytes.length, "bytes");
            
          } 
          // ===== MODE B: Decode Base64 content =====
          else if (payload.content) {
            console.info("BACKGROUND: Decoding Base64 content...");
            const cleanBase64 = payload.content.includes(',') 
              ? payload.content.split(',')[1] 
              : payload.content;
            const binaryString = atob(cleanBase64);
            bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            console.info("BACKGROUND: ✓ Decoded Base64:", bytes.length, "bytes");
          } else {
            throw new Error("No content or download_url provided");
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
            console.error("BACKGROUND: Upload error:", uploadError);
            await supabase.from("travel_emails")
              .update({ status: "error", error_message: `Storage upload failed: ${uploadError.message}` })
              .eq("id", existingEmail.id);
            return;
          }
          
          const { error: insertError } = await supabase.from("travel_attachments").insert({
            email_id: existingEmail.id,
            file_name: payload.filename,
            file_path: filePath,
            content_type: payload.contentType || "application/pdf",
            file_size: bytes.length
          });
          
          if (insertError) {
            console.error("BACKGROUND: DB insert error:", insertError);
          }
          
          console.info("BACKGROUND: ✓ Attachment saved to storage:", filePath, `(${bytes.length} bytes)`);
          
          // Trigger AI analysis
          console.info("BACKGROUND: Triggering analyze-travel-booking for email:", existingEmail.id);
          try {
            const { error: invokeError } = await supabase.functions.invoke("analyze-travel-booking", {
              body: { email_id: existingEmail.id }
            });
            if (invokeError) {
              console.error("BACKGROUND: AI analysis invoke error:", invokeError);
            } else {
              console.info("BACKGROUND: ✓ AI analysis triggered successfully");
            }
          } catch (err) {
            console.error("BACKGROUND: AI analysis trigger failed:", err);
          }
          
          console.info("=== BACKGROUND: Attachment-Only Processing Complete ===");
          
        } catch (processError) {
          console.error("BACKGROUND: Attachment processing error:", processError);
          await supabase.from("travel_emails")
            .update({ 
              status: "error", 
              error_message: processError instanceof Error ? processError.message : "Background processing failed" 
            })
            .eq("id", existingEmail.id);
        }
      })());

      return immediateResponse;
    }

    // ========================================
    // ORIGINAL EMAIL PROCESSING (ASYNC)
    // ========================================
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

    // ✅ SOFORTIGE ANTWORT an Make.com
    const immediateResponse = new Response(
      JSON.stringify({
        success: true,
        email_id: emailData.id,
        message: "Email saved, processing started in background",
        async_processing: true,
        attachments_queued: allAttachments.length,
        attachments_with_content: attachmentsWithContent.length,
        attachments_with_url: attachmentsWithUrl.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

    // 🔄 BACKGROUND PROCESSING mit EdgeRuntime.waitUntil()
    EdgeRuntime.waitUntil((async () => {
      console.info("=== BACKGROUND: Email Processing Started ===");
      console.info("Email ID:", emailData.id);
      
      try {
        // ===== UPLOAD ATTACHMENTS WITH BASE64 CONTENT TO STORAGE =====
        let uploadedCount = 0;
        
        for (const attachment of attachmentsWithContent) {
          try {
            console.info(`BACKGROUND: Uploading attachment: ${attachment.name}`);
            
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
              console.error(`BACKGROUND: Upload error for ${attachment.name}:`, uploadError);
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
              console.error(`BACKGROUND: DB insert error for ${attachment.name}:`, insertError);
              continue;
            }
            
            uploadedCount++;
            console.info(`BACKGROUND: ✓ Attachment saved: ${filePath} (${bytes.length} bytes)`);
            
          } catch (attError) {
            console.error(`BACKGROUND: Error processing attachment ${attachment.name}:`, attError);
          }
        }
        
        console.info(`BACKGROUND: Uploaded ${uploadedCount}/${attachmentsWithContent.length} attachments to storage`);

        // ===== AUTOMATIC FOLLOW-UP PROCESSING =====
        // If we have URL-only attachments that weren't uploaded, trigger process-attachments
        if (attachmentsWithUrl.length > 0 && uploadedCount === 0) {
          console.info(`BACKGROUND: Triggering process-attachments for ${attachmentsWithUrl.length} URL-based attachments...`);
          try {
            const { error: processError } = await supabase.functions.invoke("process-attachments", {
              body: { email_id: emailData.id }
            });
            if (processError) {
              console.error("BACKGROUND: process-attachments invoke error:", processError);
            } else {
              console.info("BACKGROUND: ✓ process-attachments triggered successfully");
            }
          } catch (err) {
            console.error("BACKGROUND: process-attachments trigger failed:", err);
          }
        }
        
        // If we uploaded at least one attachment, trigger AI analysis directly
        if (uploadedCount > 0) {
          console.info("BACKGROUND: Triggering analyze-travel-booking for uploaded attachments...");
          try {
            const { error: analyzeError } = await supabase.functions.invoke("analyze-travel-booking", {
              body: { email_id: emailData.id }
            });
            if (analyzeError) {
              console.error("BACKGROUND: analyze-travel-booking invoke error:", analyzeError);
            } else {
              console.info("BACKGROUND: ✓ analyze-travel-booking triggered successfully");
            }
          } catch (err) {
            console.error("BACKGROUND: analyze-travel-booking trigger failed:", err);
          }
        }
        
        console.info("=== BACKGROUND: Email Processing Complete ===");
        
      } catch (bgError) {
        console.error("BACKGROUND: Processing error:", bgError);
        await supabase.from("travel_emails")
          .update({ 
            status: "error", 
            error_message: bgError instanceof Error ? bgError.message : "Background processing failed" 
          })
          .eq("id", emailData.id);
      }
    })());

    return immediateResponse;

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
