import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AttachmentPayload {
  mail_id: string;
  filename: string;
  contentType: string;
  size: number | string;
  content: string; // Base64
}

// Decode Base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  // Handle data URL format if present
  const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload: AttachmentPayload = await req.json();
    
    console.log("Received attachment payload:", {
      mail_id: payload.mail_id,
      filename: payload.filename,
      contentType: payload.contentType,
      size: payload.size,
      contentLength: payload.content?.length || 0,
    });

    // Validate required fields
    if (!payload.mail_id) {
      console.error("Missing mail_id");
      return new Response(
        JSON.stringify({ success: false, error: "mail_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.filename) {
      console.error("Missing filename");
      return new Response(
        JSON.stringify({ success: false, error: "filename is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.content || payload.content.length === 0) {
      console.error("Missing or empty content");
      return new Response(
        JSON.stringify({ success: false, error: "content (Base64) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate attachment
    const { data: existingAttachment } = await supabase
      .from("travel_attachments")
      .select("id")
      .eq("file_name", payload.filename)
      .ilike("file_path", `%${payload.mail_id}%`)
      .maybeSingle();

    if (existingAttachment) {
      console.log("Attachment already exists, skipping:", payload.filename);
      return new Response(
        JSON.stringify({ success: true, message: "Attachment already exists", attachment_id: existingAttachment.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decode Base64 content
    let fileBytes: Uint8Array;
    try {
      fileBytes = base64ToUint8Array(payload.content);
      console.log(`Decoded ${fileBytes.length} bytes from Base64`);
    } catch (decodeError) {
      console.error("Base64 decode error:", decodeError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid Base64 content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create file path: mail_id/timestamp-filename
    const timestamp = Date.now();
    const sanitizedFilename = payload.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${payload.mail_id}/${timestamp}-${sanitizedFilename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("travel-attachments")
      .upload(filePath, fileBytes, {
        contentType: payload.contentType || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({ success: false, error: `Storage upload failed: ${uploadError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`File uploaded to storage: ${filePath}`);

    // Find or create the email record
    let emailId: string | null = null;
    
    // First, try to find by mail_id in raw_payload
    const { data: existingEmail } = await supabase
      .from("travel_emails")
      .select("id")
      .contains("raw_payload", { mail_id: payload.mail_id })
      .maybeSingle();

    if (existingEmail) {
      emailId = existingEmail.id;
      console.log("Found existing email by mail_id:", emailId);
    } else {
      // Create a placeholder email record for this mail_id
      const { data: newEmail, error: emailError } = await supabase
        .from("travel_emails")
        .insert({
          from_address: "attachment-upload@make.com",
          subject: `Attachments for mail_id: ${payload.mail_id}`,
          status: "pending",
          raw_payload: { mail_id: payload.mail_id },
        })
        .select("id")
        .single();

      if (emailError) {
        console.error("Error creating email record:", emailError);
      } else {
        emailId = newEmail.id;
        console.log("Created new email record:", emailId);
      }
    }

    // Create attachment record
    const fileSize = typeof payload.size === 'string' ? parseInt(payload.size, 10) || fileBytes.length : payload.size || fileBytes.length;
    
    const { data: attachment, error: attachmentError } = await supabase
      .from("travel_attachments")
      .insert({
        email_id: emailId,
        file_name: payload.filename,
        file_path: filePath,
        content_type: payload.contentType || "application/octet-stream",
        file_size: fileSize,
      })
      .select("id")
      .single();

    if (attachmentError) {
      console.error("Error creating attachment record:", attachmentError);
      return new Response(
        JSON.stringify({ success: false, error: `Database insert failed: ${attachmentError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Attachment record created:", attachment.id);

    // Trigger AI analysis if this is a PDF or image
    const isAnalyzable = 
      payload.contentType?.includes('pdf') || 
      payload.contentType?.includes('image') ||
      payload.filename.toLowerCase().endsWith('.pdf') ||
      payload.filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);

    if (isAnalyzable && emailId) {
      console.log("Triggering AI analysis for email:", emailId);
      
      try {
        // Use Supabase Functions invoke instead of raw fetch
        const functionUrl = `${supabaseUrl}/functions/v1/analyze-travel-booking`;
        const analyzeResponse = await fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ email_id: emailId }),
        });

        if (analyzeResponse.ok) {
          const analyzeResult = await analyzeResponse.json();
          console.log("AI analysis triggered successfully:", analyzeResult);
        } else {
          const errorText = await analyzeResponse.text();
          console.error("AI analysis failed:", errorText);
        }
      } catch (analyzeError) {
        console.error("Error triggering AI analysis:", analyzeError);
        // Don't fail the main request if analysis fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        attachment_id: attachment.id,
        email_id: emailId,
        file_path: filePath,
        message: `Attachment "${payload.filename}" saved successfully`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
