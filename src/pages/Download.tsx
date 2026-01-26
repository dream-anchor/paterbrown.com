import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, AlertCircle, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatFileSize, getFileExtension, getPublicDownloadUrl, isImageFile } from "@/lib/documentUtils";

interface DocumentData {
  id: string;
  name: string;
  file_path: string;
  file_name: string;
  file_size: number;
  content_type: string | null;
  download_count: number;
  uploaded_by: string | null;
}

interface UploaderProfile {
  first_name: string;
  last_name: string;
}

const DownloadPage = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [uploaderName, setUploaderName] = useState<string | null>(null);
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
          .select("id, name, file_path, file_name, file_size, content_type, download_count, uploaded_by")
          .eq("id", id)
          .maybeSingle();

        if (dbError) throw dbError;
        
        if (!data) {
          setError("Dokument nicht gefunden");
        } else {
          setDocument(data);
          
          // Try to get uploader name from traveler_profiles
          if (data.uploaded_by) {
            const { data: profile } = await supabase
              .from("traveler_profiles")
              .select("first_name, last_name")
              .eq("user_id", data.uploaded_by)
              .maybeSingle();
            
            if (profile) {
              setUploaderName(`${profile.first_name} ${profile.last_name}`);
            }
          }
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-sm text-white/60 font-medium">Wird geladen...</span>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-3">
            {error || "Dokument nicht gefunden"}
          </h1>
          <p className="text-white/50 mb-8">
            Die angeforderte Datei ist nicht verfügbar oder der Link ist ungültig.
          </p>
          <Link to="/">
            <Button 
              variant="outline" 
              className="bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/20"
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
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8">
      {/* Blurred Background Image */}
      {isImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${downloadUrl})` }}
        >
          <div className="absolute inset-0 backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      
      {/* Fallback dark background for non-images */}
      {!isImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      )}

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          {/* Image Preview */}
          <div className="bg-gray-100 p-6 flex items-center justify-center min-h-[200px] md:min-h-[280px]">
            {isImage ? (
              <img
                src={downloadUrl}
                alt={document.name}
                className="max-h-64 md:max-h-80 max-w-full rounded-lg shadow-lg object-contain"
              />
            ) : (
              <div className="w-24 h-28 rounded-xl bg-white border border-gray-200 shadow-md flex flex-col items-center justify-center">
                <FileText className="w-10 h-10 text-gray-400 mb-1" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {fileExtension || "DOC"}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Greeting */}
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
              Hallo! Hier ist der Download-Link.
            </h2>
            <p className="text-gray-500 mb-6">
              Die Datei steht zur Abholung bereit.
            </p>

            {/* File Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {document.file_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fileExtension?.toUpperCase()} • {formatFileSize(document.file_size)}
                  </p>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-[#E07A18] hover:bg-[#c96a14] text-white font-semibold py-6 text-base rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              {downloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Download startet...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Jetzt herunterladen
                </>
              )}
            </Button>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                {uploaderName 
                  ? `Bereitgestellt von ${uploaderName}`
                  : "Bereitgestellt von Pater Brown – Das Live-Hörspiel"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
