import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const R2_PUBLIC_URL_BASE = "https://pub-4061a33a9b314588bf9fc24f750ecf89.r2.dev";
const R2_BUCKET_NAME = "paterbrown-storage";

interface MigrationResult {
  total: number;
  migrated: number;
  skipped: number;
  errors: string[];
  details: Array<{
    table: string;
    id: string;
    fileName: string;
    status: "migrated" | "skipped" | "error";
    message?: string;
  }>;
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
  
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);
  
  const signedHeaders = Object.keys(headers).sort().join(';').toLowerCase();
  const canonicalHeaders = Object.entries(headers)
    .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}\n`)
    .join('');
  
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
    'x-amz-content-sha256': payloadHashHex,
    'Authorization': authorization
  };
}

// Upload to R2 using native fetch
async function uploadToR2(
  fileBytes: Uint8Array,
  r2Key: string,
  contentType: string,
  r2Endpoint: string,
  r2AccessKeyId: string,
  r2SecretAccessKey: string
): Promise<void> {
  const r2Url = new URL(`${r2Endpoint}/${R2_BUCKET_NAME}/${r2Key}`);
  
  const headersToSign: Record<string, string> = {
    'Host': r2Url.host,
    'Content-Type': contentType,
    'Content-Length': fileBytes.length.toString(),
  };

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

  const uploadResponse = await fetch(r2Url.toString(), {
    method: 'PUT',
    headers: signedHeaders,
    body: fileBytes.buffer as ArrayBuffer,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`R2 upload failed: ${uploadResponse.status} ${errorText}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const result: MigrationResult = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: [],
    details: [],
  };

  try {
    console.log("Starting legacy files migration...");

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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "R2 credentials not configured. Please add them in Admin Settings first." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== MIGRATE DOCUMENTS ==========
    console.log("Fetching documents from internal_documents...");
    const { data: documents, error: docsError } = await supabase
      .from("internal_documents")
      .select("id, file_path, file_name");

    if (docsError) {
      console.error("Error fetching documents:", docsError);
      result.errors.push(`Failed to fetch documents: ${docsError.message}`);
    } else if (documents) {
      for (const doc of documents) {
        result.total++;
        
        // Check if already migrated (R2 URL)
        if (doc.file_path.includes("r2.dev")) {
          result.skipped++;
          result.details.push({
            table: "internal_documents",
            id: doc.id,
            fileName: doc.file_name,
            status: "skipped",
            message: "Already on R2",
          });
          continue;
        }

        try {
          console.log(`Migrating document: ${doc.file_name} (${doc.id})`);

          // Download from Supabase Storage
          const { data: fileData, error: downloadError } = await supabase.storage
            .from("internal-documents")
            .download(doc.file_path);

          if (downloadError || !fileData) {
            throw new Error(`Download failed: ${downloadError?.message || "No data"}`);
          }

          // Convert to Uint8Array
          const fileBytes = new Uint8Array(await fileData.arrayBuffer());

          // Create R2 key
          const timestamp = Date.now();
          const sanitizedFilename = doc.file_name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const r2Key = `documents/${timestamp}-${sanitizedFilename}`;

          // Upload to R2
          await uploadToR2(
            fileBytes,
            r2Key,
            fileData.type || "application/octet-stream",
            r2Endpoint,
            r2AccessKeyId,
            r2SecretAccessKey
          );
          console.log(`Uploaded to R2: ${r2Key}`);

          // Update database with new R2 URL
          const newUrl = `${R2_PUBLIC_URL_BASE}/${r2Key}`;
          const { error: updateError } = await supabase
            .from("internal_documents")
            .update({ file_path: newUrl })
            .eq("id", doc.id);

          if (updateError) {
            throw new Error(`Database update failed: ${updateError.message}`);
          }

          // Delete from Supabase Storage
          const { error: deleteError } = await supabase.storage
            .from("internal-documents")
            .remove([doc.file_path]);

          if (deleteError) {
            console.warn(`Warning: Could not delete old file from Supabase: ${deleteError.message}`);
          }

          result.migrated++;
          result.details.push({
            table: "internal_documents",
            id: doc.id,
            fileName: doc.file_name,
            status: "migrated",
            message: `Migrated to ${r2Key}`,
          });

        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          console.error(`Error migrating document ${doc.id}:`, errorMsg);
          result.errors.push(`Document ${doc.file_name}: ${errorMsg}`);
          result.details.push({
            table: "internal_documents",
            id: doc.id,
            fileName: doc.file_name,
            status: "error",
            message: errorMsg,
          });
        }
      }
    }

    // ========== MIGRATE IMAGES (PICKS) ==========
    console.log("Fetching images from images table...");
    const { data: images, error: imagesError } = await supabase
      .from("images")
      .select("id, file_path, file_name");

    if (imagesError) {
      console.error("Error fetching images:", imagesError);
      result.errors.push(`Failed to fetch images: ${imagesError.message}`);
    } else if (images) {
      for (const img of images) {
        result.total++;
        
        // Check if already migrated (R2 URL)
        if (img.file_path.includes("r2.dev")) {
          result.skipped++;
          result.details.push({
            table: "images",
            id: img.id,
            fileName: img.file_name,
            status: "skipped",
            message: "Already on R2",
          });
          continue;
        }

        try {
          console.log(`Migrating image: ${img.file_name} (${img.id})`);

          // Download from Supabase Storage
          const { data: fileData, error: downloadError } = await supabase.storage
            .from("picks-images")
            .download(img.file_path);

          if (downloadError || !fileData) {
            throw new Error(`Download failed: ${downloadError?.message || "No data"}`);
          }

          // Convert to Uint8Array
          const fileBytes = new Uint8Array(await fileData.arrayBuffer());

          // Create R2 key
          const timestamp = Date.now();
          const sanitizedFilename = img.file_name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const r2Key = `picks/${timestamp}-${sanitizedFilename}`;

          // Upload to R2
          await uploadToR2(
            fileBytes,
            r2Key,
            fileData.type || "image/jpeg",
            r2Endpoint,
            r2AccessKeyId,
            r2SecretAccessKey
          );
          console.log(`Uploaded to R2: ${r2Key}`);

          // Update database with new R2 URL
          const newUrl = `${R2_PUBLIC_URL_BASE}/${r2Key}`;
          const { error: updateError } = await supabase
            .from("images")
            .update({ file_path: newUrl })
            .eq("id", img.id);

          if (updateError) {
            throw new Error(`Database update failed: ${updateError.message}`);
          }

          // Delete from Supabase Storage
          const { error: deleteError } = await supabase.storage
            .from("picks-images")
            .remove([img.file_path]);

          if (deleteError) {
            console.warn(`Warning: Could not delete old file from Supabase: ${deleteError.message}`);
          }

          result.migrated++;
          result.details.push({
            table: "images",
            id: img.id,
            fileName: img.file_name,
            status: "migrated",
            message: `Migrated to ${r2Key}`,
          });

        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          console.error(`Error migrating image ${img.id}:`, errorMsg);
          result.errors.push(`Image ${img.file_name}: ${errorMsg}`);
          result.details.push({
            table: "images",
            id: img.id,
            fileName: img.file_name,
            status: "error",
            message: errorMsg,
          });
        }
      }
    }

    console.log("Migration complete:", result);

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        message: `Migration complete: ${result.migrated} migrated, ${result.skipped} skipped, ${result.errors.length} errors`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage, ...result }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
