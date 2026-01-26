import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteFilesPayload {
  fileKeys: string[];
}

// AWS Signature V4 implementation for R2
async function createAwsSignature(
  method: string,
  url: URL,
  headers: Record<string, string>,
  payloadHash: string,
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  service: string
): Promise<Record<string, string>> {
  const encoder = new TextEncoder();
  
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);
  
  const signedHeaders = Object.keys(headers).sort().join(';').toLowerCase();
  const canonicalHeaders = Object.entries(headers)
    .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}\n`)
    .join('');
  
  const canonicalRequest = [
    method,
    url.pathname,
    url.search.slice(1) || '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
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
  
  const signature = await hmacSha256(kSigning, stringToSign);
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;
  
  return {
    ...headers,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    'Authorization': authorization
  };
}

// Extract R2 key from full URL or path
function extractR2Key(filePath: string): string | null {
  if (filePath.includes("r2.dev/")) {
    const match = filePath.match(/r2\.dev\/(.+)$/);
    return match ? match[1] : null;
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload: DeleteFilesPayload = await req.json();
    
    console.log("Delete files request:", { fileCount: payload.fileKeys?.length });

    if (!payload.fileKeys || payload.fileKeys.length === 0) {
      return new Response(
        JSON.stringify({ success: true, deleted: 0, message: "No files to delete" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
          error: "R2 credentials not configured" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bucketName = "paterbrown-storage";
    let deletedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Process each file
    for (const filePath of payload.fileKeys) {
      // Extract R2 key from URL
      const r2Key = extractR2Key(filePath);
      
      if (!r2Key) {
        console.log(`Skipping non-R2 file: ${filePath}`);
        continue;
      }

      try {
        const r2Url = new URL(`${r2Endpoint}/${bucketName}/${r2Key}`);
        
        console.log(`Deleting from R2: ${r2Key}`);

        const host = r2Url.host;
        const headersToSign: Record<string, string> = {
          'Host': host,
        };

        // For DELETE, we use empty payload hash
        const emptyHash = await crypto.subtle.digest('SHA-256', new Uint8Array(0));
        const emptyHashHex = Array.from(new Uint8Array(emptyHash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        const signedHeaders = await createAwsSignature(
          'DELETE',
          r2Url,
          headersToSign,
          emptyHashHex,
          r2AccessKeyId,
          r2SecretAccessKey,
          'auto',
          's3'
        );

        const deleteResponse = await fetch(r2Url.toString(), {
          method: 'DELETE',
          headers: signedHeaders,
        });

        // R2 returns 204 for successful delete, 404 if not found (also counts as success)
        if (deleteResponse.ok || deleteResponse.status === 404) {
          console.log(`Successfully deleted: ${r2Key}`);
          deletedCount++;
        } else {
          const errorText = await deleteResponse.text();
          console.error(`Failed to delete ${r2Key}:`, deleteResponse.status, errorText);
          errors.push(`${r2Key}: ${deleteResponse.status}`);
          failedCount++;
        }
      } catch (error) {
        console.error(`Error deleting ${filePath}:`, error);
        errors.push(`${filePath}: ${error instanceof Error ? error.message : "Unknown error"}`);
        failedCount++;
      }
    }

    console.log(`Deletion complete: ${deletedCount} deleted, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: failedCount === 0,
        deleted: deletedCount,
        failed: failedCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `${deletedCount} file(s) deleted from R2${failedCount > 0 ? `, ${failedCount} failed` : ""}`
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
