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
