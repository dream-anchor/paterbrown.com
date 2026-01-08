import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Flexible interface supporting both Postmark and Zapier formats
interface FlexibleEmailPayload {
  // Postmark format (nested objects)
  FromFull?: { Email: string; Name: string };
  ToFull?: Array<{ Email: string; Name: string }>;
  
  // Zapier/Simple format (flat strings)
  From?: string;
  To?: string;
  from?: string;
  to?: string;
  
  // Subject variations
  Subject?: string;
  subject?: string;
  
  // Body variations
  TextBody?: string;
  text_body?: string;
  body?: string;
  Body?: string;
  plain?: string;
  Plain?: string;
  
  // HTML body variations
  HtmlBody?: string;
  html_body?: string;
  html?: string;
  Html?: string;
  
  // Date variations
  Date?: string;
  date?: string;
  received_at?: string;
  
  // Attachments (Postmark format)
  Attachments?: Array<{
    Name: string;
    Content: string;
    ContentType: string;
    ContentLength: number;
  }>;
  
  // Headers (Postmark format)
  Headers?: Array<{ Name: string; Value: string }>;
}

// Helper function to extract email address from various formats
function extractEmailAddress(value: unknown): string {
  if (!value) return "unknown";
  
  // If it's an object with Email property (Postmark format)
  if (typeof value === "object" && value !== null && "Email" in value) {
    return (value as { Email: string }).Email || "unknown";
  }
  
  // If it's a string, it might be "Name <email@example.com>" or just "email@example.com"
  if (typeof value === "string") {
    const emailMatch = value.match(/<([^>]+)>/);
    if (emailMatch) return emailMatch[1];
    return value;
  }
  
  return "unknown";
}

// Helper function to download attachment from URL (Zapier S3 format)
async function downloadAttachmentFromUrl(url: string): Promise<{
  content: Uint8Array;
  filename: string;
  contentType: string;
} | null> {
  try {
    console.log("Downloading attachment from URL:", url.substring(0, 100) + "...");
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to download attachment:", response.status, response.statusText);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const content = new Uint8Array(arrayBuffer);
    
    // Extract filename from URL or Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'attachment.pdf';
    
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match) filename = match[1].replace(/['"]/g, '');
    } else {
      // Try to extract from URL
      try {
        const urlPath = new URL(url).pathname;
        const urlFilename = urlPath.split('/').pop();
        if (urlFilename && urlFilename.includes('.')) {
          filename = decodeURIComponent(urlFilename);
        }
      } catch {
        // Keep default filename
      }
    }
    
    const contentType = response.headers.get('Content-Type') || 'application/pdf';
    
    console.log(`Downloaded: ${filename}, size: ${content.length}, type: ${contentType}`);
    return { content, filename, contentType };
  } catch (error) {
    console.error("Error downloading attachment from URL:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the incoming email payload
    const emailPayload: FlexibleEmailPayload = await req.json();
    
    // Debug: Log the raw payload structure
    console.log("Raw payload keys:", Object.keys(emailPayload));
    console.log("Raw payload:", JSON.stringify(emailPayload, null, 2));

    // Flexibly extract fields from various formats
    const fromAddress = extractEmailAddress(
      emailPayload.FromFull || emailPayload.From || emailPayload.from
    );
    
    const toAddress = extractEmailAddress(
      emailPayload.ToFull?.[0] || emailPayload.To || emailPayload.to
    );
    
    const subject = 
      emailPayload.Subject || 
      emailPayload.subject || 
      "(kein Betreff)";
    
    const textBody = 
      emailPayload.TextBody || 
      emailPayload.text_body || 
      emailPayload.body || 
      emailPayload.Body ||
      emailPayload.plain ||
      emailPayload.Plain ||
      "";
    
    const htmlBody = 
      emailPayload.HtmlBody || 
      emailPayload.html_body ||
      emailPayload.html ||
      emailPayload.Html ||
      "";
    
    const receivedAt = 
      emailPayload.Date || 
      emailPayload.date ||
      emailPayload.received_at ||
      new Date().toISOString();

    console.log("Extracted - From:", fromAddress);
    console.log("Extracted - To:", toAddress);
    console.log("Extracted - Subject:", subject);
    console.log("Extracted - Body length:", textBody.length);

    // Save the email to the database
    const { data: emailRecord, error: emailError } = await supabase
      .from("travel_emails")
      .insert({
        from_address: fromAddress,
        to_address: toAddress,
        subject: subject,
        body_text: textBody,
        body_html: htmlBody,
        received_at: new Date(receivedAt).toISOString(),
        status: "pending",
        raw_payload: emailPayload,
      })
      .select()
      .single();

    if (emailError) {
      console.error("Error saving email:", emailError);
      throw emailError;
    }

    console.log("Email saved with ID:", emailRecord.id);

    // Process attachments - support multiple formats
    // Postmark: emailPayload.Attachments
    // Zapier/other: emailPayload.attachments or emailPayload.files
    const rawAttachments = 
      emailPayload.Attachments || 
      (emailPayload as any).attachments ||
      (emailPayload as any).files ||
      [];
    
    console.log("Raw attachments received:", rawAttachments?.length || 0);
    console.log("Attachment format check:", {
      hasPostmarkAttachments: !!emailPayload.Attachments,
      hasLowerAttachments: !!(emailPayload as any).attachments,
      hasFiles: !!(emailPayload as any).files,
      attachmentKeys: rawAttachments?.length > 0 ? Object.keys(rawAttachments[0]) : []
    });

    const savedAttachments: string[] = [];

    for (const attachment of rawAttachments) {
      try {
        // Support different attachment formats
        const name = attachment.Name || attachment.name || attachment.filename || attachment.fileName || 'unknown';
        const content = attachment.Content || attachment.content || attachment.data || attachment.base64;
        const contentType = attachment.ContentType || attachment.contentType || attachment.content_type || attachment.mime_type || 'application/octet-stream';
        const contentLength = attachment.ContentLength || attachment.contentLength || attachment.size || 0;

        console.log(`Processing attachment: ${name}, type: ${contentType}, hasContent: ${!!content}`);

        if (!content) {
          console.warn(`Attachment ${name} has no content, skipping`);
          continue;
        }

        // Decode base64 content
        const binaryContent = Uint8Array.from(atob(content), c => c.charCodeAt(0));
        
        // Generate unique file path
        const timestamp = Date.now();
        const sanitizedName = name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = `${emailRecord.id}/${timestamp}_${sanitizedName}`;

        console.log(`Uploading to path: ${filePath}, size: ${binaryContent.length}`);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("travel-attachments")
          .upload(filePath, binaryContent, {
            contentType: contentType,
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading attachment:", uploadError);
          continue;
        }

        console.log(`Successfully uploaded: ${filePath}`);

        // Save attachment record
        const { error: attachError } = await supabase
          .from("travel_attachments")
          .insert({
            email_id: emailRecord.id,
            file_name: name,
            file_path: filePath,
            content_type: contentType,
            file_size: contentLength || binaryContent.length,
          });

        if (attachError) {
          console.error("Error saving attachment record:", attachError);
        } else {
          savedAttachments.push(name);
          console.log(`Attachment record saved: ${name}`);
        }
      } catch (attachErr) {
        console.error("Error processing attachment:", attachErr);
      }
    }

    // Check for Zapier URL format (string with S3 URL)
    const attachmentsField = (emailPayload as any).Attachments;
    if (typeof attachmentsField === 'string' && attachmentsField.includes('http')) {
      // Zapier sends attachment URLs as comma-separated string or single URL
      const zapierAttachmentUrls = attachmentsField.split(',').map((url: string) => url.trim()).filter(Boolean);
      console.log("Detected Zapier S3 attachment URLs:", zapierAttachmentUrls.length);

      for (const url of zapierAttachmentUrls) {
        const downloaded = await downloadAttachmentFromUrl(url);
        
        if (!downloaded) {
          console.warn("Could not download attachment from URL:", url.substring(0, 80));
          continue;
        }
        
        const { content, filename, contentType } = downloaded;
        
        // Generate unique file path
        const timestamp = Date.now();
        const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = `${emailRecord.id}/${timestamp}_${sanitizedName}`;

        console.log(`Uploading URL attachment to path: ${filePath}, size: ${content.length}`);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("travel-attachments")
          .upload(filePath, content, {
            contentType: contentType,
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading URL attachment:", uploadError);
          continue;
        }

        // Save attachment record
        const { error: attachError } = await supabase
          .from("travel_attachments")
          .insert({
            email_id: emailRecord.id,
            file_name: filename,
            file_path: filePath,
            content_type: contentType,
            file_size: content.length,
          });

        if (!attachError) {
          savedAttachments.push(filename);
          console.log(`URL attachment saved: ${filename}`);
        }
      }
    }

    console.log("Total saved attachments:", savedAttachments.length, savedAttachments);

    // Update email status to processing
    await supabase
      .from("travel_emails")
      .update({ status: "processing" })
      .eq("id", emailRecord.id);

    // Trigger the AI analysis function
    const analyzeUrl = `${supabaseUrl}/functions/v1/analyze-travel-booking`;
    
    const analyzeResponse = await fetch(analyzeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ email_id: emailRecord.id }),
    });

    if (!analyzeResponse.ok) {
      const errorText = await analyzeResponse.text();
      console.error("AI analysis failed:", errorText);
      
      await supabase
        .from("travel_emails")
        .update({ 
          status: "error",
          error_message: `AI analysis failed: ${errorText}` 
        })
        .eq("id", emailRecord.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailRecord.id,
        attachments_saved: savedAttachments.length,
        extracted: { fromAddress, toAddress, subject, bodyLength: textBody.length }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error("Error processing email:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
