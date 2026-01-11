import { useState, useEffect } from "react";
import { format, parseISO, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import { de } from "date-fns/locale";
import {
  Hotel, Train, Plane, Bus, Car, Package,
  MapPin, Clock, Copy, ExternalLink, ChevronRight,
  QrCode, FileText, Navigation, Calendar, Sparkles,
  Coffee, Wifi, Users, Check, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

interface TravelBooking {
  id: string;
  trip_id: string | null;
  booking_type: "hotel" | "train" | "flight" | "bus" | "rental_car" | "other";
  booking_number: string | null;
  provider: string | null;
  traveler_name: string | null;
  traveler_names: string[] | null;
  start_datetime: string;
  end_datetime: string | null;
  origin_city: string | null;
  destination_city: string;
  venue_name: string | null;
  venue_address: string | null;
  details: Record<string, any>;
  status: "confirmed" | "changed" | "cancelled" | "pending" | "proposal";
  source_email_id: string | null;
  ai_confidence: number | null;
  created_at: string;
  needs_review?: boolean;
  data_quality_score?: number;
  qr_code_url?: string | null;
}

interface Props {
  booking: TravelBooking;
  isSelected?: boolean;
  onSelect: (booking: TravelBooking) => void;
  onViewTicket?: () => void;
  onShowQrCode?: () => void;
  showTimeBadge?: boolean; // Ob das "Heute"/"Morgen" Badge angezeigt werden soll
}

const bookingTypeConfig = {
  hotel: { icon: Hotel, label: "Hotel", color: "bg-amber-500" },
  train: { icon: Train, label: "Zug", color: "bg-blue-500" },
  flight: { icon: Plane, label: "Flug", color: "bg-purple-500" },
  bus: { icon: Bus, label: "Bus", color: "bg-green-500" },
  rental_car: { icon: Car, label: "Mietwagen", color: "bg-orange-500" },
  other: { icon: Package, label: "Sonstiges", color: "bg-gray-500" },
};

const statusConfig = {
  confirmed: { label: "Bestätigt", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  changed: { label: "Geändert", className: "bg-amber-50 text-amber-700 border-amber-200" },
  cancelled: { label: "Storniert", className: "bg-red-50 text-red-700 border-red-200" },
  pending: { label: "Ausstehend", className: "bg-gray-50 text-gray-600 border-gray-200" },
  proposal: { label: "Angebot", className: "bg-purple-50 text-purple-700 border-purple-200 border-dashed" },
};

// Check if datetime has real time component
const hasRealTime = (datetime: string): boolean => {
  const parsed = parseISO(datetime);
  const hours = parsed.getUTCHours();
  const minutes = parsed.getUTCMinutes();
  return !(hours === 0 && minutes === 0);
};

// Datenqualitäts-Prüfung
interface DataQualityIssue {
  field: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

const checkDataQuality = (booking: TravelBooking): DataQualityIssue[] => {
  const issues: DataQualityIssue[] = [];
  
  // Prüfung auf "Unknown" Werte
  if (!booking.destination_city || booking.destination_city.toLowerCase() === 'unknown') {
    issues.push({ field: 'destination_city', message: 'Ziel fehlt', severity: 'high' });
  }
  if (!booking.origin_city || booking.origin_city.toLowerCase() === 'unknown') {
    if (['train', 'flight', 'bus'].includes(booking.booking_type)) {
      issues.push({ field: 'origin_city', message: 'Abfahrtsort fehlt', severity: 'high' });
    }
  }
  
  // Prüfung auf Placeholder-Buchungsnummern
  const placeholderNumbers = ['reserviert', 'ohne nr.', 'ohne nr', 'n/a', '-', ''];
  if (booking.booking_number && placeholderNumbers.includes(booking.booking_number.toLowerCase())) {
    issues.push({ field: 'booking_number', message: 'Buchungsnummer fehlt', severity: 'medium' });
  }
  
  // Prüfung auf niedrige KI-Confidence
  if (booking.ai_confidence && booking.ai_confidence < 0.6) {
    issues.push({ field: 'ai_confidence', message: `KI nur ${Math.round(booking.ai_confidence * 100)}% sicher`, severity: 'low' });
  }
  
  return issues;
};

export default function TravelCard({ booking, isSelected, onSelect, onViewTicket, onShowQrCode, showTimeBadge = false }: Props) {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  // Load QR code URL from attachments (not from booking.qr_code_url)
  useEffect(() => {
    const loadQrCode = async () => {
      // Only load for train bookings
      if (booking.booking_type !== 'train') {
        setQrCodeUrl(null);
        return;
      }
      
      try {
        const { data: attachments } = await supabase
          .from('travel_attachments')
          .select('qr_code_image_path')
          .eq('booking_id', booking.id)
          .not('qr_code_image_path', 'is', null)
          .limit(1);
        
        if (attachments && attachments.length > 0 && attachments[0].qr_code_image_path) {
          const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/qr-codes/${attachments[0].qr_code_image_path}`;
          setQrCodeUrl(url);
        } else {
          setQrCodeUrl(null);
        }
      } catch (err) {
        console.error('Error loading QR code:', err);
        setQrCodeUrl(null);
      }
    };
    
    loadQrCode();
  }, [booking.id, booking.booking_type]);
  const typeConfig = bookingTypeConfig[booking.booking_type];
  const TypeIcon = typeConfig.icon;
  const status = statusConfig[booking.status];
  
  const getBookingNumber = () => {
    if (booking.booking_number) return booking.booking_number;
    if (booking.details?.order_number) return booking.details.order_number;
    if (booking.details?.confirmation_number) return booking.details.confirmation_number;
    return null;
  };
  
  const bookingNumber = getBookingNumber();
  
  // Datenqualitäts-Issues prüfen
  const qualityIssues = checkDataQuality(booking);
  const hasHighSeverityIssues = qualityIssues.some(i => i.severity === 'high');
  
  // Smart time display - nur wenn showTimeBadge true ist
  const getTimeLabel = () => {
    if (!showTimeBadge) return null;
    const date = parseISO(booking.start_datetime);
    if (isPast(date) && !isToday(date)) return { label: "Vergangen", urgent: false };
    if (isToday(date)) return { label: "Heute", urgent: true };
    if (isTomorrow(date)) return { label: "Morgen", urgent: true };
    return { 
      label: formatDistanceToNow(date, { locale: de, addSuffix: true }), 
      urgent: false 
    };
  };
  
  const timeLabel = getTimeLabel();
  
  const formatTimeDisplay = (datetime: string): string => {
    if (!hasRealTime(datetime)) return "";
    return format(parseISO(datetime), "HH:mm", { locale: de });
  };
  
  const copyBookingNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookingNumber) {
      navigator.clipboard.writeText(bookingNumber);
      setCopied(true);
      toast.success("Buchungsnummer kopiert");
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const openMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const address = [
      booking.venue_name,
      booking.venue_address,
      booking.destination_city
    ].filter(Boolean).join(', ');
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };
  
  // Check for QR code / digital ticket
  const hasQrCode = booking.details?.qr_code_present || booking.details?.mobile_ticket;
  const hasTicketUrl = booking.details?.ticket_url;
  
  // Quick info pills
  const getQuickInfo = () => {
    const pills: { icon: React.ElementType; label: string }[] = [];
    
    if (booking.booking_type === 'train') {
      const trainNumber = booking.details?.train_number || booking.details?.ice_number;
      if (trainNumber) pills.push({ icon: Train, label: trainNumber });
      const seat = booking.details?.seat || booking.details?.sitzplatz;
      const wagon = booking.details?.wagon || booking.details?.wagen;
      if (wagon && seat) pills.push({ icon: Users, label: `Wg ${wagon} · Pl ${seat}` });
      else if (seat) pills.push({ icon: Users, label: `Platz ${seat}` });
    }
    
    if (booking.booking_type === 'flight') {
      const flightNumber = booking.details?.flight_number;
      if (flightNumber) pills.push({ icon: Plane, label: flightNumber });
    }
    
    if (booking.booking_type === 'hotel') {
      if (booking.details?.breakfast_included) pills.push({ icon: Coffee, label: "Frühstück" });
      if (booking.details?.wifi_included) pills.push({ icon: Wifi, label: "WLAN" });
    }
    
    return pills;
  };
  
  const quickInfo = getQuickInfo();
  
  // Format price
  const getPrice = () => {
    const amount = booking.details?.total_amount || booking.details?.price;
    const currency = booking.details?.currency || "EUR";
    if (!amount) return null;
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount);
  };
  
  const price = getPrice();

  return (
    <TooltipProvider>
      <div
        onClick={() => onSelect(booking)}
        className={cn(
          "group relative bg-white rounded-2xl border transition-all duration-200 cursor-pointer",
          "hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5",
          isSelected 
            ? "border-gray-900 shadow-lg ring-1 ring-gray-900" 
            : hasHighSeverityIssues 
              ? "border-amber-300 shadow-sm" 
              : "border-gray-200 shadow-sm"
        )}
      >
        {/* Datenqualitäts-Warnung - Top Left Corner */}
        {qualityIssues.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center shadow-sm cursor-help",
                hasHighSeverityIssues 
                  ? "bg-amber-500 text-white" 
                  : "bg-gray-200 text-gray-600"
              )}>
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="text-xs space-y-1">
                <p className="font-medium">Datenqualität prüfen:</p>
                {qualityIssues.map((issue, i) => (
                  <p key={i} className="text-muted-foreground">• {issue.message}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Time Badge - Top Right Corner - nur wenn explizit aktiviert und kein QR */}
        {timeLabel && timeLabel.urgent && !qrCodeUrl && (
          <div className={cn(
            "absolute -top-2 -right-2 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm",
            isToday(parseISO(booking.start_datetime)) 
              ? "bg-gray-900 text-white" 
              : "bg-gray-100 text-gray-700 border border-gray-200"
          )}>
            {timeLabel.label}
          </div>
        )}

        {/* QR Code Thumbnail - Top Right Corner - aus Attachment geladen */}
        {qrCodeUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowQrCode?.();
            }}
            className={cn(
              "absolute -top-3 -right-3 w-14 h-14 rounded-xl shadow-lg border-2 border-white",
              "bg-white overflow-hidden flex items-center justify-center",
              "hover:scale-110 transition-transform cursor-pointer",
              "ring-2 ring-gray-200 hover:ring-gray-400"
            )}
            title="QR-Code anzeigen"
          >
            <img 
              src={qrCodeUrl} 
              alt="QR-Code" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                // Fallback to icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement?.classList.add('bg-gray-100');
              }}
            />
          </button>
        )}
      
      {/* Main Content */}
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
            "bg-gray-100 group-hover:bg-gray-200 transition-colors"
          )}>
            <TypeIcon className="w-5 h-5 text-gray-600" />
          </div>
          
          {/* Title & Subtitle */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {booking.venue_name || booking.destination_city}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {booking.provider || typeConfig.label}
            </p>
          </div>
          
          {/* Status Badge */}
          {booking.status !== 'confirmed' && (
            <span className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full border",
              status.className
            )}>
              {status.label}
            </span>
          )}
        </div>
        
        {/* Route or Date Display */}
        {['train', 'flight', 'bus'].includes(booking.booking_type) ? (
          /* Transport Route */
          <div className="flex items-center gap-2 mb-3 pl-14">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900">{booking.origin_city || '–'}</span>
              <span className="text-gray-400">→</span>
              <span className="font-medium text-gray-900">{booking.destination_city}</span>
            </div>
            {hasRealTime(booking.start_datetime) && (
              <span className="text-sm text-gray-500 ml-auto">
                {formatTimeDisplay(booking.start_datetime)} Uhr
              </span>
            )}
          </div>
        ) : (
          /* Hotel/Other - Date Display */
          <div className="flex items-center gap-2 mb-3 pl-14 text-sm text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>
              {format(parseISO(booking.start_datetime), "d. MMM", { locale: de })}
              {booking.end_datetime && (
                <> – {format(parseISO(booking.end_datetime), "d. MMM", { locale: de })}</>
              )}
            </span>
            {booking.venue_address && (
              <>
                <span className="text-gray-300">·</span>
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate max-w-[150px]">{booking.venue_address}</span>
              </>
            )}
          </div>
        )}
        
        {/* Quick Info Pills */}
        {quickInfo.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3 pl-14">
            {quickInfo.map((pill, i) => (
              <span 
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs"
              >
                <pill.icon className="w-3 h-3" />
                {pill.label}
              </span>
            ))}
            {hasQrCode && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-900 text-white rounded-md text-xs">
                <QrCode className="w-3 h-3" />
                Digital
              </span>
            )}
          </div>
        )}
        
        {/* Bottom Row - Booking Number & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {/* Booking Number */}
          {bookingNumber ? (
            <button
              onClick={copyBookingNumber}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="font-mono">{bookingNumber}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          ) : (
            <span className="text-xs text-gray-400">Keine Buchungsnr.</span>
          )}
          
          {/* Price & Actions */}
          <div className="flex items-center gap-2">
            {price && (
              <span className="text-sm font-medium text-gray-900">{price}</span>
            )}
            
            {/* Quick Action: Maps */}
            {(booking.venue_address || booking.destination_city) && (
              <button
                onClick={openMaps}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                title="In Maps öffnen"
              >
                <Navigation className="w-4 h-4" />
              </button>
            )}
            
            {/* Arrow indicator */}
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}
