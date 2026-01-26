import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PresignedUrlRequest {
  files: Array<{
    fileName: string;
    contentType: string;
    folder: "documents" | "picks";
    customPath?: string; // Optional custom path for the file
  }>;
}

interface PresignedUrlResponse {
  success: boolean;
  urls?: Array<{
    fileName: string;
    uploadUrl: string;
    publicUrl: string;
    r2Key: string;
    customPath?: string;
  }>;
  error?: string;
}

// AWS Signature V4 implementation for presigned URLs
async function createPresignedUrl(
  method: string,
  bucket: string,
  key: string,
  endpoint: string,
  accessKeyId: string,
  secretAccessKey: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const encoder = new TextEncoder();
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);
  const region = 'auto';
  const service = 's3';
  
  // Parse endpoint
  const endpointUrl = new URL(endpoint);
  const host = `${bucket}.${endpointUrl.host}`;
  
  // Credential scope
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const credential = `${accessKeyId}/${credentialScope}`;
  
  // Cache-Control header for immutable caching (1 year)
  const cacheControl = 'public, max-age=31536000, immutable';
  
  // Build canonical query string
  const queryParams: Record<string, string> = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': credential,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': expiresIn.toString(),
    'X-Amz-SignedHeaders': 'cache-control;content-type;host',
  };
  
  // Sort and encode query string
  const canonicalQueryString = Object.keys(queryParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
    .join('&');
  
  // Canonical headers (must be sorted alphabetically)
  const canonicalHeaders = `cache-control:${cacheControl}\ncontent-type:${contentType}\nhost:${host}\n`;
  const signedHeaders = 'cache-control;content-type;host';
  
  // Canonical request (UNSIGNED-PAYLOAD for presigned URLs)
  const canonicalRequest = [
    method,
    '/' + key,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD'
  ].join('\n');
  
  // String to sign
  const canonicalRequestHash = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(canonicalRequest)
  );
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
  
  // Build presigned URL
  const presignedUrl = `https://${host}/${key}?${canonicalQueryString}&X-Amz-Signature=${signatureHex}`;
  
  return presignedUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload: PresignedUrlRequest = await req.json();
    
    console.log("Presigned URL request:", { fileCount: payload.files?.length });

    if (!payload.files || payload.files.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No files specified" } as PresignedUrlResponse),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch R2 credentials
    const { data: settings, error: settingsError } = await supabase
      .from("admin_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["r2_endpoint", "r2_access_key_id", "r2_secret_access_key"]);

    if (settingsError) {
      console.error("Error fetching R2 settings:", settingsError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch R2 configuration" } as PresignedUrlResponse),
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "R2 credentials not configured. Please add them in Admin Settings." 
        } as PresignedUrlResponse),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bucketName = "paterbrown-storage";
    const publicUrlBase = "https://pub-4061a33a9b314588bf9fc24f750ecf89.r2.dev";
    
    // Generate presigned URLs for all files
    const urls = await Promise.all(payload.files.map(async (file) => {
      // Use customPath if provided, otherwise generate a path
      let r2Key: string;
      if (file.customPath) {
        r2Key = file.customPath;
      } else {
        const timestamp = Date.now() + Math.floor(Math.random() * 1000);
        const sanitizedFilename = file.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        r2Key = `${file.folder}/${timestamp}-${sanitizedFilename}`;
      }
      
      const uploadUrl = await createPresignedUrl(
        'PUT',
        bucketName,
        r2Key,
        r2Endpoint,
        r2AccessKeyId,
        r2SecretAccessKey,
        file.contentType || 'application/octet-stream',
        3600 // 1 hour expiry
      );
      
      return {
        fileName: file.fileName,
        uploadUrl,
        publicUrl: `${publicUrlBase}/${r2Key}`,
        r2Key,
        customPath: file.customPath,
      };
    }));

    console.log(`Generated ${urls.length} presigned URLs`);

    return new Response(
      JSON.stringify({
        success: true,
        urls,
      } as PresignedUrlResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage } as PresignedUrlResponse),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
