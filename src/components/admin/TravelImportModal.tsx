import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, FileText, X, Loader2, CheckCircle2, 
  AlertCircle, Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TravelImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface UploadedFile {
  file: File;
  status: "pending" | "uploading" | "processing" | "success" | "error";
  error?: string;
  bookingsCreated?: number;
}

export default function TravelImportModal({ 
  open, 
  onOpenChange, 
  onImportComplete 
}: TravelImportModalProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    
    if (droppedFiles.length === 0) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte nur PDF-Dateien hochladen.",
        variant: "destructive",
      });
      return;
    }

    setFiles(prev => [
      ...prev,
      ...droppedFiles.map(file => ({ file, status: "pending" as const }))
    ]);
  }, [toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(
      f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    
    setFiles(prev => [
      ...prev,
      ...selectedFiles.map(file => ({ file, status: "pending" as const }))
    ]);
    
    // Reset input
    e.target.value = "";
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const processFiles = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    let totalBookingsCreated = 0;

    for (let i = 0; i < files.length; i++) {
      const uploadedFile = files[i];
      if (uploadedFile.status !== "pending") continue;

      try {
        // Update status to uploading
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: "uploading" } : f
        ));

        // 1. Create a travel_emails entry for manual upload
        const { data: emailData, error: emailError } = await supabase
          .from("travel_emails")
          .insert({
            from_address: "manual_upload@local",
            subject: `PDF Import: ${uploadedFile.file.name}`,
            body_text: `Manueller PDF-Upload: ${uploadedFile.file.name}`,
            status: "pending",
          })
          .select()
          .single();

        if (emailError) throw emailError;

        // 2. Upload PDF to Supabase Storage
        const filePath = `${emailData.id}/${uploadedFile.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("travel-attachments")
          .upload(filePath, uploadedFile.file, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // 3. Create attachment record
        const { error: attachmentError } = await supabase
          .from("travel_attachments")
          .insert({
            email_id: emailData.id,
            file_name: uploadedFile.file.name,
            file_path: filePath,
            content_type: "application/pdf",
            file_size: uploadedFile.file.size,
          });

        if (attachmentError) throw attachmentError;

        // Update status to processing
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: "processing" } : f
        ));

        // 4. Trigger AI analysis
        const { data: analysisResult, error: analysisError } = await supabase.functions
          .invoke("analyze-travel-booking", {
            body: { email_id: emailData.id }
          });

        if (analysisError) throw analysisError;

        const bookingsCreated = analysisResult?.bookings_created || 0;
        totalBookingsCreated += bookingsCreated;

        // Update status to success
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: "success", bookingsCreated } : f
        ));

      } catch (error: any) {
        console.error("Error processing file:", error);
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: "error", error: error.message } : f
        ));
      }
    }

    setIsProcessing(false);

    if (totalBookingsCreated > 0) {
      toast({
        title: "Import erfolgreich",
        description: `${totalBookingsCreated} Buchung(en) importiert.`,
      });
      onImportComplete();
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setFiles([]);
      onOpenChange(false);
    }
  };

  const pendingCount = files.filter(f => f.status === "pending").length;
  const successCount = files.filter(f => f.status === "success").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-[#1a1a1a] text-xl font-semibold">
            PDF-Tickets importieren
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              isDragging
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
            }`}
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              isDragging ? "bg-red-100" : "bg-gray-200"
            }`}>
              <Upload className={`w-7 h-7 ${isDragging ? "text-red-500" : "text-gray-500"}`} />
            </div>
            
            <p className="text-[#1a1a1a] font-medium mb-1">
              {isDragging ? "PDF hier ablegen" : "PDFs hierher ziehen"}
            </p>
            <p className="text-sm text-gray-500">
              oder klicken zum Auswählen
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((uploadedFile, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    uploadedFile.status === "success"
                      ? "bg-emerald-50 border-emerald-200"
                      : uploadedFile.status === "error"
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {/* Status Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    uploadedFile.status === "success"
                      ? "bg-emerald-100"
                      : uploadedFile.status === "error"
                      ? "bg-red-100"
                      : uploadedFile.status === "uploading" || uploadedFile.status === "processing"
                      ? "bg-blue-100"
                      : "bg-gray-100"
                  }`}>
                    {uploadedFile.status === "uploading" || uploadedFile.status === "processing" ? (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    ) : uploadedFile.status === "success" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : uploadedFile.status === "error" ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <FileText className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {uploadedFile.status === "pending" && "Bereit zum Hochladen"}
                      {uploadedFile.status === "uploading" && "Wird hochgeladen..."}
                      {uploadedFile.status === "processing" && "KI analysiert PDF..."}
                      {uploadedFile.status === "success" && `${uploadedFile.bookingsCreated || 0} Buchung(en) gefunden`}
                      {uploadedFile.status === "error" && (uploadedFile.error || "Fehler beim Verarbeiten")}
                    </p>
                  </div>

                  {/* Remove Button */}
                  {uploadedFile.status === "pending" && !isProcessing && (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">
              {pendingCount > 0 && `${pendingCount} Datei(en) bereit`}
              {successCount > 0 && pendingCount === 0 && `${successCount} erfolgreich importiert`}
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                className="rounded-full border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                {successCount > 0 && pendingCount === 0 ? "Fertig" : "Abbrechen"}
              </Button>
              
              {pendingCount > 0 && (
                <Button
                  onClick={processFiles}
                  disabled={isProcessing}
                  className="rounded-full bg-[#1a1a1a] text-white hover:bg-gray-800 gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verarbeite...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Importieren
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
