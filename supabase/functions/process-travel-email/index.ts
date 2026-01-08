import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PostmarkInboundEmail {
  FromFull: { Email: string; Name: string };
  ToFull: Array<{ Email: string; Name: string }>;
  Subject: string;
  TextBody: string;
  HtmlBody: string;
  Date: string;
  Attachments?: Array<{
    Name: string;
    Content: string;
    ContentType: string;
    ContentLength: number;
  }>;
  Headers?: Array<{ Name: string; Value: string }>;
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

    // Parse the incoming email from Postmark
    const emailPayload: PostmarkInboundEmail = await req.json();
    
    console.log("Received email from:", emailPayload.FromFull?.Email);
    console.log("Subject:", emailPayload.Subject);

    // Save the email to the database
    const { data: emailRecord, error: emailError } = await supabase
      .from("travel_emails")
      .insert({
        from_address: emailPayload.FromFull?.Email || "unknown",
        to_address: emailPayload.ToFull?.[0]?.Email || null,
        subject: emailPayload.Subject || "(kein Betreff)",
        body_text: emailPayload.TextBody || "",
        body_html: emailPayload.HtmlBody || "",
        received_at: emailPayload.Date ? new Date(emailPayload.Date).toISOString() : new Date().toISOString(),
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

    // Process attachments if any
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
        attachments_saved: savedAttachments.length 
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
