import { useState, useEffect } from "react";
import { format, parseISO, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import { de } from "date-fns/locale";
import {
  Hotel, Train, Plane, Bus, Car, Package,
  MapPin, Clock, Copy, ExternalLink, ChevronRight, ChevronDown,
  QrCode, FileText, Navigation, Calendar, Sparkles,
  Coffee, Wifi, Users, Check, AlertTriangle, Crown, Moon,
  X, Info, Mail
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
  showTimeBadge?: boolean;
}

// Icon-based config with gradient backgrounds
const bookingTypeConfig = {
  hotel: { 
    icon: Hotel, 
    label: "Hotel", 
    gradient: "from-blue-500 to-blue-600",
    lightGradient: "from-blue-50 to-blue-100",
    iconColor: "text-white",
    glowClass: "icon-glow-hotel", 
    shadowClass: "shadow-hotel", 
    dotColor: "bg-amber-500",
    accentColor: "blue"
  },
  train: { 
    icon: Train, 
    label: "Zug", 
    gradient: "from-emerald-500 to-emerald-600",
    lightGradient: "from-emerald-50 to-emerald-100",
    iconColor: "text-white",
    glowClass: "icon-glow-train", 
    shadowClass: "shadow-train", 
    dotColor: "bg-blue-500",
    accentColor: "emerald"
  },
  flight: { 
    icon: Plane, 
    label: "Flug", 
    gradient: "from-violet-500 to-violet-600",
    lightGradient: "from-violet-50 to-violet-100",
    iconColor: "text-white",
    glowClass: "icon-glow-flight", 
    shadowClass: "shadow-flight", 
    dotColor: "bg-violet-500",
    accentColor: "violet"
  },
  bus: { 
    icon: Bus, 
    label: "Bus", 
    gradient: "from-orange-500 to-orange-600",
    lightGradient: "from-orange-50 to-orange-100",
    iconColor: "text-white",
    glowClass: "icon-glow-bus", 
    shadowClass: "shadow-bus", 
    dotColor: "bg-emerald-500",
    accentColor: "orange"
  },
  rental_car: { 
    icon: Car, 
    label: "Mietwagen", 
    gradient: "from-amber-500 to-amber-600",
    lightGradient: "from-amber-50 to-amber-100",
    iconColor: "text-white",
    glowClass: "icon-glow-car", 
    shadowClass: "shadow-car", 
    dotColor: "bg-orange-500",
    accentColor: "amber"
  },
  other: { 
    icon: Package, 
    label: "Sonstiges", 
    gradient: "from-gray-400 to-gray-500",
    lightGradient: "from-gray-50 to-gray-100",
    iconColor: "text-white",
    glowClass: "bg-gray-100", 
    shadowClass: "", 
    dotColor: "bg-gray-500",
    accentColor: "gray"
  },
};

// Status with icons
const statusConfig = {
  confirmed: { label: "Bestätigt", icon: Check, dotColor: "bg-emerald-500", bgColor: "bg-emerald-50", textColor: "text-emerald-700", borderColor: "border-emerald-200" },
  changed: { label: "Geändert", icon: Info, dotColor: "bg-blue-500", bgColor: "bg-blue-50", textColor: "text-blue-700", borderColor: "border-blue-200" },
  cancelled: { label: "Storniert", icon: X, dotColor: "bg-red-500", bgColor: "bg-red-50", textColor: "text-red-700", borderColor: "border-red-200" },
  pending: { label: "Ausstehend", icon: Clock, dotColor: "bg-amber-500", bgColor: "bg-amber-50", textColor: "text-amber-700", borderColor: "border-amber-200" },
  proposal: { label: "Angebot", icon: Sparkles, dotColor: "bg-violet-500", bgColor: "bg-violet-50", textColor: "text-violet-700", borderColor: "border-violet-200" },
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
  
  if (!booking.destination_city || booking.destination_city.toLowerCase() === 'unknown') {
    issues.push({ field: 'destination_city', message: 'Ziel fehlt', severity: 'high' });
  }
  if (!booking.origin_city || booking.origin_city.toLowerCase() === 'unknown') {
    if (['train', 'flight', 'bus'].includes(booking.booking_type)) {
      issues.push({ field: 'origin_city', message: 'Abfahrtsort fehlt', severity: 'high' });
    }
  }
  
  const placeholderNumbers = ['reserviert', 'ohne nr.', 'ohne nr', 'n/a', '-', ''];
  if (booking.booking_number && placeholderNumbers.includes(booking.booking_number.toLowerCase())) {
    issues.push({ field: 'booking_number', message: 'Buchungsnummer fehlt', severity: 'medium' });
  }
  
  if (booking.ai_confidence && booking.ai_confidence < 0.6) {
    issues.push({ field: 'ai_confidence', message: `KI nur ${Math.round(booking.ai_confidence * 100)}% sicher`, severity: 'low' });
  }
  
  return issues;
};

// Calculate duration between two datetimes
const calculateDuration = (start: string, end: string | null): string | null => {
  if (!end) return null;
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (diffMins < 60) return `${diffMins} Min`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export default function TravelCard({ booking, isSelected, onSelect, onViewTicket, onShowQrCode, showTimeBadge = false }: Props) {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    const loadQrCode = async () => {
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
  const StatusIcon = status.icon;
  
  const getBookingNumber = () => {
    if (booking.booking_number) return booking.booking_number;
    if (booking.details?.order_number) return booking.details.order_number;
    if (booking.details?.confirmation_number) return booking.details.confirmation_number;
    return null;
  };
  
  const bookingNumber = getBookingNumber();
  const qualityIssues = checkDataQuality(booking);
  const hasHighSeverityIssues = qualityIssues.some(i => i.severity === 'high');
  const duration = ['train', 'flight', 'bus'].includes(booking.booking_type) 
    ? calculateDuration(booking.start_datetime, booking.end_datetime) 
    : null;
  
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
  
  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  const hasQrCode = booking.details?.qr_code_present || booking.details?.mobile_ticket;
  
  // Get travelers display
  const getTravelers = () => {
    if (booking.traveler_names && booking.traveler_names.length > 0) {
      return booking.traveler_names;
    }
    if (booking.traveler_name) {
      return [booking.traveler_name];
    }
    return [];
  };
  
  const travelers = getTravelers();
  
  const getQuickInfo = () => {
    const pills: { icon: React.ElementType; label: string; colorClass: string }[] = [];
    
    if (booking.booking_type === 'train') {
      const trainNumber = booking.details?.train_number || booking.details?.ice_number;
      if (trainNumber) pills.push({ icon: Train, label: trainNumber, colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200" });
      const seat = booking.details?.seat || booking.details?.sitzplatz;
      const wagon = booking.details?.wagon || booking.details?.wagen;
      if (wagon && seat) pills.push({ icon: Users, label: `Wg ${wagon} · Pl ${seat}`, colorClass: "bg-violet-50 text-violet-700 border-violet-200" });
      else if (seat) pills.push({ icon: Users, label: `Platz ${seat}`, colorClass: "bg-violet-50 text-violet-700 border-violet-200" });
      const trainClass = booking.details?.class || booking.details?.klasse;
      if (trainClass === 1 || trainClass === '1') pills.push({ icon: Crown, label: "1. Klasse", colorClass: "bg-amber-50 text-amber-700 border-amber-200" });
    }
    
    if (booking.booking_type === 'flight') {
      const flightNumber = booking.details?.flight_number;
      if (flightNumber) pills.push({ icon: Plane, label: flightNumber, colorClass: "bg-violet-50 text-violet-700 border-violet-200" });
    }
    
    if (booking.booking_type === 'hotel') {
      if (booking.details?.breakfast_included) pills.push({ icon: Coffee, label: "Frühstück", colorClass: "bg-amber-50 text-amber-700 border-amber-200" });
      if (booking.details?.wifi_included) pills.push({ icon: Wifi, label: "WLAN", colorClass: "bg-blue-50 text-blue-700 border-blue-200" });
      // Calculate nights
      if (booking.end_datetime && booking.start_datetime) {
        const nights = Math.ceil((new Date(booking.end_datetime).getTime() - new Date(booking.start_datetime).getTime()) / (1000 * 60 * 60 * 24));
        if (nights > 0) pills.push({ icon: Moon, label: `${nights} ${nights === 1 ? 'Nacht' : 'Nächte'}`, colorClass: "bg-violet-50 text-violet-700 border-violet-200" });
      }
    }
    
    return pills;
  };
  
  const quickInfo = getQuickInfo();
  
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
          "group relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
          "bg-white hover:scale-[1.02] hover:shadow-lg",
          isSelected 
            ? `border-gray-400 ring-2 ring-gray-200 shadow-lg` 
            : hasHighSeverityIssues 
              ? "border-amber-200 shadow-sm" 
              : "border-gray-100 shadow-sm hover:border-gray-200"
        )}
      >
        {/* Gradient Header based on booking type */}
        <div className={cn(
          "relative px-4 py-3 bg-gradient-to-r",
          typeConfig.gradient
        )}>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8),transparent_50%)]" />
          
          <div className="relative flex items-center justify-between">
            {/* Icon + Booking Type */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <TypeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-xs font-medium uppercase tracking-wider">
                    {typeConfig.label}
                  </span>
                  {/* Status Badge with Icon */}
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                    booking.status === 'confirmed' 
                      ? "bg-white/20 text-white" 
                      : "bg-white/90 " + status.textColor
                  )}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>
                {bookingNumber && (
                  <button
                    onClick={copyBookingNumber}
                    className="flex items-center gap-1.5 text-white font-mono text-sm mt-0.5 hover:bg-white/10 -ml-1 px-1 rounded transition-colors group/copy"
                  >
                    {bookingNumber}
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {/* QR Code or Time Badge */}
            <div className="flex items-center gap-2">
              {timeLabel && timeLabel.urgent && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                  {timeLabel.label}
                </span>
              )}
              {qrCodeUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowQrCode?.();
                  }}
                  className="w-12 h-12 rounded-xl bg-white shadow-lg overflow-hidden hover:scale-105 transition-transform"
                  title="QR-Code anzeigen"
                >
                  <img 
                    src={qrCodeUrl} 
                    alt="QR-Code" 
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              )}
            </div>
          </div>
          
          {/* Data Quality Warning Badge */}
          {qualityIssues.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "absolute -bottom-3 left-4 w-6 h-6 rounded-full flex items-center justify-center shadow-lg cursor-help z-10",
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
        </div>
      
        {/* Main Content */}
        <div className="p-4 pt-5">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
            {booking.venue_name || booking.destination_city}
          </h3>
          {booking.provider && (
            <p className="text-sm text-gray-500 mb-3">{booking.provider}</p>
          )}
          
          {/* Journey Visualization for Transport */}
          {['train', 'flight', 'bus'].includes(booking.booking_type) && (
            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <div className="flex items-center gap-3">
                {/* Origin */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5">Von</div>
                  <div className="font-semibold text-gray-900 truncate">
                    {booking.origin_city || '–'}
                  </div>
                  {hasRealTime(booking.start_datetime) && (
                    <div className="text-sm text-gray-600 tabular-nums">
                      {formatTimeDisplay(booking.start_datetime)}
                    </div>
                  )}
                </div>
                
                {/* Arrow + Duration */}
                <div className="flex flex-col items-center px-2">
                  <div className="flex items-center gap-1 text-gray-400">
                    <div className="w-6 h-px bg-gray-300" />
                    <TypeIcon className="w-4 h-4" />
                    <div className="w-6 h-px bg-gray-300" />
                  </div>
                  {duration && (
                    <span className="text-xs text-gray-500 mt-1">{duration}</span>
                  )}
                </div>
                
                {/* Destination */}
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-xs text-gray-500 mb-0.5">Nach</div>
                  <div className="font-semibold text-gray-900 truncate">
                    {booking.destination_city}
                  </div>
                  {booking.end_datetime && hasRealTime(booking.end_datetime) && (
                    <div className="text-sm text-gray-600 tabular-nums">
                      {formatTimeDisplay(booking.end_datetime)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Hotel/Other: Date display */}
          {!['train', 'flight', 'bus'].includes(booking.booking_type) && (
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {format(parseISO(booking.start_datetime), "d. MMM yyyy", { locale: de })}
                {booking.end_datetime && (
                  <> – {format(parseISO(booking.end_datetime), "d. MMM yyyy", { locale: de })}</>
                )}
              </span>
            </div>
          )}
          
          {/* Travelers Pills */}
          {travelers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {travelers.map((traveler, i) => (
                <span 
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  <Users className="w-3 h-3" />
                  {traveler}
                </span>
              ))}
            </div>
          )}
          
          {/* Quick Info Pills */}
          {quickInfo.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {quickInfo.map((pill, i) => (
                <span 
                  key={i}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                    pill.colorClass
                  )}
                >
                  <pill.icon className="w-3.5 h-3.5" />
                  {pill.label}
                </span>
              ))}
              {hasQrCode && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white rounded-full text-xs font-medium">
                  <QrCode className="w-3.5 h-3.5" />
                  Digital
                </span>
              )}
            </div>
          )}
          
          {/* Expandable Details */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm animate-fade-in">
              {booking.venue_address && (
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{booking.venue_address}</span>
                </div>
              )}
              {booking.details?.notes && (
                <div className="flex items-start gap-2 text-gray-600">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{booking.details.notes}</span>
                </div>
              )}
              {booking.source_email_id && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-xs">Aus E-Mail importiert</span>
                </div>
              )}
            </div>
          )}
          
          {/* Bottom Row */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
            <div className="flex items-center gap-2">
              {price && (
                <span className="text-base font-semibold text-gray-900">{price}</span>
              )}
              {!price && !bookingNumber && (
                <span className="text-xs text-gray-400">Keine Details</span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {/* Expand Button */}
              <button
                onClick={toggleExpanded}
                className={cn(
                  "p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all",
                  isExpanded && "bg-gray-100 text-gray-700"
                )}
                title={isExpanded ? "Weniger anzeigen" : "Mehr anzeigen"}
              >
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )} />
              </button>
              
              {/* QR Code Button (if available but no thumbnail) */}
              {hasQrCode && !qrCodeUrl && onShowQrCode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowQrCode();
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="QR-Code anzeigen"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              )}
              
              {/* Maps Button */}
              {(booking.venue_address || booking.destination_city) && (
                <button
                  onClick={openMaps}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="In Maps öffnen"
                >
                  <Navigation className="w-4 h-4" />
                </button>
              )}
              
              {/* View Details Arrow */}
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all ml-1" />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
