import { useState, useCallback, useRef } from "react";
import { Upload, X, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatFileSize } from "@/lib/documentUtils";

interface ExistingFile {
  name: string;
  id?: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  } | null;
}

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DocumentUploadModal = ({ open, onOpenChange, onSuccess }: DocumentUploadModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadMode, setUploadMode] = useState<"new" | "existing">("new");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedExistingFile, setSelectedExistingFile] = useState<ExistingFile | null>(null);
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const loadExistingFiles = useCallback(async () => {
    setLoadingExisting(true);
    try {
      const { data, error } = await supabase.storage
        .from("internal-documents")
        .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
      
      if (error) throw error;
      const files = data?.filter(f => f.name !== ".emptyFolderPlaceholder") || [];
      setExistingFiles(files.map(f => ({
        name: f.name,
        id: f.id,
        metadata: f.metadata as ExistingFile["metadata"],
      })));
    } catch (error) {
      console.error("Error loading existing files:", error);
    } finally {
      setLoadingExisting(false);
    }
  }, []);

  const handleModeChange = (mode: "new" | "existing") => {
    setUploadMode(mode);
    if (mode === "existing" && existingFiles.length === 0) {
      loadExistingFiles();
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setUploadMode("new");
      if (!name) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setName(nameWithoutExt);
      }
    }
  }, [name]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!name) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setName(nameWithoutExt);
      }
    }
  };

  const handleExistingFileSelect = (file: ExistingFile) => {
    setSelectedExistingFile(file);
    if (!name) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setName(nameWithoutExt);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedExistingFile(null);
    setName("");
    setUploadMode("new");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Name erforderlich",
        description: "Bitte gib einen Namen für das Dokument ein.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      let filePath: string;
      let fileName: string;
      let fileSize: number;
      let contentType: string | null;

      if (uploadMode === "new" && selectedFile) {
        // Upload new file
        const timestamp = Date.now();
        const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        filePath = `${timestamp}-${safeName}`;
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
        contentType = selectedFile.type || null;

        const { error: uploadError } = await supabase.storage
          .from("internal-documents")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;
      } else if (uploadMode === "existing" && selectedExistingFile) {
        // Use existing file
        filePath = selectedExistingFile.name;
        fileName = selectedExistingFile.name;
        fileSize = selectedExistingFile.metadata?.size ?? 0;
        contentType = selectedExistingFile.metadata?.mimetype ?? null;
      } else {
        toast({
          title: "Keine Datei ausgewählt",
          description: "Bitte wähle eine Datei aus oder lade eine neue hoch.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Create document record (category defaults to 'other')
      const { error: dbError } = await supabase
        .from("internal_documents")
        .insert({
          name: name.trim(),
          category: "other",
          file_path: filePath,
          file_name: fileName,
          file_size: fileSize,
          content_type: contentType,
          uploaded_by: user?.id || null,
        });

      if (dbError) throw dbError;

      toast({
        title: "Dokument hinzugefügt",
        description: `"${name}" wurde erfolgreich hinzugefügt.`,
      });

      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Fehler",
        description: "Das Dokument konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Dokument hinzufügen</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Upload Mode Selection */}
          <RadioGroup
            value={uploadMode}
            onValueChange={(v) => handleModeChange(v as "new" | "existing")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new" className="text-gray-700 cursor-pointer">
                Neue Datei hochladen
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing" />
              <Label htmlFor="existing" className="text-gray-700 cursor-pointer">
                Bestehende Datei auswählen
              </Label>
            </div>
          </RadioGroup>

          {/* New File Upload */}
          {uploadMode === "new" && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive 
                  ? "border-amber-500 bg-amber-50" 
                  : selectedFile 
                    ? "border-green-500 bg-green-50" 
                    : "border-gray-300 hover:border-gray-400 bg-gray-50"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip"
              />
              
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-1">Datei hierher ziehen</p>
                  <p className="text-sm text-gray-500">oder klicken zum Auswählen</p>
                  <p className="text-xs text-gray-400 mt-2">Max. 50 MB</p>
                </>
              )}
            </div>
          )}

          {/* Existing Files Selection */}
          {uploadMode === "existing" && (
            <div className="border border-gray-200 rounded-lg bg-gray-50">
              {loadingExisting ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-2" />
                  Lade Dateien...
                </div>
              ) : existingFiles.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Keine bestehenden Dateien gefunden
                </div>
              ) : (
                <ScrollArea className="h-48">
                  <div className="p-2 space-y-1">
                    {existingFiles.map((file) => (
                      <button
                        key={file.id || file.name}
                        type="button"
                        onClick={() => handleExistingFileSelect(file)}
                        className={`
                          w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors
                          ${selectedExistingFile?.name === file.name
                            ? "bg-amber-100 border border-amber-300"
                            : "hover:bg-gray-100 border border-transparent"
                          }
                        `}
                      >
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.metadata?.size || 0)}
                          </p>
                        </div>
                        {selectedExistingFile?.name === file.name && (
                          <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">Anzeigename</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Presse-Dossier v2.2"
              className="bg-white border-gray-200 text-gray-900"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={uploading}
              className="bg-white text-gray-700"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading || (!selectedFile && !selectedExistingFile) || !name.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Hochladen...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Hinzufügen
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadModal;
