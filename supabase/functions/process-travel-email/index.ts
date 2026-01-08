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

    // Process attachments if any (Postmark format)
    const attachments = emailPayload.Attachments || [];
    const savedAttachments: string[] = [];

    for (const attachment of attachments) {
      try {
        // Decode base64 content
        const binaryContent = Uint8Array.from(atob(attachment.Content), c => c.charCodeAt(0));
        
        // Generate unique file path
        const timestamp = Date.now();
        const sanitizedName = attachment.Name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = `${emailRecord.id}/${timestamp}_${sanitizedName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("travel-attachments")
          .upload(filePath, binaryContent, {
            contentType: attachment.ContentType,
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading attachment:", uploadError);
          continue;
        }

        // Save attachment record
        const { error: attachError } = await supabase
          .from("travel_attachments")
          .insert({
            email_id: emailRecord.id,
            file_name: attachment.Name,
            file_path: filePath,
            content_type: attachment.ContentType,
            file_size: attachment.ContentLength,
          });

        if (attachError) {
          console.error("Error saving attachment record:", attachError);
        } else {
          savedAttachments.push(attachment.Name);
        }
      } catch (attachErr) {
        console.error("Error processing attachment:", attachment.Name, attachErr);
      }
    }

    console.log("Saved attachments:", savedAttachments);

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
