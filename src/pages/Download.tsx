import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, AlertCircle, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatFileSize, getFileExtension, getPublicDownloadUrl } from "@/lib/documentUtils";
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <Sparkles className="w-5 h-5 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="text-sm text-gray-500 font-medium">Lade Dokument...</span>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            {error || "Dokument nicht gefunden"}
          </h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Das angeforderte Dokument ist nicht verfügbar oder der Link ist ungültig.
          </p>
          <Link to="/">
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Zur Startseite
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const fileExtension = getFileExtension(document.file_name);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[100px]" />
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-8 px-6">
          <div className="max-w-xl mx-auto flex justify-center">
            <Link to="/" className="group block">
              <img 
                src={paterBrownLogo} 
                alt="Pater Brown - Das Live-Hörspiel" 
                className="h-24 md:h-32 w-auto opacity-90 group-hover:opacity-100 transition-all duration-300 drop-shadow-2xl"
              />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-lg w-full">
            {/* Document Card */}
            <div className="relative">
              {/* Glow effect behind card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-3xl blur-xl opacity-50" />
              
              <div className="relative bg-gradient-to-b from-gray-900/90 to-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/10 p-8 md:p-10 text-center">
                {/* File Preview */}
                <div className="relative mb-8">
                  {/* Decorative rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border border-amber-500/10 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full border border-amber-500/5" />
                  </div>
                  
                  {/* File icon */}
                  <div className="relative w-24 h-32 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-2xl shadow-red-500/30 flex flex-col items-center justify-center">
                    {/* Page fold effect */}
                    <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-br from-red-400 to-red-500 rounded-bl-lg" />
                    <div className="absolute top-0 right-0 w-0 h-0 border-l-[24px] border-l-transparent border-t-[24px] border-t-gray-900/50" />
                    
                    <FileText className="w-10 h-10 text-white/90 mb-2" />
                    <span className="text-sm font-bold text-white/90 uppercase tracking-wider">
                      {fileExtension || "DOC"}
                    </span>
                    
                    {/* Document lines */}
                    <div className="absolute bottom-3 left-3 right-3 space-y-1">
                      <div className="h-0.5 bg-white/20 rounded" />
                      <div className="h-0.5 bg-white/20 rounded w-3/4" />
                      <div className="h-0.5 bg-white/20 rounded w-1/2" />
                    </div>
                  </div>
                </div>

                {/* Document Info */}
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                  {document.name}
                </h1>
                
                <div className="flex items-center justify-center gap-3 text-gray-400 mb-8">
                  <span className="uppercase font-medium text-sm tracking-wide">{fileExtension}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                  <span className="font-medium">{formatFileSize(document.file_size)}</span>
                </div>

                {/* Download Button */}
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-400 hover:via-amber-500 hover:to-orange-400 text-white font-bold py-7 text-lg rounded-xl shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 group"
                >
                  {downloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Download startet...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                      Jetzt herunterladen
                    </>
                  )}
                </Button>

                {/* Original Filename */}
                <p className="mt-5 text-xs text-gray-500 truncate px-4">
                  {document.file_name}
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 px-6 text-center">
          <p className="text-sm text-gray-600">
            Bereitgestellt von{" "}
            <Link 
              to="/" 
              className="text-amber-500 hover:text-amber-400 transition-colors font-medium"
            >
              paterbrown.com
            </Link>
          </p>
          <p className="mt-2 text-xs text-gray-700">
            Das Live-Hörspiel nach Gilbert Keith Chesterton
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DownloadPage;
