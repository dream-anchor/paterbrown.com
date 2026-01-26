// Document utility functions

export const DOCUMENT_CATEGORIES = {
  dossier_produktion: {
    label: "Produktions-Dossier",
    icon: "📋",
  },
  dossier_presse: {
    label: "Presse-Dossier", 
    icon: "📰",
  },
  flyer: {
    label: "Flyer",
    icon: "📄",
  },
  other: {
    label: "Sonstiges",
    icon: "📁",
  },
} as const;

export type DocumentCategory = keyof typeof DOCUMENT_CATEGORIES;

// File type groups for automatic categorization
export type FileTypeGroup = "images" | "pdfs" | "documents" | "spreadsheets" | "presentations" | "archives" | "other";

export interface FileTypeGroupInfo {
  label: string;
  order: number;
}

export const FILE_TYPE_GROUPS: Record<FileTypeGroup, FileTypeGroupInfo> = {
  images: { label: "Bilder", order: 1 },
  pdfs: { label: "PDF-Dokumente", order: 2 },
  documents: { label: "Dokumente", order: 3 },
  spreadsheets: { label: "Tabellen", order: 4 },
  presentations: { label: "Präsentationen", order: 5 },
  archives: { label: "Archive", order: 6 },
  other: { label: "Sonstige", order: 7 },
};

export function getFileTypeGroup(contentType: string | null, fileName: string): FileTypeGroup {
  const lowerName = fileName.toLowerCase();
  
  // Check by content type first
  if (contentType) {
    if (contentType.startsWith("image/")) return "images";
    if (contentType.includes("pdf")) return "pdfs";
    if (contentType.includes("word") || contentType.includes("document")) return "documents";
    if (contentType.includes("sheet") || contentType.includes("excel")) return "spreadsheets";
    if (contentType.includes("presentation") || contentType.includes("powerpoint")) return "presentations";
    if (contentType.includes("zip") || contentType.includes("archive") || contentType.includes("compressed")) return "archives";
  }
  
  // Fallback to file extension
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|heic|heif)$/.test(lowerName)) return "images";
  if (/\.pdf$/.test(lowerName)) return "pdfs";
  if (/\.(doc|docx|odt|rtf|txt|md)$/.test(lowerName)) return "documents";
  if (/\.(xls|xlsx|csv|ods)$/.test(lowerName)) return "spreadsheets";
  if (/\.(ppt|pptx|odp|key)$/.test(lowerName)) return "presentations";
  if (/\.(zip|rar|7z|tar|gz)$/.test(lowerName)) return "archives";
  
  return "other";
}

export function isImageFile(contentType: string | null, fileName: string): boolean {
  return getFileTypeGroup(contentType, fileName) === "images";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toUpperCase() || "" : "";
}

export function getContentTypeIcon(contentType: string | null): string {
  if (!contentType) return "📄";
  
  if (contentType.includes("pdf")) return "📕";
  if (contentType.includes("word") || contentType.includes("document")) return "📘";
  if (contentType.includes("sheet") || contentType.includes("excel")) return "📗";
  if (contentType.includes("presentation") || contentType.includes("powerpoint")) return "📙";
  if (contentType.includes("image")) return "🖼️";
  if (contentType.includes("video")) return "🎬";
  if (contentType.includes("audio")) return "🎵";
  if (contentType.includes("zip") || contentType.includes("archive")) return "📦";
  
  return "📄";
}

export function getPublicDownloadUrl(filePath: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/internal-documents/${filePath}`;
}

export function getDownloadPageUrl(documentId: string): string {
  return `${window.location.origin}/download/${documentId}`;
}

/**
 * Get a thumbnail URL for an image stored in Supabase Storage.
 * Uses Supabase Image Transformations for on-the-fly resizing.
 * 
 * @param bucket - The storage bucket name
 * @param filePath - The file path within the bucket
 * @param width - Target width (default: 400)
 * @param height - Target height (default: 400)
 * @param quality - Image quality 1-100 (default: 75)
 */
export function getImageThumbnailUrl(
  bucket: string,
  filePath: string,
  width: number = 400,
  height: number = 400,
  quality: number = 75
): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  // Supabase image transformation URL format
  return `${supabaseUrl}/storage/v1/render/image/public/${bucket}/${filePath}?width=${width}&height=${height}&quality=${quality}&resize=contain`;
}

/**
 * Get the original full-resolution URL for an image in Supabase Storage.
 */
export function getImageOriginalUrl(bucket: string, filePath: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
}
