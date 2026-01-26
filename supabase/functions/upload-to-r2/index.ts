import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

// AWS Signature V4 implementation for R2
async function createAwsSignature(
  method: string,
  url: URL,
  headers: Record<string, string>,
  body: Uint8Array,
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  service: string
): Promise<Record<string, string>> {
  const encoder = new TextEncoder();
  
  // Date in required formats
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);
  
  // Create canonical request
  const signedHeaders = Object.keys(headers).sort().join(';').toLowerCase();
  const canonicalHeaders = Object.entries(headers)
    .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}\n`)
    .join('');
  
  // Hash the payload
  const payloadHash = await crypto.subtle.digest('SHA-256', body.buffer as ArrayBuffer);
  const payloadHashHex = Array.from(new Uint8Array(payloadHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const canonicalRequest = [
    method,
    url.pathname,
    url.search.slice(1) || '',
    canonicalHeaders,
    signedHeaders,
    payloadHashHex
  ].join('\n');
  
  // Create string to sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const canonicalRequestHash = await crypto.subtle.digest('SHA-256', encoder.encode(canonicalRequest));
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    canonicalRequestHashHex
  ].join('\n');
  
  // Calculate signing key
  async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
    const keyBuffer = (key instanceof Uint8Array ? key.buffer : key) as ArrayBuffer;
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  }
  
  const kDate = await hmacSha256(encoder.encode(`AWS4${secretAccessKey}`), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  
  // Calculate signature
  const signature = await hmacSha256(kSigning, stringToSign);
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Create authorization header
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;
  
  return {
    ...headers,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHashHex,
    'Authorization': authorization
  };
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
      console.error("Missing R2 credentials:", { 
        hasEndpoint: !!r2Endpoint, 
        hasAccessKey: !!r2AccessKeyId, 
        hasSecretKey: !!r2SecretAccessKey 
      });
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

    // Upload to R2 using native fetch with AWS Signature V4
    const bucketName = "paterbrown-storage";
    
    // Parse R2 endpoint to construct URL
    // R2 endpoint format: https://<account_id>.r2.cloudflarestorage.com
    const r2Url = new URL(`${r2Endpoint}/${bucketName}/${r2Key}`);
    
    console.log("Uploading to R2:", { 
      url: r2Url.toString(), 
      key: r2Key,
      contentType: payload.contentType 
    });

    // Prepare headers for signing
    const host = r2Url.host;
    const headersToSign: Record<string, string> = {
      'Host': host,
      'Content-Type': payload.contentType || 'application/octet-stream',
      'Content-Length': fileBytes.length.toString(),
    };

    // Sign the request
    const signedHeaders = await createAwsSignature(
      'PUT',
      r2Url,
      headersToSign,
      fileBytes,
      r2AccessKeyId,
      r2SecretAccessKey,
      'auto',
      's3'
    );

    try {
      const uploadResponse = await fetch(r2Url.toString(), {
        method: 'PUT',
        headers: signedHeaders,
        body: fileBytes.buffer as ArrayBuffer,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("R2 upload failed:", { 
          status: uploadResponse.status, 
          statusText: uploadResponse.statusText,
          error: errorText 
        });
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `R2 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}` 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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
