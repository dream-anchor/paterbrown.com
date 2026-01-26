import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Package, RefreshCw, Upload, Image, FileText, Table, Presentation, Archive, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DocumentCard from "./DocumentCard";
import DocumentUploadModal from "./DocumentUploadModal";
import { getFileTypeGroup, FILE_TYPE_GROUPS, FileTypeGroup } from "@/lib/documentUtils";

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
  images: <Image className="w-4 h-4" />,
  pdfs: <FileText className="w-4 h-4" />,
  documents: <FileText className="w-4 h-4" />,
  spreadsheets: <Table className="w-4 h-4" />,
  presentations: <Presentation className="w-4 h-4" />,
  archives: <Archive className="w-4 h-4" />,
  other: <File className="w-4 h-4" />,
};

const DocumentsPanel = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pageDragActive, setPageDragActive] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);

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

    // Sort groups by order and filter empty ones
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
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("internal-documents")
        .remove([doc.file_path]);

      if (storageError) {
        console.warn("Storage delete warning:", storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("internal_documents")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(d => d.id !== id));
      
      toast({
        title: "Dokument gelöscht",
        description: `"${doc.name}" wurde erfolgreich gelöscht.`,
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
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-amber-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Lade Dokumente...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page-level drop overlay */}
      {pageDragActive && (
        <div className="fixed inset-0 z-50 bg-amber-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-dashed border-amber-500 p-12 text-center">
            <Upload className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-900">Dateien hier ablegen</p>
            <p className="text-gray-500 mt-1">zum Hochladen</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Drops</h2>
              <p className="text-sm text-gray-500">
                Dateien bereitstellen und Links teilen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDocuments}
              className="bg-white text-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Neuer Drop
            </Button>
          </div>
        </div>

        {/* Drops List - Grouped */}
        {documents.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Noch keine Drops</h3>
            <p className="text-sm text-gray-500 mb-4">
              Erstelle deinen ersten Drop, um Dateien mit anderen zu teilen.
            </p>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ersten Drop erstellen
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedDocuments.map(({ group, label, documents: docs }) => (
              <div key={group}>
                {/* Group Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">
                    {GROUP_ICONS[group]}
                  </div>
                  <h3 className="text-sm font-medium text-gray-700">
                    {label}
                  </h3>
                  <span className="text-xs text-gray-400">
                    ({docs.length})
                  </span>
                </div>
                
                {/* Group Documents */}
                <div className="space-y-3">
                  {docs.map(doc => (
                    <DocumentCard
                      key={doc.id}
                      id={doc.id}
                      name={doc.name}
                      fileName={doc.file_name}
                      filePath={doc.file_path}
                      fileSize={doc.file_size}
                      contentType={doc.content_type}
                      downloadCount={doc.download_count}
                      createdAt={doc.created_at}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        <DocumentUploadModal
          open={showUploadModal}
          onOpenChange={handleModalOpenChange}
          onSuccess={fetchDocuments}
          initialFiles={droppedFiles}
        />
      </div>
    </>
  );
};

export default DocumentsPanel;
