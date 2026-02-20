import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, AlertCircle, FileText, ArrowLeft, Lock, Clock, Hash, Ban, Package, Image as ImageIcon, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatFileSize, getFileExtension, getPublicDownloadUrl, getImageOriginalUrl } from "@/lib/documentUtils";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface BundleDocument {
  id: string;
  name: string;
  file_path: string;
  file_name: string;
  file_size: number;
  content_type: string | null;
}

interface BundleImage {
  id: string;
  file_name: string;
  file_path: string;
  thumbnail_url: string | null;
}

interface BundleData {
  id: string;
  token: string;
  expires_at: string | null;
  password_hash: string | null;
  max_downloads: number | null;
  download_count: number;
  is_active: boolean;
  created_by: string | null;
  documents: BundleDocument[];
  images: BundleImage[];
}

type ErrorType = "not_found" | "expired" | "max_downloads" | "password_required" | "wrong_password" | "deactivated";

const ERROR_MESSAGES: Record<ErrorType, { title: string; description: string; icon: React.ReactNode }> = {
  not_found: {
    title: "Paket nicht gefunden",
    description: "Dieser Paket-Link existiert nicht oder wurde gelöscht.",
    icon: <AlertCircle className="w-10 h-10 text-red-400" />,
  },
  expired: {
    title: "Link abgelaufen",
    description: "Dieser Paket-Link ist nicht mehr gültig.",
    icon: <Clock className="w-10 h-10 text-amber-400" />,
  },
  max_downloads: {
    title: "Download-Limit erreicht",
    description: "Die maximale Anzahl an Downloads wurde erreicht.",
    icon: <Hash className="w-10 h-10 text-amber-400" />,
  },
  password_required: {
    title: "Passwort erforderlich",
    description: "Dieses Paket ist passwortgeschützt.",
    icon: <Lock className="w-10 h-10 text-gray-400" />,
  },
  wrong_password: {
    title: "Falsches Passwort",
    description: "Das eingegebene Passwort ist nicht korrekt.",
    icon: <Lock className="w-10 h-10 text-red-400" />,
  },
  deactivated: {
    title: "Link deaktiviert",
    description: "Dieser Paket-Link wurde deaktiviert.",
    icon: <Ban className="w-10 h-10 text-gray-400" />,
  },
};

const BundleDownloadPage = () => {
  const { token } = useParams<{ token: string }>();
  const [bundle, setBundle] = useState<BundleData | null>(null);
  const [uploaderName, setUploaderName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorType | null>(null);
  const [password, setPassword] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const fetchBundle = async () => {
      if (!token) { setError("not_found"); setLoading(false); return; }

      try {
        // 1. Bundle laden
        const { data: bundleData, error: bundleError } = await supabase
          .from("document_share_bundles")
          .select("id, token, expires_at, password_hash, max_downloads, download_count, is_active, created_by, image_ids")
          .eq("token", token)
          .maybeSingle();

        if (bundleError) throw bundleError;
        if (!bundleData) { setError("not_found"); setLoading(false); return; }
        if (!bundleData.is_active) { setError("deactivated"); setLoading(false); return; }
        if (bundleData.expires_at && new Date(bundleData.expires_at) < new Date()) { setError("expired"); setLoading(false); return; }
        if (bundleData.max_downloads && bundleData.download_count >= bundleData.max_downloads) { setError("max_downloads"); setLoading(false); return; }

        if (bundleData.password_hash && !passwordVerified) {
          setError("password_required");
          setBundle({ ...bundleData, documents: [], images: [] });
          setLoading(false);
          return;
        }

        // 2. Bundle-Dokumente laden
        const { data: items, error: itemsError } = await supabase
          .from("document_bundle_items")
          .select("document_id, internal_documents(id, name, file_path, file_name, file_size, content_type)")
          .eq("bundle_id", bundleData.id);

        if (itemsError) throw itemsError;

        const documents: BundleDocument[] = (items || [])
          .map((item: any) => item.internal_documents)
          .filter(Boolean);

        // 3. Bundle-Bilder laden (falls image_ids vorhanden)
        let bundleImages: BundleImage[] = [];
        const imageIds: string[] = bundleData.image_ids || [];
        if (imageIds.length > 0) {
          const { data: imagesData } = await supabase
            .from("images")
            .select("id, file_name, file_path, thumbnail_url")
            .in("id", imageIds);
          bundleImages = (imagesData as BundleImage[]) || [];
        }

        setBundle({ ...bundleData, documents, images: bundleImages });
        setError(null);

        // Uploader-Name
        if (bundleData.created_by) {
          const { data: profile } = await supabase
            .from("traveler_profiles")
            .select("first_name, last_name")
            .eq("user_id", bundleData.created_by)
            .maybeSingle();
          if (profile) setUploaderName(`${profile.first_name} ${profile.last_name}`);
        }
      } catch (err) {
        console.error("Error fetching bundle:", err);
        setError("not_found");
      } finally {
        setLoading(false);
      }
    };

    fetchBundle();
  }, [token, passwordVerified]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bundle && password === bundle.password_hash) {
      setPasswordVerified(true);
      setError(null);
    } else {
      setError("wrong_password");
    }
  };

  const triggerDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, fileName);
    } catch {
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  const handleDownloadAll = async () => {
    if (!bundle || !token) return;
    const totalFiles = bundle.documents.length + bundle.images.length;

    // Single file → direct download (no ZIP needed)
    if (totalFiles === 1) {
      setDownloadingId("all");
      try {
        await supabase.rpc("increment_bundle_download", { p_token: token });
        const item = bundle.documents[0] || bundle.images[0];
        const url = bundle.documents[0]
          ? getPublicDownloadUrl(bundle.documents[0].file_path)
          : getImageOriginalUrl("picks-images", bundle.images[0].file_path);
        await triggerDownload(url, item.file_name);
        setDownloaded(true);
      } catch (err) {
        console.error("Download error:", err);
      } finally {
        setDownloadingId(null);
      }
      return;
    }

    // Multiple files → ZIP download
    setDownloadingId("all");
    try {
      await supabase.rpc("increment_bundle_download", { p_token: token });
      const zip = new JSZip();

      // Fetch all files in parallel
      const fetchPromises: Promise<void>[] = [];

      for (const doc of bundle.documents) {
        fetchPromises.push(
          fetch(getPublicDownloadUrl(doc.file_path))
            .then(r => r.blob())
            .then(blob => { zip.file(doc.file_name, blob); })
        );
      }

      for (const img of bundle.images) {
        fetchPromises.push(
          fetch(getImageOriginalUrl("picks-images", img.file_path))
            .then(r => r.blob())
            .then(blob => { zip.file(img.file_name, blob); })
        );
      }

      await Promise.all(fetchPromises);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const label = bundle.images.length > 0 && bundle.documents.length === 0
        ? "Fotos"
        : bundle.documents.length > 0 && bundle.images.length === 0
          ? "Dokumente"
          : "Paket";
      saveAs(zipBlob, `PaterBrown-${label}.zip`);
      setDownloaded(true);
    } catch (err) {
      console.error("ZIP download error:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadSingle = async (item: BundleDocument | BundleImage) => {
    setDownloadingId(item.id);
    try {
      const url = "content_type" in item
        ? getPublicDownloadUrl(item.file_path)
        : getImageOriginalUrl("picks-images", item.file_path);
      await triggerDownload(url, item.file_name);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setTimeout(() => setDownloadingId(null), 500);
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

  if (error === "password_required" || error === "wrong_password") {
    const errorInfo = ERROR_MESSAGES[error];
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-6">
            {errorInfo.icon}
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-3 text-center">{errorInfo.title}</h1>
          <p className="text-gray-500 mb-8 text-center">{errorInfo.description}</p>
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
              className="w-full bg-[#E07A18] hover:bg-[#c96a14] text-white font-semibold py-6 text-base rounded-xl"
            >
              <Lock className="w-5 h-5 mr-2" />
              Entsperren
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    const errorInfo = ERROR_MESSAGES[error || "not_found"];
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            {errorInfo.icon}
          </div>
          <h1 className="text-2xl font-semibold text-white mb-3">{errorInfo.title}</h1>
          <p className="text-white/50 mb-8">{errorInfo.description}</p>
          <Link to="/">
            <Button variant="outline" className="bg-white/5 text-white border-white/10 hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zur Startseite
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalSize = bundle.documents.map((d) => d.file_size).reduce((sum, s) => sum + s, 0);
  const totalCount = bundle.documents.length + bundle.images.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-lg">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Paket bereit</h1>
              <p className="text-white/80 text-sm">
                {totalCount} {totalCount === 1 ? "Datei" : "Dateien"} · {formatFileSize(totalSize)}
              </p>
            </div>
          </div>

          {/* Datei-Liste */}
          <div className="px-6 py-4 space-y-2 max-h-64 overflow-y-auto">
            {/* Bilder aus Picks */}
            {bundle.images.map((img) => (
              <div
                key={img.id}
                className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                    {img.thumbnail_url ? (
                      <img src={img.thumbnail_url} alt={img.file_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{img.file_name}</p>
                    <p className="text-xs text-gray-400">
                      {getFileExtension(img.file_name)?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownloadSingle(img)}
                  disabled={downloadingId === img.id}
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-900"
                >
                  {downloadingId === img.id ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
            {/* Dokumente */}
            {bundle.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name || doc.file_name}</p>
                    <p className="text-xs text-gray-400">
                      {getFileExtension(doc.file_name)?.toUpperCase()} · {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownloadSingle(doc)}
                  disabled={downloadingId === doc.id}
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-900"
                >
                  {downloadingId === doc.id ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Download All */}
          <div className="px-6 pb-6 pt-2 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-4">
              Hallo! Hier ist dein Download-Paket.
            </p>
            <Button
              onClick={handleDownloadAll}
              disabled={downloadingId === "all"}
              className="w-full bg-[#E07A18] hover:bg-[#c96a14] text-white font-semibold py-6 text-base rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              {downloadingId === "all" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {totalCount > 1 ? "ZIP wird erstellt..." : "Download läuft..."}
                </>
              ) : downloaded ? (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Erneut herunterladen
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  {totalCount > 1
                    ? `Alle ${totalCount} Dateien als ZIP herunterladen`
                    : "Datei herunterladen"
                  }
                </>
              )}
            </Button>

            {bundle.max_downloads && (
              <p className="text-xs text-gray-400 text-center mt-3">
                {bundle.download_count}/{bundle.max_downloads} Downloads verwendet
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                {uploaderName
                  ? `Bereitgestellt von ${uploaderName}`
                  : "Bereitgestellt von Pater Brown – Das Live-Hörspiel"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleDownloadPage;
