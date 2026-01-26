import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, AlertCircle, FileText, ArrowLeft, Lock, Clock, Hash, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatFileSize, getFileExtension, getPublicDownloadUrl, isImageFile } from "@/lib/documentUtils";

interface ShareLinkData {
  id: string;
  token: string;
  expires_at: string | null;
  password_hash: string | null;
  max_downloads: number | null;
  download_count: number;
  is_active: boolean;
  created_by: string | null;
  document: {
    id: string;
    name: string;
    file_path: string;
    file_name: string;
    file_size: number;
    content_type: string | null;
  } | null;
}

interface UploaderProfile {
  first_name: string;
  last_name: string;
}

type ErrorType = "not_found" | "expired" | "max_downloads" | "password_required" | "wrong_password" | "deactivated" | "document_removed";

const ERROR_MESSAGES: Record<ErrorType, { title: string; description: string; icon: React.ReactNode }> = {
  not_found: {
    title: "Link nicht gefunden",
    description: "Dieser Download-Link existiert nicht oder wurde gelöscht.",
    icon: <AlertCircle className="w-10 h-10 text-red-400" />,
  },
  expired: {
    title: "Link abgelaufen",
    description: "Dieser Download-Link ist nicht mehr gültig. Bitte fordere einen neuen Link an.",
    icon: <Clock className="w-10 h-10 text-amber-400" />,
  },
  max_downloads: {
    title: "Download-Limit erreicht",
    description: "Die maximale Anzahl an Downloads wurde erreicht. Bitte fordere einen neuen Link an.",
    icon: <Hash className="w-10 h-10 text-amber-400" />,
  },
  password_required: {
    title: "Passwort erforderlich",
    description: "Dieser Download ist passwortgeschützt.",
    icon: <Lock className="w-10 h-10 text-gray-400" />,
  },
  wrong_password: {
    title: "Falsches Passwort",
    description: "Das eingegebene Passwort ist nicht korrekt.",
    icon: <Lock className="w-10 h-10 text-red-400" />,
  },
  deactivated: {
    title: "Link deaktiviert",
    description: "Dieser Download-Link wurde vom Absender deaktiviert und ist nicht mehr verfügbar.",
    icon: <Ban className="w-10 h-10 text-gray-400" />,
  },
  document_removed: {
    title: "Dokument nicht mehr verfügbar",
    description: "Das Dokument wurde entfernt oder durch eine neue Version ersetzt. Bitte fordere einen aktuellen Link an.",
    icon: <FileText className="w-10 h-10 text-gray-400" />,
  },
};

const ShareDownloadPage = () => {
  const { token } = useParams<{ token: string }>();
  const [shareLink, setShareLink] = useState<ShareLinkData | null>(null);
  const [uploaderName, setUploaderName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorType | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);

  useEffect(() => {
    const fetchShareLink = async () => {
      if (!token) {
        setError("not_found");
        setLoading(false);
        return;
      }

      try {
        const { data, error: dbError } = await supabase
          .from("document_share_links")
          .select(`
            id,
            token,
            expires_at,
            password_hash,
            max_downloads,
            download_count,
            is_active,
            created_by,
            document:internal_documents(
              id,
              name,
              file_path,
              file_name,
              file_size,
              content_type
            )
          `)
          .eq("token", token)
          .maybeSingle();

        if (dbError) throw dbError;

        if (!data) {
          setError("not_found");
          setLoading(false);
          return;
        }

        // Check if link is active
        if (!data.is_active) {
          setError("deactivated");
          setLoading(false);
          return;
        }

        // Check if document still exists
        if (!data.document) {
          setError("document_removed");
          setLoading(false);
          return;
        }

        // Check if expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError("expired");
          setLoading(false);
          return;
        }

        // Check max downloads
        if (data.max_downloads && data.download_count >= data.max_downloads) {
          setError("max_downloads");
          setLoading(false);
          return;
        }

        // Check if password protected
        if (data.password_hash && !passwordVerified) {
          setError("password_required");
          setShareLink(data as ShareLinkData);
          setLoading(false);
          return;
        }

        setShareLink(data as ShareLinkData);
        setError(null);

        // Try to get uploader name from traveler_profiles
        if (data.created_by) {
          const { data: profile } = await supabase
            .from("traveler_profiles")
            .select("first_name, last_name")
            .eq("user_id", data.created_by)
            .maybeSingle();
          
          if (profile) {
            setUploaderName(`${profile.first_name} ${profile.last_name}`);
          }
        }
      } catch (err) {
        console.error("Error fetching share link:", err);
        setError("not_found");
      } finally {
        setLoading(false);
      }
    };

    fetchShareLink();
  }, [token, passwordVerified]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shareLink && password === shareLink.password_hash) {
      setPasswordVerified(true);
      setError(null);
    } else {
      setError("wrong_password");
    }
  };

  const handleDownload = async () => {
    if (!shareLink || !shareLink.document || !token) return;

    setDownloading(true);

    try {
      // Increment download count via RPC function
      const { data: success } = await supabase.rpc("increment_share_link_download", {
        p_token: token,
      });

      if (!success) {
        setError("max_downloads");
        return;
      }

      // Also increment on document
      await supabase
        .from("internal_documents")
        .update({ download_count: (shareLink.document.file_size || 0) + 1 })
        .eq("id", shareLink.document.id);

      // Open download URL
      const downloadUrl = getPublicDownloadUrl(shareLink.document.file_path);
      window.open(downloadUrl, "_blank");
    } catch (err) {
      console.error("Error downloading:", err);
    } finally {
      setDownloading(false);
    }
  };

  // Get download URL for background
  const getBackgroundUrl = () => {
    if (shareLink?.document) {
      return getPublicDownloadUrl(shareLink.document.file_path);
    }
    return null;
  };

  const backgroundUrl = getBackgroundUrl();
  const isImage = shareLink?.document ? isImageFile(shareLink.document.content_type, shareLink.document.file_name) : false;

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

  // Password entry screen - Premium style
  if (error === "password_required" || error === "wrong_password") {
    const errorInfo = ERROR_MESSAGES[error];
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8">
        {/* Background */}
        {isImage && backgroundUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          >
            <div className="absolute inset-0 backdrop-blur-3xl" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
        {(!isImage || !backgroundUrl) && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        )}

        {/* Glassmorphism Card */}
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 p-8">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-6">
              {errorInfo.icon}
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
              {errorInfo.title}
            </h1>
            <p className="text-gray-500 mb-8 text-center">
              {errorInfo.description}
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Passwort eingeben"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-900 py-6 rounded-xl"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!password}
                className="w-full bg-[#E07A18] hover:bg-[#c96a14] text-white font-semibold py-6 text-base rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <Lock className="w-5 h-5 mr-2" />
                Entsperren
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Error screens - Premium style
  if (error || !shareLink || !shareLink.document) {
    const errorInfo = ERROR_MESSAGES[error || "not_found"];
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            {errorInfo.icon}
          </div>
          <h1 className="text-2xl font-semibold text-white mb-3">
            {errorInfo.title}
          </h1>
          <p className="text-white/50 mb-8">
            {errorInfo.description}
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

  const document = shareLink.document;
  const fileExtension = getFileExtension(document.file_name);
  const downloadUrl = getPublicDownloadUrl(document.file_path);
  const isImageFile2 = isImageFile(document.content_type, document.file_name);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8">
      {/* Blurred Background Image */}
      {isImageFile2 && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${downloadUrl})` }}
        >
          <div className="absolute inset-0 backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      
      {/* Fallback dark background for non-images */}
      {!isImageFile2 && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      )}

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          {/* Image Preview */}
          <div className="bg-gray-100 p-6 flex items-center justify-center min-h-[200px] md:min-h-[280px]">
            {isImageFile2 ? (
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
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>{fileExtension?.toUpperCase()}</span>
                    <span>•</span>
                    <span>{formatFileSize(document.file_size)}</span>
                    {shareLink.max_downloads && (
                      <>
                        <span>•</span>
                        <span>{shareLink.download_count}/{shareLink.max_downloads} Downloads</span>
                      </>
                    )}
                  </div>
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

export default ShareDownloadPage;
