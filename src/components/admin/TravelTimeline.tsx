import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { de } from "date-fns/locale";
import {
  Hotel, Train, Plane, Bus, Car, Package,
  MapPin, Clock, ChevronRight, Users, Coffee, QrCode,
  AlertTriangle, Check, Ticket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
}

interface Props {
  date: string;
  bookings: TravelBooking[];
  selectedBookingId?: string;
  onSelect: (booking: TravelBooking) => void;
}

const bookingTypeConfig = {
  hotel: { icon: Hotel, label: "Hotel" },
  train: { icon: Train, label: "Zug" },
  flight: { icon: Plane, label: "Flug" },
  bus: { icon: Bus, label: "Bus" },
  rental_car: { icon: Car, label: "Mietwagen" },
  other: { icon: Package, label: "Sonstiges" },
};

// Check if datetime has real time component
const hasRealTime = (datetime: string): boolean => {
  const parsed = parseISO(datetime);
  const hours = parsed.getUTCHours();
  const minutes = parsed.getUTCMinutes();
  return !(hours === 0 && minutes === 0);
};

const formatTime = (datetime: string): string => {
  if (!hasRealTime(datetime)) return "";
  return format(parseISO(datetime), "HH:mm", { locale: de });
};

// Datenqualitäts-Prüfung
const checkDataQuality = (booking: TravelBooking): { hasIssues: boolean; count: number } => {
  let count = 0;
  
  if (!booking.destination_city || booking.destination_city.toLowerCase() === 'unknown') count++;
  if (!booking.origin_city || booking.origin_city.toLowerCase() === 'unknown') {
    if (['train', 'flight', 'bus'].includes(booking.booking_type)) count++;
  }
  
  const placeholderNumbers = ['reserviert', 'ohne nr.', 'ohne nr', 'n/a', '-', ''];
  if (booking.booking_number && placeholderNumbers.includes(booking.booking_number.toLowerCase())) count++;
  
  return { hasIssues: count > 0, count };
};

export default function TravelTimeline({ date, bookings, selectedBookingId, onSelect }: Props) {
  const parsedDate = parseISO(date);
  const dateIsPast = isPast(parsedDate) && !isToday(parsedDate);
  
  // Buchungen nach Uhrzeit sortieren
  const sortedBookings = [...bookings].sort((a, b) => {
    const timeA = parseISO(a.start_datetime).getTime();
    const timeB = parseISO(b.start_datetime).getTime();
    return timeA - timeB;
  });

  const getDateBadge = () => {
    if (isToday(parsedDate)) {
      return { label: "Heute", className: "bg-blue-50 text-blue-600 border-blue-100" };
    }
    if (isTomorrow(parsedDate)) {
      return { label: "Morgen", className: "bg-amber-50 text-amber-600 border-amber-100" };
    }
    return null;
  };

  const dateBadge = getDateBadge();

  return (
    <div className={cn(
      "bg-white rounded-2xl border overflow-hidden transition-all",
      dateIsPast ? "border-gray-100 opacity-60" : "border-gray-200"
    )}>
      {/* Date Header */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <span className={cn(
          "font-semibold capitalize",
          dateIsPast ? "text-gray-400" : "text-gray-900"
        )}>
          {format(parsedDate, "EEEE, d. MMMM yyyy", { locale: de })}
        </span>
        {dateBadge && (
          <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium border",
            dateBadge.className
          )}>
            {dateBadge.label}
          </span>
        )}
      </div>

      {/* Timeline Items */}
      <div className="relative px-5 py-4">
        {/* Vertikale Linie */}
        <div className="absolute left-[38px] top-4 bottom-4 w-0.5 bg-gray-100" />

        <div className="space-y-1">
          {sortedBookings.map((booking, index) => (
            <TimelineItem
              key={booking.id}
              booking={booking}
              isSelected={selectedBookingId === booking.id}
              isLast={index === sortedBookings.length - 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TimelineItemProps {
  booking: TravelBooking;
  isSelected: boolean;
  isLast: boolean;
  onSelect: (booking: TravelBooking) => void;
}

function TimelineItem({ booking, isSelected, isLast, onSelect }: TimelineItemProps) {
  const typeConfig = bookingTypeConfig[booking.booking_type];
  const TypeIcon = typeConfig.icon;
  const time = formatTime(booking.start_datetime);
  const qualityCheck = checkDataQuality(booking);

  // Quick info für Transport
  const getQuickDetails = () => {
    const parts: string[] = [];
    
    if (booking.booking_type === 'train') {
      const trainNumber = booking.details?.train_number || booking.details?.ice_number;
      if (trainNumber) parts.push(trainNumber);
      const wagon = booking.details?.wagon || booking.details?.wagen;
      const seat = booking.details?.seat || booking.details?.sitzplatz;
      if (wagon && seat) parts.push(`Wg ${wagon} Pl ${seat}`);
    }
    
    if (booking.booking_type === 'flight') {
      const flightNumber = booking.details?.flight_number;
      if (flightNumber) parts.push(flightNumber);
    }
    
    if (booking.booking_type === 'hotel') {
      if (booking.end_datetime) {
        const nights = Math.ceil(
          (parseISO(booking.end_datetime).getTime() - parseISO(booking.start_datetime).getTime()) 
          / (1000 * 60 * 60 * 24)
        );
        if (nights > 0) parts.push(`${nights} ${nights === 1 ? 'Nacht' : 'Nächte'}`);
      }
      if (booking.details?.breakfast_included) parts.push("Frühstück inkl.");
    }
    
    return parts.join(" · ");
  };

  const quickDetails = getQuickDetails();
  const hasQrCode = booking.details?.qr_code_present || booking.details?.mobile_ticket;

  return (
    <TooltipProvider>
      <div
        onClick={() => onSelect(booking)}
        className={cn(
          "group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all",
          "hover:bg-gray-50",
          isSelected && "bg-gray-100 ring-1 ring-gray-200",
          booking.status === 'proposal' && "opacity-70 border border-dashed border-purple-200 bg-purple-50/30"
        )}
      >
        {/* Timeline Dot */}
        <div className="relative z-10 flex items-center justify-center">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
            isSelected 
              ? "bg-blue-600 text-white" 
              : "bg-white border-2 border-gray-200 text-gray-500 group-hover:border-gray-300"
          )}>
            <TypeIcon className="w-4 h-4" />
          </div>
          {qualityCheck.hasIssues && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center">
              <AlertTriangle className="w-2.5 h-2.5" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {/* Main Line */}
          <div className="flex items-center gap-2 mb-0.5">
            {time && (
              <span className="text-sm font-medium text-gray-500 tabular-nums w-12">
                {time}
              </span>
            )}
            
            {['train', 'flight', 'bus'].includes(booking.booking_type) ? (
              /* Transport Route */
              (() => {
                const invalidCities = ['unknown', 'unbekannt', ''];
                const hasInvalidOrigin = !booking.origin_city || invalidCities.includes(booking.origin_city.toLowerCase());
                const hasInvalidDestination = !booking.destination_city || invalidCities.includes(booking.destination_city.toLowerCase());
                
                if (hasInvalidOrigin || hasInvalidDestination) {
                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-medium text-amber-600 truncate cursor-help">
                          ⚠️ {hasInvalidOrigin ? '?' : booking.origin_city} → {hasInvalidDestination ? '?' : booking.destination_city}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Route unvollständig erkannt.</p>
                        <p className="text-xs text-gray-500">Klicken zum Bearbeiten.</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                
                return (
                  <span className="font-medium text-gray-900 truncate">
                    {booking.origin_city} → {booking.destination_city}
                  </span>
                );
              })()
            ) : (
              /* Hotel / Other */
              <span className="font-medium text-gray-900 truncate">
                {booking.venue_name || booking.destination_city}
              </span>
            )}

            {/* Status Badge if not confirmed */}
            {booking.status !== 'confirmed' && (
              <span className={cn(
                "px-1.5 py-0.5 text-[10px] font-medium rounded",
                booking.status === 'cancelled' 
                  ? "bg-red-50 text-red-600" 
                  : booking.status === 'proposal'
                  ? "bg-purple-50 text-purple-600 border border-purple-200"
                  : "bg-amber-50 text-amber-600"
              )}>
                {booking.status === 'cancelled' ? 'Storniert' : 
                 booking.status === 'proposal' ? 'Angebot' : 'Geändert'}
              </span>
            )}
          </div>

          {/* Secondary Line */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{booking.provider || typeConfig.label}</span>
            {quickDetails && (
              <>
                <span className="text-gray-300">·</span>
                <span className="truncate">{quickDetails}</span>
              </>
            )}
            {hasQrCode && (
              <>
                <span className="text-gray-300">·</span>
                <span className="inline-flex items-center gap-1 text-gray-900">
                  <QrCode className="w-3 h-3" />
                  Digital
                </span>
              </>
            )}
          </div>

          {/* City-Ticket Info */}
          {booking.booking_type === 'train' && booking.details?.city_ticket_start && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600">
              <Ticket className="w-3 h-3" />
              City: {booking.details.city_ticket_start.zone?.split('(')[0]?.trim()}
              {booking.details.city_ticket_destination && (
                <span> → {booking.details.city_ticket_destination.zone?.split('(')[0]?.trim()}</span>
              )}
            </div>
          )}

          {/* Traveler name if present */}
          {booking.traveler_name && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
              <Users className="w-3 h-3" />
              {booking.traveler_name}
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 mt-1.5 transition-colors flex-shrink-0" />
      </div>
    </TooltipProvider>
  );
}