import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, CloudDownload, RefreshCw, Upload, Image as ImageIcon, FileText,
  Table, Presentation, Archive, File, Sparkles, FolderOpen,
  CheckSquare, Check, X, Link, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DocumentCard from "./DocumentCard";
import DocumentUploadModal from "./DocumentUploadModal";
import ShareLinkDialog from "./ShareLinkDialog";
import BulkShareLinkDialog from "./BulkShareLinkDialog";
import { getFileTypeGroup, FILE_TYPE_GROUPS, FileTypeGroup, getImageOriginalUrl } from "@/lib/documentUtils";
import { cn } from "@/lib/utils";

// ── Pending Drop from Supabase ──────────────────────────────────────────────
interface PendingDropImage {
  id: string;
  file_name: string;
  file_path: string;
  thumbnail_url: string | null;
}

interface PendingDrop {
  id: string;
  image_ids: string[];
  label: string;
  images: PendingDropImage[];
}

// ── Document types ──────────────────────────────────────────────────────────
interface Document {
  id: string;
  name: string;
  file_path: string;
  file_name: string;
  file_size: number;
  content_type: string | null;
  download_count: number;
  created_at: string;
}

const GROUP_ICONS: Record<FileTypeGroup, React.ReactNode> = {
  images: <ImageIcon className="w-4 h-4" />,
  pdfs: <FileText className="w-4 h-4" />,
  documents: <FileText className="w-4 h-4" />,
  spreadsheets: <Table className="w-4 h-4" />,
  presentations: <Presentation className="w-4 h-4" />,
  archives: <Archive className="w-4 h-4" />,
  other: <File className="w-4 h-4" />,
};

const GROUP_COLORS: Record<FileTypeGroup, string> = {
  images: "from-slate-500 to-slate-600",
  pdfs: "from-slate-600 to-slate-700",
  documents: "from-slate-500 to-slate-600",
  spreadsheets: "from-slate-500 to-slate-600",
  presentations: "from-amber-500 to-amber-600",
  archives: "from-slate-400 to-slate-500",
  other: "from-gray-500 to-slate-600",
};

// ── No props needed — DocumentsPanel is fully self-contained ────────────────
const DocumentsPanel = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pageDragActive, setPageDragActive] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkShareDialog, setShowBulkShareDialog] = useState(false);

  // ── Pending Drop from Supabase (replaces all client-state hacks) ────────
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);

  const fetchPendingDrop = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: drops } = await supabase
        .from("pending_drops")
        .select("*")
        .eq("created_by", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!drops || drops.length === 0) {
        setPendingDrop(null);
        return;
      }

      const drop = drops[0];
      const imageIds: string[] = drop.image_ids || [];

      if (imageIds.length === 0) {
        setPendingDrop(null);
        return;
      }

      // Bild-Metadaten laden
      const { data: images } = await supabase
        .from("images")
        .select("id, file_name, file_path, thumbnail_url")
        .in("id", imageIds);

      setPendingDrop({
        id: drop.id,
        image_ids: imageIds,
        label: drop.label || "Picks-Auswahl",
        images: (images as PendingDropImage[]) || [],
      });
    } catch (err) {
      console.error("Error fetching pending drop:", err);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchPendingDrop();
  }, [fetchPendingDrop]);

  // Re-fetch when window gains focus (covers tab switches)
  useEffect(() => {
    const onFocus = () => fetchPendingDrop();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchPendingDrop]);

  // Supabase Realtime — reacts instantly when PicksPanel inserts a pending_drop
  useEffect(() => {
    const channel = supabase
      .channel("pending-drops-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "pending_drops",
      }, () => {
        fetchPendingDrop();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPendingDrop]);

  // ── Dismiss pending drop (cancel) ────────────────────────────────────────
  const dismissPendingDrop = useCallback(async () => {
    if (!pendingDrop) return;
    await supabase
      .from("pending_drops")
      .update({ status: "cancelled" })
      .eq("id", pendingDrop.id);
    setPendingDrop(null);
  }, [pendingDrop]);

  // ── Mark pending drop as sent (after bundle link generated) ──────────────
  const markPendingDropSent = useCallback(async () => {
    if (!pendingDrop) return;
    await supabase
      .from("pending_drops")
      .update({ status: "sent" })
      .eq("id", pendingDrop.id);
    setPendingDrop(null);
  }, [pendingDrop]);

  const selectedDocuments = useMemo(
    () => documents.filter((d) => selectedIds.has(d.id)),
    [documents, selectedIds]
  );

  // Toggle selection for a document
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Group documents by file type
  const groupedDocuments = useMemo(() => {
    const groups: Record<FileTypeGroup, Document[]> = {
      images: [],
      pdfs: [],
      documents: [],
      spreadsheets: [],
      presentations: [],
      archives: [],
      other: [],
    };

    documents.forEach(doc => {
      const group = getFileTypeGroup(doc.content_type, doc.file_name);
      groups[group].push(doc);
    });

    return Object.entries(groups)
      .filter(([, docs]) => docs.length > 0)
      .sort(([a], [b]) => FILE_TYPE_GROUPS[a as FileTypeGroup].order - FILE_TYPE_GROUPS[b as FileTypeGroup].order)
      .map(([group, docs]) => ({
        group: group as FileTypeGroup,
        label: FILE_TYPE_GROUPS[group as FileTypeGroup].label,
        documents: docs,
      }));
  }, [documents]);

  // Handle page-level drag events
  const handlePageDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types.includes("Files")) {
      setPageDragActive(true);
    }
  }, []);

  const handlePageDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handlePageDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.relatedTarget === null || !(e.relatedTarget as Node).ownerDocument) {
      setPageDragActive(false);
    }
  }, []);

  const handlePageDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPageDragActive(false);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setDroppedFiles(files);
      setShowUploadModal(true);
    }
  }, []);

  // Add global drag listeners
  useEffect(() => {
    document.addEventListener("dragenter", handlePageDragEnter);
    document.addEventListener("dragover", handlePageDragOver);
    document.addEventListener("dragleave", handlePageDragLeave);
    document.addEventListener("drop", handlePageDrop);

    return () => {
      document.removeEventListener("dragenter", handlePageDragEnter);
      document.removeEventListener("dragover", handlePageDragOver);
      document.removeEventListener("dragleave", handlePageDragLeave);
      document.removeEventListener("drop", handlePageDrop);
    };
  }, [handlePageDragEnter, handlePageDragOver, handlePageDragLeave, handlePageDrop]);

  // Clear dropped files when modal closes
  const handleModalOpenChange = (open: boolean) => {
    setShowUploadModal(open);
    if (!open) {
      setDroppedFiles([]);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("internal_documents")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments((data as Document[]) || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Fehler",
        description: "Dokumente konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: dbError } = await supabase
        .from("internal_documents")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id || null
        })
        .eq("id", id);

      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(d => d.id !== id));

      toast({
        title: "In Papierkorb verschoben",
        description: `"${doc.name}" kann 90 Tage lang wiederhergestellt werden.`,
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Fehler",
        description: "Das Dokument konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/30">
              <CloudDownload className="w-8 h-8 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1 border-2 border-amber-500/30 border-t-amber-500 rounded-2xl"
            />
          </div>
          <span className="text-sm text-gray-500 font-medium">Lade Drops...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Page-level drop overlay */}
      <AnimatePresence>
        {pageDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-dashed border-amber-400 p-16 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/30"
              >
                <Upload className="w-10 h-10 text-white" />
              </motion.div>
              <p className="text-2xl font-semibold text-gray-900">Dateien hier ablegen</p>
              <p className="text-gray-500 mt-2">zum Hochladen</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <CloudDownload className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-amber-500" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Drops</h2>
              <p className="text-sm text-gray-500">
                {documents.length} {documents.length === 1 ? 'Datei' : 'Dateien'} bereit zum Teilen
              </p>
              {documents.length > 0 && selectedIds.size === 0 && !pendingDrop && (
                <p className="text-xs text-gray-400 mt-0.5">
                  ○ links antippen → Paket-Link generieren
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="h-10 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
              >
                <X className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Auswahl aufheben</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={fetchDocuments}
              className="h-10 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
            >
              <RefreshCw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Aktualisieren</span>
            </Button>
            <Button
              onClick={() => setShowUploadModal(true)}
              className={cn(
                "h-10 rounded-xl",
                "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
                "text-white font-medium shadow-lg shadow-amber-500/30",
                "transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/40"
              )}
            >
              <Plus className="w-4 h-4 mr-2" />
              Neuer Drop
            </Button>
          </div>
        </motion.div>

        {/* Selection Action Bar - Floating at bottom */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
            >
              <div className="flex items-center gap-3 px-5 py-3 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{selectedIds.size}</span>
                  </div>
                  <span className="text-white/90 text-sm font-medium hidden sm:block">
                    {selectedIds.size === 1 ? "Datei" : "Dateien"}
                  </span>
                </div>
                <div className="w-px h-6 bg-white/20" />
                <Button
                  onClick={() => setShowBulkShareDialog(true)}
                  size="sm"
                  className={cn(
                    "h-9 rounded-xl gap-2",
                    "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                    "text-white font-medium shadow-lg shadow-amber-500/30"
                  )}
                >
                  <Link className="w-4 h-4" />
                  <span className="hidden sm:inline">Paket-Link generieren</span>
                  <span className="sm:hidden">Link</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pending Drop Banner (from Supabase — persistent!) ──────────── */}
        <AnimatePresence>
          {pendingDrop && pendingDrop.images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4"
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                    <Send className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      {pendingDrop.images.length} Foto{pendingDrop.images.length !== 1 ? "s" : ""} aus Picks
                    </p>
                    <p className="text-xs text-amber-700">Paket-Link für diese Fotos generieren</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                    onClick={() => setShowBulkShareDialog(true)}
                  >
                    <Link className="w-4 h-4 mr-1.5" />
                    Paket-Link generieren
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-xl"
                    onClick={dismissPendingDrop}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {/* Thumbnail preview */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {pendingDrop.images.slice(0, 8).map((img) => (
                  <div key={img.id} className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-amber-100 border border-amber-200">
                    {img.thumbnail_url ? (
                      <img src={img.thumbnail_url} alt={img.file_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-amber-400" />
                      </div>
                    )}
                  </div>
                ))}
                {pendingDrop.images.length > 8 && (
                  <div className="shrink-0 w-16 h-16 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 text-sm font-medium">
                    +{pendingDrop.images.length - 8}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {documents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-4"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative inline-block"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FolderOpen className="w-12 h-12 text-gray-400" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
              >
                <Plus className="w-4 h-4 text-white" />
              </motion.div>
            </motion.div>

            <h3 className="font-bold text-xl text-gray-900 mb-2">Noch keine Drops</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Erstelle deinen ersten Drop, um Dateien schnell und sicher mit anderen zu teilen.
            </p>
            <Button
              onClick={() => setShowUploadModal(true)}
              className={cn(
                "h-12 px-8 rounded-xl",
                "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
                "text-white font-medium shadow-lg shadow-amber-500/30"
              )}
            >
              <Plus className="w-5 h-5 mr-2" />
              Ersten Drop erstellen
            </Button>
          </motion.div>
        ) : (
          /* Grouped Documents */
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {groupedDocuments.map(({ group, label, documents: docs }, groupIndex) => (
                <motion.div
                  key={group}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: groupIndex * 0.1 }}
                >
                  {/* Group Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md",
                      "bg-gradient-to-br",
                      GROUP_COLORS[group]
                    )}>
                      {GROUP_ICONS[group]}
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-800">
                        {label}
                      </h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        "bg-gray-100 text-gray-500"
                      )}>
                        {docs.length}
                      </span>
                    </div>
                  </div>

                  {/* Document Cards */}
                  <div className="space-y-3">
                    {docs.map((doc, index) => (
                      <div
                        key={doc.id}
                        className="relative group cursor-pointer"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button, a, [role="button"]')) {
                            return;
                          }
                          toggleSelection(doc.id);
                        }}
                      >
                        {/* Selection indicator - left edge */}
                        <div className={cn(
                          "absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-200",
                          selectedIds.has(doc.id)
                            ? "bg-amber-500"
                            : "bg-transparent group-hover:bg-gray-200"
                        )} />

                        {/* Large tap zone over left icon area */}
                        <div
                          className="absolute inset-y-0 left-0 w-20 z-10 cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); toggleSelection(doc.id); }}
                        >
                          <div className={cn(
                            "absolute top-1/2 -translate-y-1/2 left-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                            selectedIds.has(doc.id)
                              ? "bg-amber-500 border-amber-500 shadow-lg"
                              : "bg-white/80 border-white shadow-md"
                          )}>
                            {selectedIds.has(doc.id) && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>

                        <div className={cn(
                          "transition-all duration-200",
                          selectedIds.has(doc.id) && "ring-2 ring-amber-500/50 rounded-2xl"
                        )}>
                          <DocumentCard
                            id={doc.id}
                            name={doc.name}
                            fileName={doc.file_name}
                            filePath={doc.file_path}
                            fileSize={doc.file_size}
                            contentType={doc.content_type}
                            downloadCount={doc.download_count}
                            createdAt={doc.created_at}
                            onDelete={handleDelete}
                            index={groupIndex * 10 + index}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Upload Modal */}
        <DocumentUploadModal
          open={showUploadModal}
          onOpenChange={handleModalOpenChange}
          onSuccess={fetchDocuments}
          initialFiles={droppedFiles}
        />

        {/* Bulk Share Dialog */}
        <BulkShareLinkDialog
          open={showBulkShareDialog}
          onOpenChange={(open) => setShowBulkShareDialog(open)}
          onSuccess={async () => {
            if (pendingDrop) await markPendingDropSent();
          }}
          documentIds={selectedDocuments.map((d) => d.id)}
          documentNames={selectedDocuments.map((d) => d.name)}
          imageIds={pendingDrop?.image_ids || []}
          imageNames={pendingDrop?.images.map((i) => i.file_name) || []}
        />
      </div>
    </>
  );
};

export default DocumentsPanel;
