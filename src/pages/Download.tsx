import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, AlertCircle, FileText, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatFileSize, getFileExtension, getPublicDownloadUrl, isImageFile } from "@/lib/documentUtils";
import paterBrownLogo from "@/assets/pater-brown-logo.png";

interface DocumentData {
  id: string;
  name: string;
  file_path: string;
  file_name: string;
  file_size: number;
  content_type: string | null;
  download_count: number;
}

const DownloadPage = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) {
        setError("Keine Dokument-ID angegeben");
        setLoading(false);
        return;
      }

      try {
        const { data, error: dbError } = await supabase
          .from("internal_documents")
          .select("id, name, file_path, file_name, file_size, content_type, download_count")
          .eq("id", id)
          .maybeSingle();

        if (dbError) throw dbError;
        
        if (!data) {
          setError("Dokument nicht gefunden");
        } else {
          setDocument(data);
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("Fehler beim Laden des Dokuments");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleDownload = async () => {
    if (!document) return;

    setDownloading(true);
    
    try {
      // Increment download count
      await supabase
        .from("internal_documents")
        .update({ download_count: (document.download_count || 0) + 1 })
        .eq("id", document.id);

      // Open download URL
      const downloadUrl = getPublicDownloadUrl(document.file_path);
      window.open(downloadUrl, "_blank");
    } catch (err) {
      console.error("Error downloading:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-amber-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Lade Dokument...</span>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Dokument nicht gefunden"}
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            Das angeforderte Dokument ist nicht verfügbar oder der Link ist ungültig.
          </p>
          <Link to="/">
            <Button 
              variant="outline" 
              className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zur Startseite
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const fileExtension = getFileExtension(document.file_name);
  const isImage = isImageFile(document.content_type, document.file_name);
  const downloadUrl = getPublicDownloadUrl(document.file_path);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={paterBrownLogo} 
              alt="Pater Brown" 
              className="h-10 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </Link>
          <Link 
            to="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            paterbrown.com
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Document Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Preview Section */}
          <div className="p-8 border-b border-gray-100 bg-gray-50 flex items-center justify-center">
            {isImage ? (
              <img
                src={downloadUrl}
                alt={document.name}
                className="max-h-64 max-w-full rounded-lg shadow-sm object-contain"
              />
            ) : (
              <div className="w-20 h-24 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400 mb-1" />
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  {fileExtension || "DOC"}
                </span>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-6 md:p-8">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {document.name}
            </h1>
            
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
              <span className="uppercase font-medium tracking-wide">{fileExtension}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{formatFileSize(document.file_size)}</span>
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-6 text-base rounded-xl transition-all"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Download startet...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Herunterladen
                </>
              )}
            </Button>

            {/* File info */}
            <p className="mt-4 text-xs text-gray-400 text-center truncate">
              {document.file_name}
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Bereitgestellt von Pater Brown – Das Live-Hörspiel
        </p>
      </main>
    </div>
  );
};

export default DownloadPage;
