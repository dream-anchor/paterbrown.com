import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, addHours, addDays } from "date-fns";
import { de } from "date-fns/locale";
import {
  Hotel, Train, Plane, Bus, Car, Package,
  MapPin, Clock, Users, Hash, Building2,
  Mail, FileText, History, X, ExternalLink, Download,
  ChevronDown, ChevronUp, AlertCircle, Copy, Calendar, Navigation,
  CreditCard, Star, Armchair, Luggage, Coffee, Wifi, Euro, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import DocumentViewer from "./DocumentViewer";

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
  status: "confirmed" | "changed" | "cancelled" | "pending";
  source_email_id: string | null;
  ai_confidence: number | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
}

interface BookingVersion {
  id: string;
  version_number: number;
  previous_data: Record<string, any>;
  change_summary: string | null;
  changed_by: string;
  created_at: string;
}

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  content_type: string | null;
}

interface RelatedEvent {
  id: string;
  title: string;
  location: string;
  venue_name: string | null;
  start_time: string;
}

interface Props {
  booking: TravelBooking | null;
  onClose: () => void;
  onUpdate: () => void;
  isMobile?: boolean;
}

// Dark mode config
const bookingTypeConfig = {
  hotel: { 
    icon: Hotel, 
    label: "Hotel", 
    iconColor: "text-blue-400",
    bg: "bg-blue-500/20",
    gradient: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30",
    accent: "bg-blue-500"
  },
  train: { 
    icon: Train, 
    label: "Zug", 
    iconColor: "text-emerald-400",
    bg: "bg-emerald-500/20",
    gradient: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/30",
    accent: "bg-emerald-500"
  },
  flight: { 
    icon: Plane, 
    label: "Flug", 
    iconColor: "text-orange-400",
    bg: "bg-orange-500/20",
    gradient: "from-orange-500/20 to-orange-600/10",
    border: "border-orange-500/30",
    accent: "bg-orange-500"
  },
  bus: { 
    icon: Bus, 
    label: "Bus", 
    iconColor: "text-purple-400",
    bg: "bg-purple-500/20",
    gradient: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/30",
    accent: "bg-purple-500"
  },
  rental_car: { 
    icon: Car, 
    label: "Mietwagen", 
    iconColor: "text-cyan-400",
    bg: "bg-cyan-500/20",
    gradient: "from-cyan-500/20 to-cyan-600/10",
    border: "border-cyan-500/30",
    accent: "bg-cyan-500"
  },
  other: { 
    icon: Package, 
    label: "Sonstiges", 
    iconColor: "text-gray-400",
    bg: "bg-gray-500/20",
    gradient: "from-gray-500/20 to-gray-600/10",
    border: "border-gray-500/30",
    accent: "bg-gray-500"
  },
};

// Helper: Check if datetime has a real time (not 00:00 UTC placeholder)
const hasRealTime = (datetime: string): boolean => {
  const parsed = parseISO(datetime);
  const hours = parsed.getUTCHours();
  const minutes = parsed.getUTCMinutes();
  return !(hours === 0 && minutes === 0);
};

export default function TravelBookingDetail({ booking, onClose, onUpdate, isMobile }: Props) {
  const [versions, setVersions] = useState<BookingVersion[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Attachment | null>(null);
  const [originalEmail, setOriginalEmail] = useState<{ subject: string; body_html: string } | null>(null);
  const [relatedEvent, setRelatedEvent] = useState<RelatedEvent | null>(null);

  useEffect(() => {
    if (booking) {
      fetchVersions();
      fetchAttachments();
      fetchOriginalEmail();
      fetchRelatedEvent();
    }
  }, [booking?.id]);

  const fetchVersions = async () => {
    if (!booking) return;
    const { data } = await supabase
      .from("booking_versions")
      .select("*")
      .eq("booking_id", booking.id)
      .order("version_number", { ascending: false });
    setVersions((data as BookingVersion[]) || []);
  };

  const fetchAttachments = async () => {
    if (!booking?.source_email_id) return;
    const { data } = await supabase
      .from("travel_attachments")
      .select("*")
      .eq("email_id", booking.source_email_id);
    setAttachments((data as Attachment[]) || []);
  };

  const fetchOriginalEmail = async () => {
    if (!booking?.source_email_id) return;
    const { data } = await supabase
      .from("travel_emails")
      .select("subject, body_html")
      .eq("id", booking.source_email_id)
      .single();
    setOriginalEmail(data);
  };

  const fetchRelatedEvent = async () => {
    if (!booking) return;
    setRelatedEvent(null);
    
    try {
      // Search for events on the same day or next day in the destination city
      const bookingDate = format(parseISO(booking.start_datetime), 'yyyy-MM-dd');
      const nextDay = format(addDays(parseISO(booking.start_datetime), 1), 'yyyy-MM-dd');
      
      // Get first word of destination city for fuzzy matching
      const citySearchTerm = booking.destination_city.split(' ')[0].split(',')[0];
      
      const { data } = await supabase
        .from('admin_events')
        .select('id, title, location, venue_name, start_time')
        .or(`start_time.gte.${bookingDate}T00:00:00,start_time.lte.${nextDay}T23:59:59`)
        .ilike('location', `%${citySearchTerm}%`)
        .order('start_time', { ascending: true })
        .limit(1);
      
      if (data && data.length > 0) {
        setRelatedEvent(data[0]);
      }
    } catch (error) {
      console.error("Error fetching related event:", error);
    }
  };

  if (!booking) {
    return (
      <div className="bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center h-full flex flex-col items-center justify-center">
        <Package className="w-10 h-10 text-gray-600 mb-3" />
        <p className="text-sm text-gray-500">
          Wähle eine Buchung aus, um Details anzuzeigen
        </p>
      </div>
    );
  }

  const typeConfig = bookingTypeConfig[booking.booking_type];
  const TypeIcon = typeConfig.icon;

  const getTravelers = () => {
    if (booking.traveler_names?.length) return booking.traveler_names;
    if (booking.traveler_name) return [booking.traveler_name];
    return [];
  };

  // Enhanced booking number logic
  const getBookingNumber = () => {
    if (booking.booking_number) return booking.booking_number;
    if (booking.details?.order_number) return booking.details.order_number;
    if (booking.details?.confirmation_number) return booking.details.confirmation_number;
    if (booking.details?.reference) return booking.details.reference;
    if (booking.details?.pnr) return booking.details.pnr;
    if (booking.details?.booking_code) return booking.details.booking_code;
    if (booking.details?.auftragsnummer) return booking.details.auftragsnummer;
    return null;
  };

  const bookingNumber = getBookingNumber();

  // Google Maps URL
  const getGoogleMapsUrl = () => {
    const address = [
      booking.venue_name,
      booking.venue_address,
      booking.destination_city
    ].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  // Copy booking number
  const copyBookingNumber = () => {
    if (bookingNumber) {
      navigator.clipboard.writeText(bookingNumber);
      toast.success("Buchungsnummer kopiert");
    }
  };

  // Generate iCal Event
  const generateICalEvent = () => {
    const start = format(parseISO(booking.start_datetime), "yyyyMMdd'T'HHmmss");
    const end = booking.end_datetime 
      ? format(parseISO(booking.end_datetime), "yyyyMMdd'T'HHmmss")
      : format(addHours(parseISO(booking.start_datetime), 2), "yyyyMMdd'T'HHmmss");
    
    const title = booking.venue_name || `${booking.origin_city || ''} → ${booking.destination_city}`.trim();
    const location = booking.venue_address || booking.destination_city;
    const description = [
      booking.provider,
      bookingNumber ? `Buchung: ${bookingNumber}` : null,
      getTravelers().length > 0 ? `Reisende: ${getTravelers().join(', ')}` : null
    ].filter(Boolean).join('\\n');

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Travel Manager//DE
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
LOCATION:${location}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${booking.destination_city}-${format(parseISO(booking.start_datetime), 'yyyy-MM-dd')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Kalendereintrag heruntergeladen");
  };

  // Generate Google Calendar URL
  const generateGoogleCalendarUrl = () => {
    const start = format(parseISO(booking.start_datetime), "yyyyMMdd'T'HHmmss");
    const end = booking.end_datetime 
      ? format(parseISO(booking.end_datetime), "yyyyMMdd'T'HHmmss")
      : format(addHours(parseISO(booking.start_datetime), 2), "yyyyMMdd'T'HHmmss");
    
    const title = booking.venue_name || `${booking.origin_city || ''} → ${booking.destination_city}`.trim();
    const location = booking.venue_address || booking.destination_city;
    const description = [
      booking.provider,
      bookingNumber ? `Buchung: ${bookingNumber}` : null,
      getTravelers().length > 0 ? `Reisende: ${getTravelers().join(', ')}` : null
    ].filter(Boolean).join('\n');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(description)}`;
  };

  // Get detail value with fallback keys
  const getDetail = (...keys: string[]) => {
    for (const key of keys) {
      if (booking.details?.[key] !== undefined && booking.details?.[key] !== null && booking.details?.[key] !== '') {
        return booking.details[key];
      }
    }
    return null;
  };

  // Get hotel website URL
  const getHotelWebsiteUrl = () => {
    return getDetail('hotel_url', 'website', 'url', 'hotel_website', 'booking_url', 'hotelWebsite');
  };

  // Format time with placeholder check
  const formatTimeDisplay = (datetime: string): string => {
    if (!hasRealTime(datetime)) return "–";
    return format(parseISO(datetime), "HH:mm 'Uhr'", { locale: de });
  };

  // Render train-specific route card
  const renderTrainRoute = () => {
    const trainNumber = getDetail('train_number', 'ice_number', 'zugnummer', 'zug');
    const trainClass = getDetail('class', 'klasse', 'wagon_class');
    const wagon = getDetail('wagon', 'wagen', 'car');
    const seat = getDetail('seat', 'sitzplatz', 'seats', 'platz');
    const bahncard = getDetail('bahncard', 'bahncard_type', 'bc');
    const price = getDetail('price', 'preis', 'total_price');

    return (
      <div className="space-y-4">
        {/* Route Card - Dark glassmorphism */}
        <div className={`relative bg-gradient-to-br ${typeConfig.gradient} backdrop-blur-sm rounded-2xl p-5 border ${typeConfig.border}`}>
          <div className="flex items-start gap-4">
            {/* Timeline */}
            <div className="flex flex-col items-center pt-1">
              <div className={`w-3 h-3 rounded-full ${typeConfig.accent} ring-4 ring-[#1c1c1e] shadow-sm`} />
              <div className="w-0.5 h-16 bg-gradient-to-b from-emerald-500 to-emerald-600" />
              <div className={`w-3 h-3 rounded-full ${typeConfig.accent} ring-4 ring-[#1c1c1e] shadow-sm`} />
            </div>
            
            {/* Route Info */}
            <div className="flex-1 space-y-8">
              <div>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Abfahrt</div>
                <div className="text-lg font-semibold text-white">{booking.origin_city || '–'}</div>
                <div className="text-sm text-gray-400">
                  {formatTimeDisplay(booking.start_datetime)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Ankunft</div>
                <div className="text-lg font-semibold text-white">{booking.destination_city}</div>
                {booking.end_datetime && hasRealTime(booking.end_datetime) && (
                  <div className="text-sm text-gray-400">
                    {formatTimeDisplay(booking.end_datetime)}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Train Number Badge */}
          {trainNumber && (
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-[#0a0a0a]/80 backdrop-blur rounded-full border border-emerald-500/30">
              <span className="font-mono font-bold text-emerald-400 text-sm">{trainNumber}</span>
            </div>
          )}
        </div>

        {/* Detail Grid - Dark iOS Settings Style */}
        {(trainClass || wagon || seat || bahncard || price) && (
          <div className="bg-[#1c1c1e] rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
            {trainClass && (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Klasse</span>
                </div>
                <span className="text-sm font-semibold text-white">{trainClass}. Klasse</span>
              </div>
            )}
            {wagon && (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Train className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Wagen</span>
                </div>
                <span className="text-sm font-semibold text-white">{wagon}</span>
              </div>
            )}
            {seat && (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Armchair className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Sitzplatz</span>
                </div>
                <span className="text-sm font-semibold text-white">{seat}</span>
              </div>
            )}
            {bahncard && (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">BahnCard</span>
                </div>
                <span className="text-sm font-semibold text-white">{bahncard}</span>
              </div>
            )}
            {price && (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Euro className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Preis</span>
                </div>
                <span className="text-sm font-semibold text-white">{typeof price === 'number' ? `${price.toFixed(2)} €` : price}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render flight-specific route card
  const renderFlightRoute = () => {
    const flightNumber = getDetail('flight_number', 'flugnummer', 'flight');
    const terminal = getDetail('terminal');
    const gate = getDetail('gate');
    const seat = getDetail('seat', 'sitzplatz');
    const baggage = getDetail('baggage', 'baggage_allowance', 'gepaeck');
    const airline = getDetail('airline', 'carrier');

    return (
      <div className="space-y-4">
        {/* Route Card */}
        <div className={`relative bg-gradient-to-br ${typeConfig.gradient} backdrop-blur-sm rounded-2xl p-5 border ${typeConfig.border}`}>
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center pt-1">
              <div className={`w-3 h-3 rounded-full ${typeConfig.accent} ring-4 ring-[#1c1c1e] shadow-sm`} />
              <div className="w-0.5 h-16 bg-gradient-to-b from-orange-500 to-orange-600" />
              <div className={`w-3 h-3 rounded-full ${typeConfig.accent} ring-4 ring-[#1c1c1e] shadow-sm`} />
            </div>
            
            <div className="flex-1 space-y-8">
              <div>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Abflug</div>
                <div className="text-lg font-semibold text-white">{booking.origin_city || '–'}</div>
                <div className="text-sm text-gray-400">
                  {formatTimeDisplay(booking.start_datetime)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Ankunft</div>
                <div className="text-lg font-semibold text-white">{booking.destination_city}</div>
                {booking.end_datetime && hasRealTime(booking.end_datetime) && (
                  <div className="text-sm text-gray-400">
                    {formatTimeDisplay(booking.end_datetime)}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {flightNumber && (
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-[#0a0a0a]/80 backdrop-blur rounded-full border border-orange-500/30">
              <span className="font-mono font-bold text-orange-400 text-sm">{flightNumber}</span>
            </div>
          )}
        </div>

        {/* Detail Grid */}
        {(airline || terminal || gate || seat || baggage) && (
          <div className="bg-[#1c1c1e] rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
            {airline && (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Plane className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Airline</span>
                </div>
                <span className="text-sm font-semibold text-white">{airline}</span>
              </div>
            )}
            {terminal && (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Terminal</span>
                </div>
                <span className="text-sm font-semibold text-white">{terminal}</span>
              </div>
            )}
            {gate && (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Gate</span>
                </div>
                <span className="text-sm font-semibold text-white">{gate}</span>
              </div>
            )}
            {seat && (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Armchair className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Sitzplatz</span>
                </div>
                <span className="text-sm font-semibold text-white">{seat}</span>
              </div>
            )}
            {baggage && (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Luggage className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Gepäck</span>
                </div>
                <span className="text-sm font-semibold text-white">{baggage}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render hotel-specific details
  const renderHotelDetails = () => {
    const roomType = getDetail('room_type', 'room_category', 'zimmer', 'zimmerkategorie');
    const roomNumber = getDetail('room_number', 'zimmernummer');
    const breakfast = getDetail('breakfast_included', 'breakfast', 'fruehstueck');
    const wifi = getDetail('wifi_included', 'wifi', 'wlan');
    const pricePerNight = getDetail('price_per_night', 'preis_pro_nacht');
    const cancellation = getDetail('cancellation_policy', 'stornierung', 'cancellation_deadline');

    const hasDetails = roomType || roomNumber || breakfast !== null || wifi !== null || pricePerNight || cancellation;
    if (!hasDetails) return null;

    return (
      <div className="bg-[#1c1c1e] rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
        {roomType && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Hotel className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">Zimmer</span>
            </div>
            <span className="text-sm font-semibold text-white">{roomType}</span>
          </div>
        )}
        {roomNumber && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Hash className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">Zimmernummer</span>
            </div>
            <span className="text-sm font-semibold text-white">{roomNumber}</span>
          </div>
        )}
        {breakfast !== null && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Coffee className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">Frühstück</span>
            </div>
            <span className={`text-sm font-semibold ${breakfast ? 'text-emerald-400' : 'text-gray-500'}`}>
              {breakfast ? 'Inklusive' : 'Nicht inklusive'}
            </span>
          </div>
        )}
        {wifi !== null && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Wifi className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">WLAN</span>
            </div>
            <span className={`text-sm font-semibold ${wifi ? 'text-emerald-400' : 'text-gray-500'}`}>
              {wifi ? 'Inklusive' : 'Nicht inklusive'}
            </span>
          </div>
        )}
        {pricePerNight && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Euro className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">Preis/Nacht</span>
            </div>
            <span className="text-sm font-semibold text-white">{typeof pricePerNight === 'number' ? `${pricePerNight.toFixed(2)} €` : pricePerNight}</span>
          </div>
        )}
        {cancellation && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">Stornierung</span>
            </div>
            <span className="text-sm font-semibold text-white text-right max-w-[60%]">{cancellation}</span>
          </div>
        )}
      </div>
    );
  };

  // Render generic details for other booking types
  const renderGenericDetails = () => {
    if (!booking.details || Object.keys(booking.details).length === 0) return null;

    const excludedKeys = ['order_number', 'confirmation_number', 'reference', 'pnr', 'booking_code', 'auftragsnummer'];
    const detailEntries = Object.entries(booking.details).filter(([key]) => !excludedKeys.includes(key));
    
    if (detailEntries.length === 0) return null;

    return (
      <div className="bg-[#1c1c1e] rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
        {detailEntries.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
            <span className="text-sm font-semibold text-white">
              {typeof value === 'boolean' ? (value ? 'Ja' : 'Nein') : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Render travelers with dark theme
  const renderTravelers = () => {
    const travelers = getTravelers();
    if (travelers.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
          Reisende
        </div>
        <div className="space-y-2">
          {travelers.map((name, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${typeConfig.gradient} flex items-center justify-center border ${typeConfig.border}`}>
                <span className={`${typeConfig.iconColor} font-semibold text-sm`}>
                  {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{name}</div>
                {booking.details?.traveler_bookings?.[name] && (
                  <div className="text-xs text-gray-500 font-mono">
                    #{booking.details.traveler_bookings[name]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className={`bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden ${isMobile ? 'rounded-t-2xl rounded-b-none' : ''}`}>
        {/* Header with Map Background */}
        <div className="relative p-5 border-b border-white/5">
          {/* Map Background (if coordinates available) */}
          {(booking.latitude && booking.longitude) && (
            <div className="absolute inset-0 opacity-30">
              <img 
                src={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${booking.longitude},${booking.latitude},12,0/400x200@2x?access_token=pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNsb2V5MXI5azA0ZHoycXBjYzQzNTVwbWUifQ.Xv8kZJP0Iyg6ND9DPXY9RQ`}
                className="w-full h-full object-cover"
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-[#1c1c1e]/80 to-transparent" />
            </div>
          )}
          
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${typeConfig.bg} flex items-center justify-center border ${typeConfig.border}`}>
                <TypeIcon className={`w-5 h-5 ${typeConfig.iconColor}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white tracking-tight">
                  {booking.venue_name || booking.destination_city}
                </h3>
                {booking.booking_type === 'hotel' && getHotelWebsiteUrl() ? (
                  <a 
                    href={getHotelWebsiteUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Hotel-Website
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">{typeConfig.label}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={generateICalEvent}
                title="Als iCal exportieren"
                className="text-gray-500 hover:text-white hover:bg-white/10 rounded-full"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => window.open(generateGoogleCalendarUrl(), '_blank')}
                title="Zu Google Calendar hinzufügen"
                className="text-gray-500 hover:text-white hover:bg-white/10 rounded-full"
              >
                <Calendar className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="text-gray-500 hover:text-white hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[60vh] lg:max-h-none overflow-y-auto">
          {/* Booking Number & Status - Prominent Card */}
          {bookingNumber && (
            <div className={`flex items-center justify-between p-4 bg-gradient-to-br ${typeConfig.gradient} rounded-xl border ${typeConfig.border}`}>
              <div className="flex items-center gap-3">
                <Hash className={`w-5 h-5 ${typeConfig.iconColor}`} />
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Buchungsnummer</div>
                  <div className="font-mono font-bold text-white text-lg tracking-wide">{bookingNumber}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={copyBookingNumber}
                  className={`h-9 w-9 p-0 ${typeConfig.iconColor} hover:bg-white/10 rounded-full`}
                  title="Kopieren"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Type-specific route/details */}
          {booking.booking_type === 'train' && (
            <>
              {renderTrainRoute()}
              {/* Fahrkarte PDF - prominent display for train tickets */}
              {attachments.filter(a => a.content_type?.includes('pdf')).length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                    Fahrkarte
                  </div>
                  {attachments
                    .filter(a => a.content_type?.includes('pdf'))
                    .map(att => (
                      <button
                        key={att.id}
                        onClick={() => setViewingDocument(att)}
                        className="flex items-center gap-3 w-full p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/20 transition-all text-left group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white group-hover:text-emerald-300 transition-colors">PDF öffnen</div>
                          <div className="text-sm text-gray-500 truncate">{att.file_name}</div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      </button>
                    ))}
                </div>
              )}
            </>
          )}
          {booking.booking_type === 'flight' && renderFlightRoute()}
          {booking.booking_type === 'hotel' && (
            <>
              {/* Hotel Date Info */}
              <div className={`bg-gradient-to-br ${typeConfig.gradient} rounded-2xl p-5 border ${typeConfig.border}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Check-in</div>
                    <div className="text-lg font-semibold text-white">
                      {format(parseISO(booking.start_datetime), "d. MMM", { locale: de })}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatTimeDisplay(booking.start_datetime)}
                    </div>
                  </div>
                  {booking.end_datetime && (
                    <div>
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Check-out</div>
                      <div className="text-lg font-semibold text-white">
                        {format(parseISO(booking.end_datetime), "d. MMM", { locale: de })}
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatTimeDisplay(booking.end_datetime)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {renderHotelDetails()}
            </>
          )}

          {/* Generic transport (bus, rental car, other) */}
          {!['train', 'flight', 'hotel'].includes(booking.booking_type) && (
            <>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Zeitraum</span>
                </div>
                <div className="pl-6 text-sm">
                  <div className="text-gray-400">
                    <span className="font-medium text-white">
                      {format(parseISO(booking.start_datetime), "EEEE, d. MMMM yyyy", { locale: de })}
                      {hasRealTime(booking.start_datetime) && (
                        <> um {format(parseISO(booking.start_datetime), "HH:mm 'Uhr'", { locale: de })}</>
                      )}
                    </span>
                  </div>
                  {booking.end_datetime && (
                    <div className="mt-1.5 text-gray-400">
                      bis{' '}
                      <span className="font-medium text-white">
                        {format(parseISO(booking.end_datetime), "EEEE, d. MMMM yyyy", { locale: de })}
                        {hasRealTime(booking.end_datetime) && (
                          <> um {format(parseISO(booking.end_datetime), "HH:mm 'Uhr'", { locale: de })}</>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {renderGenericDetails()}
            </>
          )}

          {/* Related Event - Link to Tour */}
          {relatedEvent && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-widest">
                  In Verbindung mit
                </span>
              </div>
              <div className="text-white font-semibold">{relatedEvent.title}</div>
              <div className="text-sm text-gray-400">
                {relatedEvent.venue_name || relatedEvent.location}, {format(parseISO(relatedEvent.start_time), "HH:mm 'Uhr'", { locale: de })}
              </div>
            </div>
          )}

          {/* Location */}
          {(booking.venue_address || (booking.booking_type === 'hotel' && booking.destination_city)) && (
            <>
              <Separator className="bg-white/5" />
              <div className="space-y-2.5">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Adresse</div>
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm text-gray-400 flex-1">
                    {booking.venue_address || booking.destination_city}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getGoogleMapsUrl(), '_blank')}
                    className="flex-shrink-0 bg-white/5 border-white/10 text-white hover:bg-white/10 h-8 px-3"
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1.5" />
                    Maps
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Provider */}
          {booking.provider && (
            <>
              <Separator className="bg-white/5" />
              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Anbieter</div>
                <div className="text-sm font-medium text-white">{booking.provider}</div>
              </div>
            </>
          )}

          {/* Travelers */}
          {getTravelers().length > 0 && (
            <>
              <Separator className="bg-white/5" />
              {renderTravelers()}
            </>
          )}

          {/* Attachments */}
          {(attachments.length > 0 || originalEmail) && (
            <>
              <Separator className="bg-white/5" />
              <div className="space-y-3">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Dokumente</div>
                <div className="space-y-2">
                  {originalEmail && (
                    <button
                      onClick={() => setViewingDocument({ 
                        id: "email", 
                        file_name: originalEmail.subject || "Original E-Mail",
                        file_path: "",
                        content_type: "text/html"
                      })}
                      className="flex items-center gap-3 w-full p-3 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-white text-sm">Original E-Mail</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{originalEmail.subject}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                  {attachments
                    .filter(att => booking.booking_type !== 'train' || !att.content_type?.includes('pdf'))
                    .map((att) => (
                    <button
                      key={att.id}
                      onClick={() => setViewingDocument(att)}
                      className="flex items-center gap-3 w-full p-3 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-white text-sm truncate max-w-[200px]">{att.file_name}</div>
                        <div className="text-xs text-gray-500">{att.content_type || 'Dokument'}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Version History */}
          {versions.length > 0 && (
            <>
              <Separator className="bg-white/5" />
              <div className="space-y-2.5">
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className="flex items-center gap-2 text-sm w-full group"
                >
                  <History className="w-4 h-4 text-gray-500" />
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest group-hover:text-gray-400 transition-colors">
                    Versionen ({versions.length})
                  </span>
                  {showVersions ? (
                    <ChevronUp className="w-4 h-4 ml-auto text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-auto text-gray-500" />
                  )}
                </button>
                {showVersions && (
                  <div className="space-y-3">
                    {versions.map((version) => (
                      <div key={version.id} className="text-sm border-l-2 border-white/10 pl-3 py-1">
                        <div className="font-medium text-white">
                          Version {version.version_number}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {format(parseISO(version.created_at), "d. MMM yyyy, HH:mm", { locale: de })}
                        </div>
                        {version.change_summary && (
                          <div className="mt-1 text-gray-400">{version.change_summary}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* AI Confidence */}
          {booking.ai_confidence !== null && (
            <div className="pt-2 flex items-center gap-2 text-xs text-gray-600">
              <AlertCircle className="w-3 h-3" />
              <span>KI-Sicherheit: {Math.round(booking.ai_confidence * 100)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer
          attachment={viewingDocument}
          emailHtml={viewingDocument.id === "email" ? originalEmail?.body_html : undefined}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  );
}
