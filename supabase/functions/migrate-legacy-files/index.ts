import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.400.0";

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

    // Initialize S3 client for R2
    const s3Client = new S3Client({
      region: "auto",
      endpoint: r2Endpoint,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });

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
          const putCommand = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: r2Key,
            Body: fileBytes,
            ContentType: fileData.type || "application/octet-stream",
          });

          await s3Client.send(putCommand);
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
          const putCommand = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: r2Key,
            Body: fileBytes,
            ContentType: fileData.type || "image/jpeg",
          });

          await s3Client.send(putCommand);
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
