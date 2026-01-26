import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, AlertCircle, FileText, ArrowLeft, ExternalLink, Lock, Clock, Hash, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatFileSize, getFileExtension, getPublicDownloadUrl, isImageFile } from "@/lib/documentUtils";
import paterBrownLogo from "@/assets/pater-brown-logo.png";

interface ShareLinkData {
  id: string;
  token: string;
  expires_at: string | null;
  password_hash: string | null;
  max_downloads: number | null;
  download_count: number;
  is_active: boolean;
  document: {
    id: string;
    name: string;
    file_path: string;
    file_name: string;
    file_size: number;
    content_type: string | null;
  } | null;
}

type ErrorType = "not_found" | "expired" | "max_downloads" | "password_required" | "wrong_password" | "deactivated" | "document_removed";

const ERROR_MESSAGES: Record<ErrorType, { title: string; description: string; icon: React.ReactNode }> = {
  not_found: {
    title: "Link nicht gefunden",
    description: "Dieser Download-Link existiert nicht oder wurde gelöscht.",
    icon: <AlertCircle className="w-8 h-8 text-red-500" />,
  },
  expired: {
    title: "Link abgelaufen",
    description: "Dieser Download-Link ist nicht mehr gültig. Bitte fordere einen neuen Link an.",
    icon: <Clock className="w-8 h-8 text-amber-500" />,
  },
  max_downloads: {
    title: "Download-Limit erreicht",
    description: "Die maximale Anzahl an Downloads wurde erreicht. Bitte fordere einen neuen Link an.",
    icon: <Hash className="w-8 h-8 text-amber-500" />,
  },
  password_required: {
    title: "Passwort erforderlich",
    description: "Dieser Download ist passwortgeschützt.",
    icon: <Lock className="w-8 h-8 text-gray-400" />,
  },
  wrong_password: {
    title: "Falsches Passwort",
    description: "Das eingegebene Passwort ist nicht korrekt.",
    icon: <Lock className="w-8 h-8 text-red-500" />,
  },
  deactivated: {
    title: "Link deaktiviert",
    description: "Dieser Download-Link wurde vom Absender deaktiviert und ist nicht mehr verfügbar.",
    icon: <Ban className="w-8 h-8 text-gray-400" />,
  },
  document_removed: {
    title: "Dokument nicht mehr verfügbar",
    description: "Das Dokument wurde entfernt oder durch eine neue Version ersetzt. Bitte fordere einen aktuellen Link an.",
    icon: <FileText className="w-8 h-8 text-gray-400" />,
  },
};

const ShareDownloadPage = () => {
  const { token } = useParams<{ token: string }>();
  const [shareLink, setShareLink] = useState<ShareLinkData | null>(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-amber-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Lade...</span>
        </div>
      </div>
    );
  }

  // Password entry screen
  if (error === "password_required" || error === "wrong_password") {
    const errorInfo = ERROR_MESSAGES[error];
    return (
      <div className="min-h-screen bg-gray-50">
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

        <main className="max-w-md mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-6">
              {errorInfo.icon}
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {errorInfo.title}
            </h1>
            <p className="text-gray-500 mb-6 text-sm">
              {errorInfo.description}
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Passwort eingeben"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-gray-200 text-gray-900"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!password}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Lock className="w-4 h-4 mr-2" />
                Entsperren
              </Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Error screens (including deactivated and document_removed)
  if (error || !shareLink || !shareLink.document) {
    const errorInfo = ERROR_MESSAGES[error || "not_found"];
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-6">
            {errorInfo.icon}
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            {errorInfo.description}
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

  const document = shareLink.document;
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
              {shareLink.max_downloads && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>
                    {shareLink.download_count}/{shareLink.max_downloads} Downloads
                  </span>
                </>
              )}
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

export default ShareDownloadPage;
