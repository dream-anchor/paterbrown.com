import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.400.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UploadPayload {
  fileName: string;
  contentType: string;
  content: string; // Base64
  folder: "documents" | "picks";
}

// Decode Base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
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
    const payload: UploadPayload = await req.json();
    
    console.log("Received upload request:", {
      fileName: payload.fileName,
      contentType: payload.contentType,
      folder: payload.folder,
      contentLength: payload.content?.length || 0,
    });

    // Validate required fields
    if (!payload.fileName) {
      return new Response(
        JSON.stringify({ success: false, error: "fileName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.content) {
      return new Response(
        JSON.stringify({ success: false, error: "content (Base64) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.folder || !["documents", "picks"].includes(payload.folder)) {
      return new Response(
        JSON.stringify({ success: false, error: "folder must be 'documents' or 'picks'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch R2 credentials from admin_settings
    const { data: settings, error: settingsError } = await supabase
      .from("admin_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["r2_endpoint", "r2_access_key_id", "r2_secret_access_key"]);

    if (settingsError) {
      console.error("Error fetching R2 settings:", settingsError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch R2 configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const settingsMap: Record<string, string> = {};
    settings?.forEach(s => {
      settingsMap[s.setting_key] = s.setting_value;
    });

    const r2Endpoint = settingsMap["r2_endpoint"];
    const r2AccessKeyId = settingsMap["r2_access_key_id"];
    const r2SecretAccessKey = settingsMap["r2_secret_access_key"];

    if (!r2Endpoint || !r2AccessKeyId || !r2SecretAccessKey) {
      console.error("Missing R2 credentials");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "R2 credentials not configured. Please add them in Admin Settings." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Create file path: folder/timestamp-filename
    const timestamp = Date.now();
    const sanitizedFilename = payload.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const r2Key = `${payload.folder}/${timestamp}-${sanitizedFilename}`;

    // Initialize S3 client for R2
    const s3Client = new S3Client({
      region: "auto",
      endpoint: r2Endpoint,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });

    // Upload to R2
    const bucketName = "paterbrown-storage";
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: r2Key,
      Body: fileBytes,
      ContentType: payload.contentType || "application/octet-stream",
    });

    try {
      await s3Client.send(putCommand);
      console.log(`File uploaded to R2: ${r2Key}`);
    } catch (uploadError) {
      console.error("R2 upload error:", uploadError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `R2 upload failed: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}` 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the public URL
    const publicUrlBase = "https://pub-4061a33a9b314588bf9fc24f750ecf89.r2.dev";
    const publicUrl = `${publicUrlBase}/${r2Key}`;

    console.log("Upload successful:", {
      r2Key,
      publicUrl,
      fileSize: fileBytes.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        r2_key: r2Key,
        public_url: publicUrl,
        file_size: fileBytes.length,
        message: `File "${payload.fileName}" uploaded to R2 successfully`,
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
