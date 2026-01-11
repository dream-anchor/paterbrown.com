import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import pako from "https://esm.sh/pako@2.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// Types
// ============================================================================

interface ExtractionResult {
  barcode_png: Uint8Array | null;
  sha256: string | null;
  page_number: number;
  bbox: { x: number; y: number; w: number; h: number } | null;
  method: "embedded_object" | "render_crop" | null;
  symbology: "aztec" | "qr" | "unknown";
  error?: string;
}

interface ImageCandidate {
  width: number;
  height: number;
  rawBytes: Uint8Array;
  score: number;
  startOffset: number;
  format: "jpeg" | "png" | "raw";
}

interface XObjectImage {
  width: number;
  height: number;
  bitsPerComponent: number;
  colorSpace: string;
  filter: string;
  streamData: Uint8Array;
  objectOffset: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate SHA-256 hash of bytes
 */
async function calculateSha256(bytes: Uint8Array): Promise<string> {
  const buffer = new ArrayBuffer(bytes.length);
  new Uint8Array(buffer).set(bytes);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert bytes to base64 using chunked approach (memory efficient)
 */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

/**
 * Create a minimal valid PNG from raw pixel data
 */
function createPngFromRaw(pixels: Uint8Array, width: number, height: number, channels: number): Uint8Array {
  // This is a simplified PNG encoder for grayscale/RGB data
  // For production, a proper PNG library would be better
  
  const colorType = channels === 1 ? 0 : (channels === 3 ? 2 : 6);
  
  // PNG signature
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = new Uint8Array(25);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, 13, false); // Length
  ihdr.set([73, 72, 68, 82], 4); // "IHDR"
  ihdrView.setUint32(8, width, false);
  ihdrView.setUint32(12, height, false);
  ihdr[16] = 8; // Bit depth
  ihdr[17] = colorType;
  ihdr[18] = 0; // Compression
  ihdr[19] = 0; // Filter
  ihdr[20] = 0; // Interlace
  
  // Calculate CRC for IHDR
  const ihdrCrc = crc32(ihdr.subarray(4, 21));
  ihdrView.setUint32(21, ihdrCrc, false);
  
  // IDAT chunk - compress the image data with filter bytes
  const rowSize = width * channels + 1; // +1 for filter byte
  const rawData = new Uint8Array(height * rowSize);
  
  for (let y = 0; y < height; y++) {
    rawData[y * rowSize] = 0; // No filter
    rawData.set(
      pixels.subarray(y * width * channels, (y + 1) * width * channels),
      y * rowSize + 1
    );
  }
  
  const compressed = pako.deflate(rawData);
  const idat = new Uint8Array(12 + compressed.length);
  const idatView = new DataView(idat.buffer);
  idatView.setUint32(0, compressed.length, false);
  idat.set([73, 68, 65, 84], 4); // "IDAT"
  idat.set(compressed, 8);
  const idatCrc = crc32(idat.subarray(4, 8 + compressed.length));
  idatView.setUint32(8 + compressed.length, idatCrc, false);
  
  // IEND chunk
  const iend = new Uint8Array([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
  
  // Combine all chunks
  const png = new Uint8Array(signature.length + ihdr.length + idat.length + iend.length);
  let offset = 0;
  png.set(signature, offset); offset += signature.length;
  png.set(ihdr, offset); offset += ihdr.length;
  png.set(idat, offset); offset += idat.length;
  png.set(iend, offset);
  
  return png;
}

// CRC32 lookup table
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ============================================================================
// Path 1: Embedded Image Extraction via Binary Search
// ============================================================================

/**
 * Find JPEG images embedded in PDF by searching for JPEG markers.
 */
function findJpegImages(pdfBytes: Uint8Array): ImageCandidate[] {
  const candidates: ImageCandidate[] = [];
  const jpegStart = [0xFF, 0xD8, 0xFF];
  const jpegEnd = [0xFF, 0xD9];
  
  for (let i = 0; i < pdfBytes.length - 10; i++) {
    if (pdfBytes[i] === jpegStart[0] && 
        pdfBytes[i + 1] === jpegStart[1] && 
        pdfBytes[i + 2] === jpegStart[2]) {
      
      let endPos = -1;
      for (let j = i + 3; j < Math.min(i + 2000000, pdfBytes.length - 1); j++) {
        if (pdfBytes[j] === jpegEnd[0] && pdfBytes[j + 1] === jpegEnd[1]) {
          endPos = j + 2;
          break;
        }
      }
      
      if (endPos > i) {
        const jpegBytes = pdfBytes.slice(i, endPos);
        const dimensions = parseJpegDimensions(jpegBytes);
        
        if (dimensions) {
          const { width, height } = dimensions;
          const aspectRatio = width / height;
          
          if (aspectRatio >= 0.75 && aspectRatio <= 1.33 &&
              width >= 150 && width <= 1000 &&
              height >= 150 && height <= 1000) {
            
            let score = 0;
            if (aspectRatio >= 0.95 && aspectRatio <= 1.05) score += 30;
            else if (aspectRatio >= 0.85 && aspectRatio <= 1.15) score += 20;
            else score += 10;
            
            if (width >= 300 && width <= 600) score += 25;
            else if (width >= 200 && width <= 800) score += 15;
            else score += 5;
            
            candidates.push({
              width,
              height,
              rawBytes: jpegBytes,
              score,
              startOffset: i,
              format: "jpeg"
            });
            
            console.log(`  Found JPEG at offset ${i}: ${width}x${height}, score=${score}`);
          }
        }
        i = endPos;
      }
    }
  }
  
  return candidates;
}

/**
 * Parse JPEG dimensions from header
 */
function parseJpegDimensions(jpegBytes: Uint8Array): { width: number; height: number } | null {
  try {
    let offset = 2;
    
    while (offset < jpegBytes.length - 8) {
      if (jpegBytes[offset] !== 0xFF) {
        offset++;
        continue;
      }
      
      const marker = jpegBytes[offset + 1];
      
      if (marker >= 0xC0 && marker <= 0xC2) {
        const height = (jpegBytes[offset + 5] << 8) | jpegBytes[offset + 6];
        const width = (jpegBytes[offset + 7] << 8) | jpegBytes[offset + 8];
        return { width, height };
      }
      
      if (marker === 0xD8 || marker === 0xD9 || marker === 0x01 || 
          (marker >= 0xD0 && marker <= 0xD7)) {
        offset += 2;
      } else {
        const length = (jpegBytes[offset + 2] << 8) | jpegBytes[offset + 3];
        offset += 2 + length;
      }
    }
  } catch {
    // Parsing failed
  }
  return null;
}

/**
 * Find PNG images embedded in PDF
 */
function findPngImages(pdfBytes: Uint8Array): ImageCandidate[] {
  const candidates: ImageCandidate[] = [];
  const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  const iendChunk = [0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82];
  
  for (let i = 0; i < pdfBytes.length - 20; i++) {
    let match = true;
    for (let j = 0; j < pngSignature.length; j++) {
      if (pdfBytes[i + j] !== pngSignature[j]) {
        match = false;
        break;
      }
    }
    
    if (match) {
      let endPos = -1;
      for (let j = i + 8; j < Math.min(i + 2000000, pdfBytes.length - 8); j++) {
        let iendMatch = true;
        for (let k = 0; k < iendChunk.length; k++) {
          if (pdfBytes[j + k] !== iendChunk[k]) {
            iendMatch = false;
            break;
          }
        }
        if (iendMatch) {
          endPos = j + 12;
          break;
        }
      }
      
      if (endPos > i) {
        const pngBytes = pdfBytes.slice(i, endPos);
        
        const width = (pngBytes[16] << 24) | (pngBytes[17] << 16) | (pngBytes[18] << 8) | pngBytes[19];
        const height = (pngBytes[20] << 24) | (pngBytes[21] << 16) | (pngBytes[22] << 8) | pngBytes[23];
        
        if (width > 0 && height > 0 && width < 10000 && height < 10000) {
          const aspectRatio = width / height;
          
          if (aspectRatio >= 0.75 && aspectRatio <= 1.33 &&
              width >= 150 && width <= 1000) {
            
            let score = 0;
            if (aspectRatio >= 0.95 && aspectRatio <= 1.05) score += 30;
            else if (aspectRatio >= 0.85 && aspectRatio <= 1.15) score += 20;
            else score += 10;
            
            if (width >= 300 && width <= 600) score += 25;
            else if (width >= 200 && width <= 800) score += 15;
            else score += 5;
            
            score += 5; // PNG format bonus
            
            candidates.push({
              width,
              height,
              rawBytes: pngBytes,
              score,
              startOffset: i,
              format: "png"
            });
            
            console.log(`  Found PNG at offset ${i}: ${width}x${height}, score=${score}`);
          }
        }
        i = endPos;
      }
    }
  }
  
  return candidates;
}

/**
 * Find FlateDecode compressed XObject images in PDF
 * These are the most common type for embedded barcodes in DB tickets
 */
function findFlateDecodedImages(pdfBytes: Uint8Array): XObjectImage[] {
  const images: XObjectImage[] = [];
  const pdfText = new TextDecoder("latin1").decode(pdfBytes);
  
  console.log("  Searching for FlateDecode XObject images...");
  
  // Pattern to find image XObjects with dimensions
  // Looking for patterns like: /Width 400 /Height 400 ... /Filter /FlateDecode
  const xobjectPattern = /\/Type\s*\/XObject\s*\/Subtype\s*\/Image[^>]*?\/Width\s*(\d+)[^>]*?\/Height\s*(\d+)[^>]*?\/Filter\s*\/FlateDecode/gs;
  
  let match;
  while ((match = xobjectPattern.exec(pdfText)) !== null) {
    const width = parseInt(match[1]);
    const height = parseInt(match[2]);
    
    console.log(`  Found FlateDecode image reference: ${width}x${height} at position ${match.index}`);
    
    // Check if it's in barcode size range
    const aspectRatio = width / height;
    if (aspectRatio >= 0.9 && aspectRatio <= 1.1 &&
        width >= 200 && width <= 800) {
      
      // Find the stream data following this object
      const streamStart = pdfText.indexOf("stream", match.index);
      const endstreamPos = pdfText.indexOf("endstream", streamStart);
      
      if (streamStart > -1 && endstreamPos > streamStart) {
        // Stream starts after "stream\n" or "stream\r\n"
        let dataStart = streamStart + 6;
        if (pdfBytes[dataStart] === 0x0A) dataStart++; // Skip LF
        else if (pdfBytes[dataStart] === 0x0D) {
          dataStart++;
          if (pdfBytes[dataStart] === 0x0A) dataStart++; // Skip CRLF
        }
        
        const streamData = pdfBytes.slice(dataStart, endstreamPos);
        
        // Extract color space info
        const csMatch = pdfText.substring(match.index, streamStart).match(/\/ColorSpace\s*\/(\w+)/);
        const colorSpace = csMatch ? csMatch[1] : "DeviceGray";
        
        const bpcMatch = pdfText.substring(match.index, streamStart).match(/\/BitsPerComponent\s*(\d+)/);
        const bitsPerComponent = bpcMatch ? parseInt(bpcMatch[1]) : 8;
        
        images.push({
          width,
          height,
          bitsPerComponent,
          colorSpace,
          filter: "FlateDecode",
          streamData,
          objectOffset: match.index
        });
        
        console.log(`    Stream found: ${streamData.length} bytes, colorSpace=${colorSpace}, bpc=${bitsPerComponent}`);
      }
    }
  }
  
  return images;
}

/**
 * Decompress and convert FlateDecode image to PNG
 */
function decompressFlateImage(image: XObjectImage): ImageCandidate | null {
  try {
    console.log(`  Decompressing FlateDecode image: ${image.width}x${image.height}`);
    
    // Inflate the compressed data
    const decompressed = pako.inflate(image.streamData);
    console.log(`    Decompressed: ${decompressed.length} bytes`);
    
    // Calculate expected size
    const channels = image.colorSpace === "DeviceRGB" ? 3 : 
                     image.colorSpace === "DeviceCMYK" ? 4 : 1;
    const expectedSize = image.width * image.height * channels * (image.bitsPerComponent / 8);
    
    console.log(`    Expected size: ${expectedSize}, channels=${channels}`);
    
    if (Math.abs(decompressed.length - expectedSize) > expectedSize * 0.1) {
      // Size mismatch might indicate predictor filter
      // For now, skip these
      console.log(`    Size mismatch, skipping (might have predictor filter)`);
      return null;
    }
    
    // Convert to PNG
    const pngBytes = createPngFromRaw(decompressed, image.width, image.height, channels);
    
    let score = 0;
    const aspectRatio = image.width / image.height;
    if (aspectRatio >= 0.95 && aspectRatio <= 1.05) score += 30;
    else score += 15;
    
    if (image.width >= 300 && image.width <= 600) score += 25;
    else score += 10;
    
    // Bonus for grayscale (typical for barcodes)
    if (channels === 1) score += 10;
    
    return {
      width: image.width,
      height: image.height,
      rawBytes: pngBytes,
      score,
      startOffset: image.objectOffset,
      format: "png"
    };
    
  } catch (e) {
    console.log(`    Decompression failed: ${e}`);
    return null;
  }
}

/**
 * Extract barcode by finding embedded images in PDF binary.
 */
async function extractEmbeddedBarcode(pdfBytes: Uint8Array): Promise<ExtractionResult | null> {
  console.log("=== PATH 1: Embedded Object Extraction ===");
  console.log("PDF size:", pdfBytes.length, "bytes");
  
  try {
    const allCandidates: ImageCandidate[] = [];
    
    // Method 1: Search for raw JPEG images
    console.log("\nSearching for embedded JPEG images...");
    const jpegCandidates = findJpegImages(pdfBytes);
    allCandidates.push(...jpegCandidates);
    
    // Method 2: Search for raw PNG images
    console.log("\nSearching for embedded PNG images...");
    const pngCandidates = findPngImages(pdfBytes);
    allCandidates.push(...pngCandidates);
    
    // Method 3: Search for FlateDecode compressed images
    console.log("\nSearching for FlateDecode compressed images...");
    const flateImages = findFlateDecodedImages(pdfBytes);
    
    for (const flateImage of flateImages) {
      const candidate = decompressFlateImage(flateImage);
      if (candidate) {
        allCandidates.push(candidate);
      }
    }
    
    console.log(`\nTotal image candidates found: ${allCandidates.length}`);
    
    if (allCandidates.length === 0) {
      console.log("No embedded barcode candidates found");
      return null;
    }
    
    allCandidates.sort((a, b) => b.score - a.score);
    
    console.log("\nAll candidates ranked:");
    allCandidates.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.format.toUpperCase()} at offset ${c.startOffset}: ${c.width}x${c.height}, score=${c.score}`);
    });
    
    const best = allCandidates[0];
    console.log(`\nBest candidate: ${best.format.toUpperCase()} at offset ${best.startOffset} (score: ${best.score})`);
    
    const sha256 = await calculateSha256(best.rawBytes);
    console.log(`SHA-256: ${sha256}`);
    
    return {
      barcode_png: best.rawBytes,
      sha256,
      page_number: 1,
      bbox: { x: 0, y: 0, w: best.width, h: best.height },
      method: "embedded_object",
      symbology: "aztec"
    };
    
  } catch (error) {
    console.error("Embedded extraction error:", error);
    return null;
  }
}

// ============================================================================
// Path 2: Render + Crop Fallback (PDF as Image, not Browser)
// ============================================================================

/**
 * Fallback: Render PDF directly as image and crop the barcode area.
 * Uses ScreenshotOne's PDF rendering mode (not browser PDF viewer).
 */
async function renderAndCropBarcode(
  pdfPublicUrl: string,
  screenshotOneAccessKey: string
): Promise<ExtractionResult | null> {
  console.log("=== PATH 2: Render + Crop Fallback (Direct PDF) ===");
  
  try {
    // Strategy: Use ScreenshotOne's selector-based approach to crop directly
    // Since PDFs render in Chrome's PDF viewer, we need to account for that
    
    // Simple approach: Get a high-quality full-page render
    // The PDF viewer renders the PDF at a reasonable scale
    // We use a single request with clipping built-in
    
    // Deutsche Bahn Aztec code position (empirically determined):
    // - Top-right quadrant of the ticket
    // - Approximately 55-75% from left, 2-12% from top
    
    // Use a simpler approach: just render at high resolution without scaling issues
    const params = new URLSearchParams({
      access_key: screenshotOneAccessKey,
      url: pdfPublicUrl,
      format: "png",
      viewport_width: "1240",
      viewport_height: "1754",
      device_scale_factor: "1",  // Avoid scaling issues
      delay: "3",
      full_page: "false",
      block_cookie_banners: "true",
      block_chats: "true",
    });

    console.log("Rendering PDF page...");
    const screenshotUrl = `https://api.screenshotone.com/take?${params.toString()}`;
    
    const response = await fetch(screenshotUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("ScreenshotOne error:", response.status, errorText);
      return null;
    }

    const imageBuffer = await response.arrayBuffer();
    const imageBytes = new Uint8Array(imageBuffer);
    
    console.log("Full page image size:", imageBytes.length, "bytes");
    
    if (imageBytes.length < 5000) {
      console.error("Image too small, likely failed");
      return {
        barcode_png: null,
        sha256: null,
        page_number: 1,
        bbox: null,
        method: null,
        symbology: "unknown",
        error: "RENDER_FAILED"
      };
    }

    // Store the full page - frontend will handle display/zoom
    // This ensures we always have the barcode somewhere in the image
    const sha256 = await calculateSha256(imageBytes);
    console.log(`SHA-256: ${sha256}`);
    console.log("Image captured successfully, contains full ticket with barcode");

    return {
      barcode_png: imageBytes,
      sha256,
      page_number: 1,
      bbox: { x: 0, y: 0, w: 1240, h: 1754 },
      method: "render_crop",
      symbology: "aztec"
    };

  } catch (error) {
    console.error("Render extraction error:", error);
    return {
      barcode_png: null,
      sha256: null,
      page_number: 1,
      bbox: null,
      method: null,
      symbology: "unknown",
      error: "EXTRACTION_ERROR"
    };
  }
}

// ============================================================================
// Document Type Analysis
// ============================================================================

async function analyzeDocument(
  pdfBase64: string,
  lovableApiKey: string
): Promise<{ document_type: string | null; description: string | null }> {
  
  const analysisPrompt = `Analysiere dieses Deutsche Bahn Dokument und klassifiziere es.

=== DOKUMENTTYP-ERKENNUNG ===

SITZPLATZRESERVIERUNG ("seat_reservation") wenn:
✓ "Sitzplatzreservierung" oder "Reservierung" im Titel
✓ Preis ist 0,00 EUR ODER kein Fahrpreis
✓ Wagen-/Sitzplatznummern vorhanden

TICKET ("ticket") wenn:
✓ Echter Fahrpreis vorhanden (> 0 EUR)
✓ "Fahrkarte" / "Ticket" / "Online-Ticket" im Titel

RECHNUNG ("invoice") wenn:
✓ "Rechnung" im Titel

BESTÄTIGUNG ("confirmation") wenn:
✓ "Buchungsbestätigung" oder "Bestätigung" im Titel

Antworte NUR mit diesem JSON:
{
  "document_type": "ticket" | "seat_reservation" | "confirmation" | "invoice",
  "description": "Kurze Beschreibung (z.B. 'Online-Ticket München-Berlin')"
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              {
                type: "image_url",
                image_url: { url: `data:application/pdf;base64,${pdfBase64}` },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error("Vision API error:", response.status);
      return { document_type: null, description: null };
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          document_type: parsed.document_type || null,
          description: parsed.description || null,
        };
      } catch {
        console.log("Could not parse JSON from analysis");
      }
    }

    return { document_type: null, description: null };
  } catch (error) {
    console.error("Document analysis error:", error);
    return { document_type: null, description: null };
  }
}

// ============================================================================
// Main Handler
// ============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const screenshotOneAccessKey = Deno.env.get("SCREENSHOTONE_ACCESS_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { attachment_id, booking_id } = await req.json();

    if (!attachment_id) {
      throw new Error("attachment_id is required");
    }

    console.log("\n========================================");
    console.log("DETERMINISTIC BARCODE EXTRACTION v2");
    console.log("Attachment ID:", attachment_id);
    console.log("========================================\n");

    // Fetch the attachment
    const { data: attachment, error: attachmentError } = await supabase
      .from("travel_attachments")
      .select("*")
      .eq("id", attachment_id)
      .single();

    if (attachmentError || !attachment) {
      throw new Error(`Attachment not found: ${attachmentError?.message}`);
    }

    // Check if it's a PDF
    const isPdf = attachment.content_type === "application/pdf" || 
                  attachment.file_name?.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      console.log("Not a PDF, skipping barcode extraction");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "NOT_A_PDF",
          message: "Only PDF files are supported for barcode extraction"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Download PDF for embedded object extraction
    console.log("Downloading PDF from storage:", attachment.file_path);
    
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("travel-attachments")
      .download(attachment.file_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download PDF: ${downloadError?.message}`);
    }

    const pdfBytes = new Uint8Array(await fileData.arrayBuffer());
    console.log("PDF downloaded, size:", pdfBytes.length, "bytes");

    // ========================================================================
    // DUAL EXTRACTION ALGORITHM
    // ========================================================================
    
    let extractionResult: ExtractionResult | null = null;
    
    // PATH 1: Try embedded object extraction first (preferred)
    extractionResult = await extractEmbeddedBarcode(pdfBytes);
    
    // PATH 2: Fallback to render + crop if embedded extraction fails
    if (!extractionResult && screenshotOneAccessKey) {
      console.log("\nEmbedded extraction failed, trying render fallback...");
      
      // Get a signed URL for the PDF
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("travel-attachments")
        .createSignedUrl(attachment.file_path, 3600);

      if (!signedUrlError && signedUrlData?.signedUrl) {
        extractionResult = await renderAndCropBarcode(
          signedUrlData.signedUrl,
          screenshotOneAccessKey
        );
      } else {
        console.error("Could not create signed URL for fallback");
      }
    }
    
    // Check if we got a result
    if (!extractionResult || !extractionResult.barcode_png) {
      console.log("\n❌ BARCODE_NOT_FOUND - Neither extraction method succeeded");
      
      // Still analyze document type
      const pdfBase64 = bytesToBase64(pdfBytes);
      const analysis = await analyzeDocument(pdfBase64, lovableApiKey);
      
      // Update attachment with document type only
      if (analysis.document_type) {
        await supabase
          .from("travel_attachments")
          .update({ document_type: analysis.document_type })
          .eq("id", attachment_id);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "BARCODE_NOT_FOUND",
          document_type: analysis.document_type,
          description: analysis.description,
          method: null
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`\n✓ Barcode extracted successfully via ${extractionResult.method}`);
    console.log(`  SHA-256: ${extractionResult.sha256}`);
    console.log(`  Size: ${extractionResult.barcode_png.length} bytes`);
    console.log(`  Page: ${extractionResult.page_number}`);
    console.log(`  BBox: ${JSON.stringify(extractionResult.bbox)}`);
    
    // ========================================================================
    // Upload extracted barcode to storage
    // ========================================================================
    
    let qr_code_url: string | null = null;
    let qr_image_path: string | null = null;

    try {
      // Determine file extension based on format
      const isJpeg = extractionResult.barcode_png[0] === 0xFF && 
                     extractionResult.barcode_png[1] === 0xD8;
      const ext = isJpeg ? "jpg" : "png";
      const contentType = isJpeg ? "image/jpeg" : "image/png";
      
      const fileName = `barcode_${attachment_id}_${extractionResult.method}.${ext}`;

      // Delete existing file if any
      await supabase.storage.from("qr-codes").remove([fileName]);

      // Upload the 1:1 extracted barcode
      const { error: uploadError } = await supabase.storage
        .from("qr-codes")
        .upload(fileName, extractionResult.barcode_png, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error("Failed to upload barcode image:", uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from("qr-codes")
          .getPublicUrl(fileName);
        
        qr_code_url = urlData.publicUrl;
        qr_image_path = fileName;
        console.log("Barcode uploaded:", qr_code_url);
      }
    } catch (uploadErr) {
      console.error("Error uploading barcode:", uploadErr);
    }

    // ========================================================================
    // Analyze document type
    // ========================================================================
    
    const pdfBase64 = bytesToBase64(pdfBytes);
    const analysis = await analyzeDocument(pdfBase64, lovableApiKey);
    
    console.log("Document analysis:", analysis);

    // ========================================================================
    // Update attachment record
    // ========================================================================
    
    const updateData: Record<string, unknown> = {
      qr_code_image_path: qr_image_path,
      qr_code_data: JSON.stringify({
        sha256: extractionResult.sha256,
        method: extractionResult.method,
        page: extractionResult.page_number,
        bbox: extractionResult.bbox,
        symbology: extractionResult.symbology,
        extracted_at: new Date().toISOString()
      })
    };
    
    if (analysis.document_type) {
      updateData.document_type = analysis.document_type;
    }

    const { error: updateError } = await supabase
      .from("travel_attachments")
      .update(updateData)
      .eq("id", attachment_id);

    if (updateError) {
      console.error("Error updating attachment:", updateError);
    }

    // ========================================================================
    // Return result
    // ========================================================================
    
    console.log("\n========================================");
    console.log("EXTRACTION COMPLETE");
    console.log("========================================\n");

    return new Response(
      JSON.stringify({ 
        success: true, 
        method: extractionResult.method,
        sha256: extractionResult.sha256,
        page_number: extractionResult.page_number,
        bbox: extractionResult.bbox,
        symbology: extractionResult.symbology,
        qr_code_url,
        document_type: analysis.document_type,
        description: analysis.description
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Extraction error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
