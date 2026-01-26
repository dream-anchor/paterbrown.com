import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, X, FileText, Check, Trash2 } from "lucide-react";
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

interface FileWithName {
  file: File;
  displayName: string;
}

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialFiles?: File[];
}

const DocumentUploadModal = ({ open, onOpenChange, onSuccess, initialFiles }: DocumentUploadModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadMode, setUploadMode] = useState<"new" | "existing">("new");
  const [selectedFiles, setSelectedFiles] = useState<FileWithName[]>([]);
  const [selectedExistingFile, setSelectedExistingFile] = useState<ExistingFile | null>(null);
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [existingFileName, setExistingFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Handle initial files from page drop
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0 && open) {
      const filesWithNames = initialFiles.map(file => ({
        file,
        displayName: file.name.replace(/\.[^/.]+$/, ""),
      }));
      setSelectedFiles(filesWithNames);
      setUploadMode("new");
    }
  }, [initialFiles, open]);

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({
        file,
        displayName: file.name.replace(/\.[^/.]+$/, ""),
      }));
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setUploadMode("new");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        displayName: file.name.replace(/\.[^/.]+$/, ""),
      }));
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileNameChange = (index: number, newName: string) => {
    setSelectedFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, displayName: newName } : f
    ));
  };

  const handleExistingFileSelect = (file: ExistingFile) => {
    setSelectedExistingFile(file);
    if (!existingFileName) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setExistingFileName(nameWithoutExt);
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setSelectedExistingFile(null);
    setExistingFileName("");
    setUploadMode("new");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Helper to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (uploadMode === "new" && selectedFiles.length === 0) {
      toast({
        title: "Keine Dateien ausgewählt",
        description: "Bitte wähle mindestens eine Datei aus.",
        variant: "destructive",
      });
      return;
    }

    if (uploadMode === "new" && selectedFiles.some(f => !f.displayName.trim())) {
      toast({
        title: "Name erforderlich",
        description: "Bitte gib für alle Dateien einen Namen ein.",
        variant: "destructive",
      });
      return;
    }

    if (uploadMode === "existing" && (!selectedExistingFile || !existingFileName.trim())) {
      toast({
        title: "Auswahl erforderlich",
        description: "Bitte wähle eine Datei aus und gib einen Namen ein.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (uploadMode === "new") {
        // Upload all new files to R2
        for (const { file, displayName } of selectedFiles) {
          // Convert file to base64
          const base64Content = await fileToBase64(file);

          // Call R2 upload edge function
          const { data: r2Result, error: r2Error } = await supabase.functions.invoke("upload-to-r2", {
            body: {
              fileName: file.name,
              contentType: file.type || "application/octet-stream",
              content: base64Content,
              folder: "documents",
            },
          });

          if (r2Error) {
            console.error("R2 upload error:", r2Error);
            throw new Error(`R2 Upload fehlgeschlagen: ${r2Error.message}`);
          }

          if (!r2Result?.success) {
            throw new Error(r2Result?.error || "R2 Upload fehlgeschlagen");
          }

          // Store the R2 public URL in the database
          const { error: dbError } = await supabase
            .from("internal_documents")
            .insert({
              name: displayName.trim(),
              category: "other",
              file_path: r2Result.public_url, // Store R2 public URL
              file_name: file.name,
              file_size: r2Result.file_size || file.size,
              content_type: file.type || null,
              uploaded_by: user?.id || null,
            });

          if (dbError) throw dbError;
        }

        toast({
          title: selectedFiles.length === 1 ? "Dokument hinzugefügt" : "Dokumente hinzugefügt",
          description: `${selectedFiles.length} ${selectedFiles.length === 1 ? "Datei wurde" : "Dateien wurden"} erfolgreich zu R2 hochgeladen.`,
        });
      } else if (uploadMode === "existing" && selectedExistingFile) {
        // Use existing file (from Supabase - legacy)
        const filePath = selectedExistingFile.name;
        const fileName = selectedExistingFile.name;
        const fileSize = selectedExistingFile.metadata?.size ?? 0;
        const contentType = selectedExistingFile.metadata?.mimetype ?? null;

        const { error: dbError } = await supabase
          .from("internal_documents")
          .insert({
            name: existingFileName.trim(),
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
          description: `"${existingFileName}" wurde erfolgreich hinzugefügt.`,
        });
      }

      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Die Dokumente konnten nicht hochgeladen werden.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-white max-w-lg"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {selectedFiles.length > 1 ? `${selectedFiles.length} Dokumente hinzufügen` : "Dokument hinzufügen"}
          </DialogTitle>
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
            <div className="space-y-4">
              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
                  ${dragActive 
                    ? "border-amber-500 bg-amber-50" 
                    : "border-gray-300 hover:border-gray-400 bg-gray-50"
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip"
                />
                
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 text-sm mb-1">Dateien hierher ziehen</p>
                <p className="text-xs text-gray-500">oder klicken zum Auswählen (mehrere möglich)</p>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <ScrollArea className="max-h-48">
                  <div className="space-y-2">
                    {selectedFiles.map((fileWithName, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex flex-col items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-[8px] font-medium text-gray-500 uppercase mt-0.5">
                            {fileWithName.file.name.split('.').pop()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Input
                            value={fileWithName.displayName}
                            onChange={(e) => handleFileNameChange(index, e.target.value)}
                            placeholder="Anzeigename"
                            className="h-8 text-sm bg-white border-gray-200"
                          />
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {fileWithName.file.name} • {formatFileSize(fileWithName.file.size)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="flex-shrink-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {/* Existing Files Selection */}
          {uploadMode === "existing" && (
            <div className="space-y-4">
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

              {/* Name Input for existing file */}
              {selectedExistingFile && (
                <div className="space-y-2">
                  <Label htmlFor="existingName" className="text-gray-700">Anzeigename</Label>
                  <Input
                    id="existingName"
                    value={existingFileName}
                    onChange={(e) => setExistingFileName(e.target.value)}
                    placeholder="z.B. Presse-Dossier v2.2"
                    className="bg-white border-gray-200 text-gray-900"
                  />
                </div>
              )}
            </div>
          )}

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
              disabled={
                uploading || 
                (uploadMode === "new" && selectedFiles.length === 0) ||
                (uploadMode === "existing" && (!selectedExistingFile || !existingFileName.trim()))
              }
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
                  {selectedFiles.length > 1 ? `${selectedFiles.length} Dateien hinzufügen` : "Hinzufügen"}
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
