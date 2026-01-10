import { useState } from "react";
import { X, Download, ExternalLink, Loader2, QrCode, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string;
  ticketUrl?: string;
  bookingNumber?: string;
  attachmentId?: string;
  qrCodeData?: string;
  documentType?: string;
}

export default function QrCodeModal({ 
  isOpen, 
  onClose, 
  pdfUrl, 
  ticketUrl, 
  bookingNumber,
  attachmentId,
  qrCodeData: initialQrData,
  documentType
}: Props) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(initialQrData);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const openTicketUrl = () => {
    if (ticketUrl) {
      window.open(ticketUrl, '_blank');
    }
  };

  const extractQrCode = async () => {
    if (!attachmentId) {
      toast.error("Keine Attachment-ID verfügbar");
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);

    try {
      const { data, error } = await supabase.functions.invoke('extract-ticket-qr', {
        body: { attachment_id: attachmentId }
      });

      if (error) throw error;

      if (data?.qr_data) {
        setQrCodeData(data.qr_data);
        toast.success("QR-Code erfolgreich extrahiert!");
      } else if (data?.description) {
        setQrCodeData(data.description);
        toast.info("Dokument analysiert, kein QR-Code gefunden");
      } else {
        setExtractionError("Kein QR-Code im Dokument gefunden");
      }
    } catch (err: any) {
      console.error("QR extraction error:", err);
      setExtractionError(err.message || "Fehler bei der Extraktion");
      toast.error("Fehler bei der QR-Code-Extraktion");
    } finally {
      setIsExtracting(false);
    }
  };

  // Determine document label
  const getDocumentLabel = () => {
    if (documentType === 'seat_reservation') return 'Sitzplatzreservierung';
    if (documentType === 'ticket') return 'Ticket';
    return bookingNumber ? `Ticket ${bookingNumber}` : 'Ticket anzeigen';
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {getDocumentLabel()}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* QR Code Display Area */}
          <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 relative overflow-hidden">
            {qrCodeData ? (
              <div className="p-6 text-center space-y-4 w-full">
                {/* QR Code visualization placeholder - in production would render actual code */}
                <div className="w-32 h-32 mx-auto bg-gray-900 rounded-xl flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-white" />
                </div>
                <div className="bg-gray-100 rounded-xl p-4 max-h-32 overflow-y-auto">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Code-Daten</p>
                  <p className="text-sm font-mono text-gray-800 break-all">
                    {qrCodeData}
                  </p>
                </div>
              </div>
            ) : extractionError ? (
              <div className="text-center space-y-3 p-6">
                <AlertCircle className="w-12 h-12 mx-auto text-amber-500" />
                <p className="text-sm text-gray-600">{extractionError}</p>
                <Button
                  onClick={extractQrCode}
                  disabled={isExtracting || !attachmentId}
                  variant="outline"
                  size="sm"
                >
                  Erneut versuchen
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-3 p-6">
                <div className="w-20 h-20 mx-auto bg-gray-200 rounded-xl flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  QR-Code noch nicht extrahiert
                </p>
                <Button
                  onClick={extractQrCode}
                  disabled={isExtracting || !attachmentId}
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extrahiere...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      QR-Code extrahieren
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {/* Booking Number Display */}
          {bookingNumber && (
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Buchungscode</p>
              <p className="font-mono text-2xl font-bold text-gray-900 tracking-wider">
                {bookingNumber}
              </p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3">
            {pdfUrl && (
              <Button
                onClick={handleDownload}
                className="flex-1 h-12 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF öffnen
              </Button>
            )}
            {ticketUrl && (
              <Button
                onClick={openTicketUrl}
                variant="outline"
                className="flex-1 h-12 border-gray-200 rounded-xl"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Online-Ticket
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
