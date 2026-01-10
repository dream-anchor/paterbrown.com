import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Download, ExternalLink, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  content_type: string | null;
}

interface Props {
  attachment: Attachment;
  emailHtml?: string;
  onClose: () => void;
}

export default function DocumentViewer({ attachment, emailHtml, onClose }: Props) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emailHtml) {
      setIsLoading(false);
      return;
    }

    loadFile();
  }, [attachment.file_path, emailHtml]);

  const loadFile = async () => {
    if (!attachment.file_path) return;

    try {
      const { data, error: downloadError } = await supabase.storage
        .from("travel-attachments")
        .createSignedUrl(attachment.file_path, 3600); // 1 hour

      if (downloadError) throw downloadError;
      setFileUrl(data.signedUrl);
    } catch (err: any) {
      console.error("Error loading file:", err);
      setError(err.message || "Datei konnte nicht geladen werden");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  const isPdf = attachment.content_type?.includes("pdf");
  const isImage = attachment.content_type?.startsWith("image/");

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-500" />
            <h3 className="font-medium text-gray-900 truncate">
              {attachment.file_name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {fileUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">{error}</p>
            </div>
          ) : emailHtml ? (
            // Email HTML content
            <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl mx-auto">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: emailHtml }}
              />
            </div>
          ) : isPdf && fileUrl ? (
            // PDF viewer
            <iframe
              src={`${fileUrl}#view=FitH`}
              className="w-full h-full min-h-[500px] rounded-lg bg-white"
              title={attachment.file_name}
            />
          ) : isImage && fileUrl ? (
            // Image viewer
            <div className="flex items-center justify-center h-full">
              <img
                src={fileUrl}
                alt={attachment.file_name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : fileUrl ? (
            // Fallback - download link
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">
                Dieser Dateityp kann nicht im Browser angezeigt werden.
              </p>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Datei herunterladen
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
