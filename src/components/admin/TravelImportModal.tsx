import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, FileText, Loader2, CheckCircle2, 
  AlertCircle, Trash2, Ticket, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TravelReviewDialog, { ReviewBookingData } from "./TravelReviewDialog";

interface TravelImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

// Accepted file types - PDFs and images
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ACCEPTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

function isAcceptedFile(file: File): boolean {
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(extension);
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || 
    [".jpg", ".jpeg", ".png", ".webp"].some(ext => file.name.toLowerCase().endsWith(ext));
}

interface UploadedFile {
  file: File;
  status: "pending" | "uploading" | "processing" | "success" | "error" | "review";
  error?: string;
  bookingsCreated?: number;
  reviewData?: ReviewBookingData; // Data for review modal
}

export default function TravelImportModal({ 
  open, 
  onOpenChange, 
  onImportComplete 
}: TravelImportModalProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState<number | null>(null);
  const { toast } = useToast();

  // Confidence threshold for auto-accept
  const CONFIDENCE_THRESHOLD = 0.85;

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
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(isAcceptedFile);
    
    if (droppedFiles.length === 0) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte PDF oder Bilder (JPG, PNG, WebP) hochladen.",
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
    const selectedFiles = Array.from(e.target.files || []).filter(isAcceptedFile);
    
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

        const isImage = isImageFile(uploadedFile.file);
        const contentType = uploadedFile.file.type || (isImage ? "image/jpeg" : "application/pdf");

        // 1. Create a travel_emails entry for manual upload
        console.log("[TravelImport] Step 1: Creating email entry for", uploadedFile.file.name);
        const { data: emailData, error: emailError } = await supabase
          .from("travel_emails")
          .insert({
            from_address: "manual_upload@local",
            subject: `${isImage ? "Image" : "PDF"} Import: ${uploadedFile.file.name}`,
            body_text: `Manueller ${isImage ? "Bild" : "PDF"}-Upload: ${uploadedFile.file.name}`,
            status: "pending",
          })
          .select()
          .single();

        if (emailError) {
          console.error("[TravelImport] Email insert failed:", emailError);
          throw emailError;
        }
        console.log("[TravelImport] Step 1 SUCCESS: Email created with ID", emailData.id);

        // 2. Upload file to Supabase Storage
        const filePath = `${emailData.id}/${uploadedFile.file.name}`;
        console.log("[TravelImport] Step 2: Uploading file to storage:", filePath);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("travel-attachments")
          .upload(filePath, uploadedFile.file, {
            contentType: contentType,
            upsert: true,
          });

        if (uploadError) {
          console.error("[TravelImport] Storage upload failed:", uploadError);
          throw uploadError;
        }
        console.log("[TravelImport] Step 2 SUCCESS: File uploaded to storage", uploadData);

        // 3. Create attachment record
        console.log("[TravelImport] Step 3: Creating attachment record");
        const { data: attachData, error: attachmentError } = await supabase
          .from("travel_attachments")
          .insert({
            email_id: emailData.id,
            file_name: uploadedFile.file.name,
            file_path: filePath,
            content_type: contentType,
            file_size: uploadedFile.file.size,
          })
          .select()
          .single();

        if (attachmentError) {
          console.error("[TravelImport] Attachment insert failed:", attachmentError);
          throw attachmentError;
        }
        console.log("[TravelImport] Step 3 SUCCESS: Attachment record created", attachData);

        // Update status to processing
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: "processing" } : f
        ));

        // 4. Trigger AI analysis
        console.log("[TravelImport] Step 4: Triggering AI analysis for email", emailData.id);
        const { data: analysisResult, error: analysisError } = await supabase.functions
          .invoke("analyze-travel-booking", {
            body: { email_id: emailData.id }
          });

        if (analysisError) {
          console.error("[TravelImport] AI analysis failed:", analysisError);
          throw analysisError;
        }
        console.log("[TravelImport] Step 4 SUCCESS: AI analysis complete", analysisResult);

        // Check if we need human review
        const bookings = analysisResult?.bookings || [];
        const bookingsCreated = analysisResult?.bookings_created || 0;

        // Find bookings that need review (low confidence or needs_review flag)
        const bookingsNeedingReview = bookings.filter((b: any) => 
          b.confidence < CONFIDENCE_THRESHOLD || b.needs_review === true
        );

        if (bookingsNeedingReview.length > 0) {
          // Set review status and store the first booking for review
          const reviewBooking = bookingsNeedingReview[0];
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { 
              ...f, 
              status: "review",
              reviewData: {
                booking_type: reviewBooking.booking_type || "other",
                booking_number: reviewBooking.booking_number,
                provider: reviewBooking.provider,
                traveler_name: reviewBooking.traveler_name,
                traveler_names: reviewBooking.traveler_names,
                start_datetime: reviewBooking.start_datetime,
                end_datetime: reviewBooking.end_datetime,
                origin_city: reviewBooking.origin_city,
                destination_city: reviewBooking.destination_city || "Unbekannt",
                venue_name: reviewBooking.venue_name,
                venue_address: reviewBooking.venue_address,
                details: reviewBooking.details,
                confidence: reviewBooking.confidence || 0,
                needs_review: true,
                source_email_id: emailData.id,
              }
            } : f
          ));
          
          // Open review dialog
          setCurrentReviewIndex(i);
          setReviewDialogOpen(true);
        } else {
          // High confidence - auto-saved by edge function
          totalBookingsCreated += bookingsCreated;
          
          // Update status to success
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: "success", bookingsCreated } : f
          ));

          // Show success toast
          const successMessage = isImage 
            ? "Screenshot erfolgreich analysiert" 
            : `${bookingsCreated} Buchung(en) importiert`;
          
          toast({
            title: "Import erfolgreich",
            description: successMessage,
          });
        }

      } catch (error: any) {
        console.error("[TravelImport] Error processing file:", uploadedFile.file.name, error);
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: "error", error: error.message } : f
        ));
      }
    }

    setIsProcessing(false);

    if (totalBookingsCreated > 0) {
      onImportComplete();
    }
  };

  // Handle review confirmation
  const handleReviewConfirm = () => {
    if (currentReviewIndex !== null) {
      setFiles(prev => prev.map((f, idx) => 
        idx === currentReviewIndex ? { ...f, status: "success", bookingsCreated: 1 } : f
      ));
    }
    setReviewDialogOpen(false);
    setCurrentReviewIndex(null);
    onImportComplete();
  };

  // Handle review skip
  const handleReviewSkip = () => {
    if (currentReviewIndex !== null) {
      setFiles(prev => prev.map((f, idx) => 
        idx === currentReviewIndex ? { ...f, status: "error", error: "Übersprungen" } : f
      ));
    }
    setReviewDialogOpen(false);
    setCurrentReviewIndex(null);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setFiles([]);
      onOpenChange(false);
    }
  };

  const pendingCount = files.filter(f => f.status === "pending").length;
  const successCount = files.filter(f => f.status === "success").length;

  // Get current review data
  const currentReviewData = currentReviewIndex !== null 
    ? files[currentReviewIndex]?.reviewData 
    : null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-xl font-semibold flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Ticket importieren
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
                  ? "border-amber-400 bg-amber-50"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
              }`}
            >
              <input
                type="file"
                accept=".pdf,application/pdf,image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />
              
              <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                isDragging ? "bg-amber-100" : "bg-gray-200"
              }`}>
                <Upload className={`w-7 h-7 ${isDragging ? "text-amber-600" : "text-gray-500"}`} />
              </div>
              
              <p className="text-gray-900 font-medium mb-1">
                {isDragging ? "Datei hier ablegen" : "PDFs oder Bilder hierher ziehen"}
              </p>
              <p className="text-sm text-gray-500">
                PDF, JPG, PNG, WebP • oder klicken zum Auswählen
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((uploadedFile, index) => {
                  const isImage = isImageFile(uploadedFile.file);
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        uploadedFile.status === "success"
                          ? "bg-emerald-50 border-emerald-200"
                          : uploadedFile.status === "error"
                          ? "bg-red-50 border-red-200"
                          : uploadedFile.status === "review"
                          ? "bg-amber-50 border-amber-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      {/* Status Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        uploadedFile.status === "success"
                          ? "bg-emerald-100"
                          : uploadedFile.status === "error"
                          ? "bg-red-100"
                          : uploadedFile.status === "review"
                          ? "bg-amber-100"
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
                        ) : uploadedFile.status === "review" ? (
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                        ) : isImage ? (
                          <ImageIcon className="w-5 h-5 text-gray-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-gray-500" />
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {uploadedFile.status === "pending" && "Bereit zum Hochladen"}
                          {uploadedFile.status === "uploading" && "Wird hochgeladen..."}
                          {uploadedFile.status === "processing" && (isImage ? "Gemini analysiert Bild..." : "Gemini analysiert PDF...")}
                          {uploadedFile.status === "review" && "Überprüfung erforderlich..."}
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
                  );
                })}
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
                    className="rounded-full bg-gray-900 text-white hover:bg-gray-800 gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verarbeite...
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4" />
                        Ticket importieren
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      {currentReviewData && (
        <TravelReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          bookingData={currentReviewData}
          onConfirm={handleReviewConfirm}
          onSkip={handleReviewSkip}
        />
      )}
    </>
  );
}
