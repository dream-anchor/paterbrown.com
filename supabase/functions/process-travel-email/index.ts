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
    if (typeof att !== "object" || att === null) return null;
    const a = att as Record<string, unknown>;
    
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

    console.info("From:", fromAddress);
    console.info("To:", toAddress);
    console.info("Subject:", subject);
    console.info("Attachments queued:", attachmentInfo.length);

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
        attachment_urls: attachmentInfo,
        raw_payload: payload,
      })
      .select()
      .single();

    if (emailError) {
      console.error("Error saving email:", emailError);
      throw emailError;
    }

    console.info("Email saved:", emailData.id);
    console.info("Response time: < 100ms");

    // Return immediately - no attachment processing, no AI analysis
    return new Response(
      JSON.stringify({
        success: true,
        email_id: emailData.id,
        message: "Email queued for processing",
        attachments_queued: attachmentInfo.length,
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
