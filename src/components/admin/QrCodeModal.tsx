import { useState, useEffect, useRef } from "react";
import { X, Download, ExternalLink, Loader2, QrCode, AlertCircle, ZoomIn, ZoomOut, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string;
  ticketUrl?: string;
  bookingNumber?: string;
  attachmentId?: string;
  bookingId?: string;
  qrCodeData?: string;
  qrCodeImageUrl?: string;
  documentType?: string;
  onQrExtracted?: (qrCodeUrl: string) => void;
}

interface QrMetadata {
  sha256?: string;
  method?: string;
  page?: number;
  bbox?: { x: number; y: number; w: number; h: number };
  symbology?: string;
  extracted_at?: string;
}

export default function QrCodeModal({ 
  isOpen, 
  onClose, 
  pdfUrl, 
  ticketUrl, 
  bookingNumber,
  attachmentId,
  bookingId,
  qrCodeData: initialQrData,
  qrCodeImageUrl,
  documentType,
  onQrExtracted
}: Props) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(initialQrData);
  const [qrImageUrl, setQrImageUrl] = useState(qrCodeImageUrl);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [metadata, setMetadata] = useState<QrMetadata | null>(null);
  
  // Zoom and pan state for barcode area
  const [zoomLevel, setZoomLevel] = useState(2.5); // Start zoomed into barcode area
  const [panOffset, setPanOffset] = useState({ x: -55, y: 0 }); // Pan to top-right where barcode is
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse metadata from qrCodeData if it's JSON
  useEffect(() => {
    if (initialQrData) {
      try {
        const parsed = JSON.parse(initialQrData);
        if (parsed.sha256 || parsed.method) {
          setMetadata(parsed);
        }
      } catch {
        // Not JSON, just string data
      }
    }
  }, [initialQrData]);

  // Reset zoom when modal opens
  useEffect(() => {
    if (isOpen && qrImageUrl) {
      // Auto-zoom to barcode area (top-right of DB ticket)
      setZoomLevel(2.5);
      setPanOffset({ x: -55, y: 0 }); // Shift view to right side
    }
  }, [isOpen, qrImageUrl]);

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
        body: { 
          attachment_id: attachmentId,
          booking_id: bookingId
        }
      });

      if (error) throw error;

      if (data?.qr_code_url) {
        setQrImageUrl(data.qr_code_url);
        if (data.sha256 || data.method) {
          setMetadata({
            sha256: data.sha256,
            method: data.method,
            bbox: data.bbox,
            symbology: data.symbology
          });
        }
        onQrExtracted?.(data.qr_code_url);
        toast.success("QR-Code erfolgreich extrahiert!");
      } else if (data?.qr_data) {
        setQrCodeData(data.qr_data);
        toast.info("Dokument analysiert");
      } else if (data?.description) {
        setQrCodeData(data.description);
        toast.info("Dokument analysiert, kein QR-Code gefunden");
      } else {
        setExtractionError("Kein QR-Code im Dokument gefunden");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Fehler bei der Extraktion";
      console.error("QR extraction error:", err);
      setExtractionError(errorMessage);
      toast.error("Fehler bei der QR-Code-Extraktion");
    } finally {
      setIsExtracting(false);
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };
  const handleFocusBarcode = () => {
    // Focus on top-right area where DB Aztec code typically is
    setZoomLevel(2.5);
    setPanOffset({ x: -55, y: 0 });
  };

  // Drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      // Limit pan range based on zoom level
      const maxPan = (zoomLevel - 1) * 50;
      setPanOffset({
        x: Math.max(-maxPan, Math.min(maxPan, newX)),
        y: Math.max(-maxPan, Math.min(maxPan, newY))
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX - panOffset.x, 
        y: e.touches[0].clientY - panOffset.y 
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      const maxPan = (zoomLevel - 1) * 50;
      setPanOffset({
        x: Math.max(-maxPan, Math.min(maxPan, newX)),
        y: Math.max(-maxPan, Math.min(maxPan, newY))
      });
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Determine document label
  const getDocumentLabel = () => {
    if (documentType === 'seat_reservation') return 'Sitzplatzreservierung';
    if (documentType === 'ticket') return 'Ticket';
    return bookingNumber ? `Ticket ${bookingNumber}` : 'Ticket anzeigen';
  };

  // If we have a QR image and it's zoomed fullscreen
  if (isZoomed && qrImageUrl) {
    return (
      <div 
        className="fixed inset-0 z-[100] bg-gray-100 flex items-center justify-center p-4"
        onClick={() => setIsZoomed(false)}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
        <img 
          src={qrImageUrl} 
          alt="QR-Code" 
          className="max-w-full max-h-full object-contain"
          style={{ imageRendering: 'crisp-edges' }}
        />
        <p className="absolute bottom-8 text-white/60 text-sm">
          Tippen zum Schließen
        </p>
      </div>
    );
  }

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
          <div className={cn(
            "aspect-square bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 relative overflow-hidden",
            qrImageUrl && "border-solid border-gray-300"
          )}>
            {qrImageUrl ? (
              /* Zoomable QR Code Image */
              <div 
                ref={containerRef}
                className="w-full h-full overflow-hidden relative"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ cursor: isDragging ? 'grabbing' : (zoomLevel > 1 ? 'grab' : 'default') }}
              >
                <img 
                  src={qrImageUrl} 
                  alt="QR-Code für Zugkontrolle"
                  className="w-full h-full object-contain transition-transform duration-200"
                  style={{ 
                    transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}%, ${panOffset.y / zoomLevel}%)`,
                    imageRendering: 'crisp-edges',
                    transformOrigin: 'center center'
                  }}
                  draggable={false}
                />
                
                {/* Zoom Controls Overlay */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-1.5">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                    className="p-1.5 rounded-full hover:bg-white/20 disabled:opacity-30 transition-colors"
                    title="Herauszoomen"
                  >
                    <ZoomOut className="w-4 h-4 text-white" />
                  </button>
                  <span className="text-white text-xs font-medium min-w-[3rem] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 5}
                    className="p-1.5 rounded-full hover:bg-white/20 disabled:opacity-30 transition-colors"
                    title="Hineinzoomen"
                  >
                    <ZoomIn className="w-4 h-4 text-white" />
                  </button>
                  <div className="w-px h-4 bg-white/30 mx-1" />
                  <button
                    onClick={handleResetView}
                    className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                    title="Ansicht zurücksetzen"
                  >
                    <Move className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={handleFocusBarcode}
                    className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                    title="Auf Barcode fokussieren"
                  >
                    <QrCode className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Fullscreen button */}
                <button
                  onClick={() => setIsZoomed(true)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  title="Vollbild"
                >
                  <ZoomIn className="w-4 h-4 text-white" />
                </button>

                {/* Method badge */}
                {metadata?.method && (
                  <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {metadata.method === 'embedded_object' ? '1:1 Original' : 'HD Render'}
                  </div>
                )}
              </div>
            ) : qrCodeData && !metadata ? (
              <div className="p-6 text-center space-y-4 w-full">
                {/* QR Code visualization placeholder */}
                <div className="w-32 h-32 mx-auto bg-gray-200 rounded-xl flex items-center justify-center border border-gray-300">
                  <QrCode className="w-20 h-20 text-gray-600" />
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
          
          {/* Metadata Display */}
          {metadata?.sha256 && (
            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">SHA-256</span>
                <span className="font-mono text-gray-700 truncate max-w-[200px]" title={metadata.sha256}>
                  {metadata.sha256.substring(0, 16)}...
                </span>
              </div>
              {metadata.symbology && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Format</span>
                  <span className="text-gray-700 capitalize">{metadata.symbology}</span>
                </div>
              )}
            </div>
          )}
          
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
