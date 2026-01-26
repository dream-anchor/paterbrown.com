import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, FileText, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  formatFileSize, 
  getContentTypeIcon, 
  getFileExtension,
  getPublicDownloadUrl 
} from "@/lib/documentUtils";
import paterBrownLogo from "@/assets/pater-brown-logo.png";

interface DocumentData {
  id: string;
  name: string;
  file_path: string;
  file_name: string;
  file_size: number;
  content_type: string | null;
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
          .select("id, name, file_path, file_name, file_size, content_type")
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
        .update({ download_count: (document as any).download_count + 1 || 1 })
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Lade Dokument...</span>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            {error || "Dokument nicht gefunden"}
          </h1>
          <p className="text-gray-400 mb-6">
            Das angeforderte Dokument ist nicht verfügbar oder der Link ist ungültig.
          </p>
          <Link to="/">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zur Startseite
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const fileExtension = getFileExtension(document.file_name);
  const fileIcon = getContentTypeIcon(document.content_type);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-md mx-auto flex justify-center">
          <Link to="/" className="block">
            <img 
              src={paterBrownLogo} 
              alt="Pater Brown" 
              className="h-16 w-auto opacity-90 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Document Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
            {/* File Icon */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-4xl">
              {fileIcon}
            </div>

            {/* Document Name */}
            <h1 className="text-xl font-semibold text-white mb-2">
              {document.name}
            </h1>

            {/* File Info */}
            <p className="text-gray-400 mb-6">
              {fileExtension && <span className="uppercase">{fileExtension}</span>}
              {fileExtension && document.file_size > 0 && <span className="mx-2">•</span>}
              {document.file_size > 0 && <span>{formatFileSize(document.file_size)}</span>}
            </p>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              disabled={downloading}
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-6 text-lg shadow-lg shadow-amber-500/25"
            >
              {downloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Download startet...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Herunterladen
                </>
              )}
            </Button>

            {/* Original Filename */}
            <p className="mt-4 text-xs text-gray-500 truncate">
              {document.file_name}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center">
        <p className="text-sm text-gray-500">
          Bereitgestellt von{" "}
          <Link to="/" className="text-amber-500 hover:text-amber-400 transition-colors">
            paterbrown.com
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default DownloadPage;
