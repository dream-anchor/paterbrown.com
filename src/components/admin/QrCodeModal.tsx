import { X, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string;
  ticketUrl?: string;
  bookingNumber?: string;
}

export default function QrCodeModal({ isOpen, onClose, pdfUrl, ticketUrl, bookingNumber }: Props) {
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

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {bookingNumber ? `Ticket ${bookingNumber}` : 'Ticket anzeigen'}
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
          {/* QR Code Placeholder - In a real implementation, you'd render the actual QR code */}
          <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 mx-auto bg-gray-900 rounded-xl flex items-center justify-center">
                <svg className="w-12 h-12 text-white" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="10" y="10" width="20" height="20" />
                  <rect x="40" y="10" width="10" height="10" />
                  <rect x="60" y="10" width="10" height="10" />
                  <rect x="70" y="10" width="20" height="20" />
                  <rect x="10" y="40" width="10" height="10" />
                  <rect x="30" y="40" width="10" height="10" />
                  <rect x="50" y="40" width="10" height="10" />
                  <rect x="80" y="40" width="10" height="10" />
                  <rect x="10" y="60" width="10" height="10" />
                  <rect x="40" y="60" width="20" height="10" />
                  <rect x="70" y="60" width="10" height="10" />
                  <rect x="10" y="70" width="20" height="20" />
                  <rect x="40" y="70" width="10" height="10" />
                  <rect x="60" y="70" width="10" height="10" />
                  <rect x="70" y="70" width="20" height="20" />
                  <rect x="20" y="20" width="10" height="10" fill="white" />
                  <rect x="70" y="20" width="10" height="10" fill="white" />
                  <rect x="20" y="70" width="10" height="10" fill="white" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">
                QR-Code wird aus dem PDF geladen
              </p>
            </div>
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
                className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
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
