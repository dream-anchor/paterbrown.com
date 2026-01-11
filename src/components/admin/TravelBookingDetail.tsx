import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, addHours, addDays } from "date-fns";
import { de } from "date-fns/locale";
import {
  Hotel, Train, Plane, Bus, Car, Package,
  MapPin, Clock, Users, Hash, Building2,
  Mail, FileText, History, X, ExternalLink, Download,
  ChevronDown, ChevronUp, ChevronRight, AlertCircle, Copy, Calendar, Navigation,
  CreditCard, Star, Armchair, Luggage, Coffee, Wifi, Euro, Sparkles,
  Loader2, ScanSearch, Crown, Bed, CalendarX, DoorOpen, LogIn, LogOut,
  Moon, Utensils, ParkingCircle, Bath, Eye, Check, Ticket, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  status: "confirmed" | "changed" | "cancelled" | "pending" | "proposal";
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
  document_type?: string | null;
  booking_id?: string | null;
  traveler_name?: string | null;
  qr_code_image_path?: string | null;
  qr_code_data?: string | null;
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

// Monochrome Apple Design 2026
const bookingTypeConfig = {
  hotel: { icon: Hotel, label: "Hotel" },
  train: { icon: Train, label: "Zug" },
  flight: { icon: Plane, label: "Flug" },
  bus: { icon: Bus, label: "Bus" },
  rental_car: { icon: Car, label: "Mietwagen" },
  other: { icon: Package, label: "Sonstiges" },
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
  const [assignedAttachments, setAssignedAttachments] = useState<Attachment[]>([]);
  const [unassignedAttachments, setUnassignedAttachments] = useState<Attachment[]>([]);
  const [showUnassignedAttachments, setShowUnassignedAttachments] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Attachment | null>(null);
  const [originalEmail, setOriginalEmail] = useState<{ subject: string; body_html: string } | null>(null);
  const [relatedEvent, setRelatedEvent] = useState<RelatedEvent | null>(null);
  const [isDetectingDocType, setIsDetectingDocType] = useState(false);

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
    if (!booking) return;
    
    // 1. Primär: Anhänge die DIESER Buchung zugeordnet sind (booking_id match)
    const { data: assigned } = await supabase
      .from("travel_attachments")
      .select("id, file_name, file_path, content_type, document_type, booking_id, traveler_name, qr_code_image_path, qr_code_data")
      .eq("booking_id", booking.id);
    
    setAssignedAttachments((assigned as Attachment[]) || []);
    
    // 2. Sekundär: Unzugeordnete Anhänge aus derselben E-Mail (für Legacy/Review)
    let unassignedData: Attachment[] = [];
    if (booking.source_email_id) {
      const { data: unassigned } = await supabase
        .from("travel_attachments")
        .select("id, file_name, file_path, content_type, document_type, booking_id, traveler_name, qr_code_image_path, qr_code_data")
        .eq("email_id", booking.source_email_id)
        .is("booking_id", null);
      
      unassignedData = (unassigned as Attachment[]) || [];
      setUnassignedAttachments(unassignedData);
    } else {
      setUnassignedAttachments([]);
    }
    
    // Für Rückwärtskompatibilität: kombiniere für detectDocumentTypes
    setAttachments([...(assigned || []) as Attachment[], ...unassignedData]);
  };

  // Detect document types for all PDF attachments using AI vision
  const detectDocumentTypes = async () => {
    const pdfAtts = attachments.filter(a => 
      a.content_type?.includes('pdf') || a.file_name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfAtts.length === 0) {
      toast.info("Keine PDFs zum Analysieren gefunden");
      return;
    }
    
    setIsDetectingDocType(true);
    let successCount = 0;
    let errorCount = 0;
    
    for (const att of pdfAtts) {
      try {
        const { data, error } = await supabase.functions.invoke('extract-ticket-qr', {
          body: { attachment_id: att.id }
        });
        
        if (error) {
          console.error('Error detecting doc type for', att.file_name, error);
          errorCount++;
        } else if (data?.success) {
          successCount++;
        }
      } catch (err) {
        console.error('Exception detecting doc type:', err);
        errorCount++;
      }
    }
    
    // Refresh attachments to show updated document_type
    await fetchAttachments();
    setIsDetectingDocType(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} Dokument(e) analysiert`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} Fehler bei der Analyse`);
    }
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
      const bookingDate = format(parseISO(booking.start_datetime), 'yyyy-MM-dd');
      const nextDay = format(addDays(parseISO(booking.start_datetime), 1), 'yyyy-MM-dd');
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
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 text-center h-full flex flex-col items-center justify-center">
        <Package className="w-8 h-8 text-gray-300 mb-3" />
        <p className="text-sm text-gray-400">
          Wähle eine Buchung aus
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

  const getBookingNumber = () => {
    // Placeholder values that are NOT real booking numbers
    const placeholders = ['reserviert', 'ohne nr.', 'ohne nr', 'pending', 'n/a', 'tba', 'unknown', '-', '–'];
    const isPlaceholder = (val: any) => !val || placeholders.includes(String(val).toLowerCase().trim());
    
    // Priority 1: booking_number if valid
    if (booking.booking_number && !isPlaceholder(booking.booking_number)) {
      return booking.booking_number;
    }
    
    // Priority 2: details.order_number (most reliable for DB tickets)
    if (booking.details?.order_number && !isPlaceholder(booking.details.order_number)) {
      return booking.details.order_number;
    }
    
    // Priority 3: other detail fields
    if (booking.details?.confirmation_number) return booking.details.confirmation_number;
    if (booking.details?.reference) return booking.details.reference;
    if (booking.details?.pnr) return booking.details.pnr;
    if (booking.details?.booking_code) return booking.details.booking_code;
    if (booking.details?.auftragsnummer) return booking.details.auftragsnummer;
    
    // Fallback: return original booking_number even if placeholder (shows something)
    return booking.booking_number || null;
  };

  const bookingNumber = getBookingNumber();

  const getGoogleMapsUrl = () => {
    const address = [
      booking.venue_name,
      booking.venue_address,
      booking.destination_city
    ].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const copyBookingNumber = () => {
    if (bookingNumber) {
      navigator.clipboard.writeText(bookingNumber);
      toast.success("Kopiert");
    }
  };

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

  const getDetail = (...keys: string[]) => {
    for (const key of keys) {
      if (booking.details?.[key] !== undefined && booking.details?.[key] !== null && booking.details?.[key] !== '') {
        return booking.details[key];
      }
    }
    return null;
  };

  const getHotelWebsiteUrl = () => {
    return getDetail('hotel_url', 'website', 'url', 'hotel_website', 'booking_url', 'hotelWebsite');
  };

  const formatTimeDisplay = (datetime: string): string => {
    if (!hasRealTime(datetime)) return "–";
    return format(parseISO(datetime), "HH:mm 'Uhr'", { locale: de });
  };

  // Smart Icon Detail Row Component
  const DetailRow = ({ 
    icon: Icon, 
    iconColor, 
    label, 
    value, 
    valueClassName 
  }: { 
    icon: React.ElementType; 
    iconColor: string; 
    label: string; 
    value: React.ReactNode; 
    valueClassName?: string;
  }) => (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm text-gray-500 flex-1">{label}</span>
      <span className={`text-sm font-medium text-gray-900 text-right ${valueClassName || ''}`}>{value}</span>
    </div>
  );

  // Render train-specific route card - WITH SMART ICONS
  const renderTrainRoute = () => {
    const trainNumber = getDetail('train_number', 'ice_number', 'zugnummer', 'zug');
    const trainClass = getDetail('class', 'klasse', 'wagon_class');
    const wagon = getDetail('wagon', 'wagen', 'car');
    const seat = getDetail('seat', 'sitzplatz', 'seats', 'platz');
    const bahncard = getDetail('bahncard', 'bahncard_type', 'bc');
    const price = getDetail('price', 'preis', 'total_price');
    const connectionType = getDetail('connection_type', 'verbindung', 'verbindungsart');
    const hasTransfer = connectionType?.toLowerCase().includes('umstieg') || connectionType?.toLowerCase().includes('umsteigen');

    return (
      <div className="space-y-4">
        {/* Route Card - Enhanced */}
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50/50 to-white p-5">
          <div className="flex items-start gap-4">
            {/* Timeline - Blue accent */}
            <div className="flex flex-col items-center pt-1">
              <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100" />
              <div className={`w-0.5 ${hasTransfer ? 'h-8' : 'h-14'} bg-gradient-to-b from-blue-400 to-blue-200`} />
              {hasTransfer && (
                <>
                  <div className="w-4 h-4 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center my-1">
                    <RefreshCw className="w-2.5 h-2.5 text-amber-600" />
                  </div>
                  <div className="w-0.5 h-8 bg-gradient-to-b from-blue-200 to-blue-400" />
                </>
              )}
              <div className="w-3 h-3 rounded-full bg-blue-400 ring-4 ring-blue-50" />
            </div>
            
            {/* Route Info */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Abfahrt</div>
                <div className="text-base font-semibold text-gray-900">{booking.origin_city || '–'}</div>
                <div className="text-sm text-gray-500">{formatTimeDisplay(booking.start_datetime)}</div>
              </div>
              {hasTransfer && (
                <div className="flex items-center gap-2 -my-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg w-fit">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">Mit Umstieg</span>
                </div>
              )}
              <div>
                <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Ankunft</div>
                <div className="text-base font-semibold text-gray-900">{booking.destination_city}</div>
                {booking.end_datetime && hasRealTime(booking.end_datetime) && (
                  <div className="text-sm text-gray-500">{formatTimeDisplay(booking.end_datetime)}</div>
                )}
              </div>
            </div>
            
            {/* Train Number Badge */}
            {trainNumber && (
              <div className="px-3 py-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                <span className="font-mono font-bold text-white text-sm">{trainNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Detail List with Smart Icons */}
        {(trainClass || wagon || seat || bahncard || price) && (
          <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden bg-white">
            {trainClass && (
              <DetailRow 
                icon={Crown} 
                iconColor="bg-amber-100 text-amber-600" 
                label="Klasse" 
                value={<span className="flex items-center gap-1.5">{trainClass}. Klasse {trainClass === '1' && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}</span>}
              />
            )}
            {wagon && (
              <DetailRow 
                icon={Train} 
                iconColor="bg-blue-100 text-blue-600" 
                label="Wagen" 
                value={wagon}
              />
            )}
            {seat && (
              <DetailRow 
                icon={Armchair} 
                iconColor="bg-violet-100 text-violet-600" 
                label="Sitzplatz" 
                value={seat}
              />
            )}
            {bahncard && (
              <DetailRow 
                icon={CreditCard} 
                iconColor="bg-red-100 text-red-600" 
                label="BahnCard" 
                value={bahncard}
              />
            )}
            {price && (
              <DetailRow 
                icon={Euro} 
                iconColor="bg-emerald-100 text-emerald-600" 
                label="Preis" 
                value={typeof price === 'number' ? `${price.toFixed(2)} €` : price}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  // Render flight-specific route card - MONOCHROME
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
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center pt-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <div className="w-0.5 h-14 bg-gray-200" />
              <div className="w-2 h-2 rounded-full bg-gray-400" />
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Abflug</div>
                <div className="text-base font-medium text-gray-900">{booking.origin_city || '–'}</div>
                <div className="text-sm text-gray-500">{formatTimeDisplay(booking.start_datetime)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Ankunft</div>
                <div className="text-base font-medium text-gray-900">{booking.destination_city}</div>
                {booking.end_datetime && hasRealTime(booking.end_datetime) && (
                  <div className="text-sm text-gray-500">{formatTimeDisplay(booking.end_datetime)}</div>
                )}
              </div>
            </div>
            
            {flightNumber && (
              <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                <span className="font-mono font-semibold text-gray-700 text-sm">{flightNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Detail List with Smart Icons */}
        {(airline || terminal || gate || seat || baggage) && (
          <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden bg-white">
            {airline && (
              <DetailRow 
                icon={Plane} 
                iconColor="bg-violet-100 text-violet-600" 
                label="Airline" 
                value={airline}
              />
            )}
            {terminal && (
              <DetailRow 
                icon={Building2} 
                iconColor="bg-gray-100 text-gray-600" 
                label="Terminal" 
                value={terminal}
              />
            )}
            {gate && (
              <DetailRow 
                icon={DoorOpen} 
                iconColor="bg-blue-100 text-blue-600" 
                label="Gate" 
                value={gate}
              />
            )}
            {seat && (
              <DetailRow 
                icon={Armchair} 
                iconColor="bg-amber-100 text-amber-600" 
                label="Sitzplatz" 
                value={seat}
              />
            )}
            {baggage && (
              <DetailRow 
                icon={Luggage} 
                iconColor="bg-emerald-100 text-emerald-600" 
                label="Gepäck" 
                value={baggage}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  // Render hotel-specific details - WITH SMART ICONS
  const renderHotelDetails = () => {
    const roomType = getDetail('room_type', 'room_category', 'zimmer', 'zimmerkategorie');
    const roomNumber = getDetail('room_number', 'zimmernummer');
    const breakfast = getDetail('breakfast_included', 'breakfast', 'fruehstueck');
    const wifi = getDetail('wifi_included', 'wifi', 'wlan');
    const pricePerNight = getDetail('price_per_night', 'preis_pro_nacht');
    const cancellation = getDetail('cancellation_policy', 'stornierung', 'cancellation_deadline');
    const parking = getDetail('parking', 'parkplatz');
    const nights = booking.end_datetime && booking.start_datetime 
      ? Math.ceil((new Date(booking.end_datetime).getTime() - new Date(booking.start_datetime).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const hasDetails = roomType || roomNumber || breakfast !== null || wifi !== null || pricePerNight || cancellation || parking;
    if (!hasDetails) return null;

    return (
      <div className="space-y-4">
        {/* Amenities Quick Pills */}
        <div className="flex flex-wrap gap-2">
          {breakfast && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200">
              <Coffee className="w-4 h-4" />
              Frühstück inkl.
            </span>
          )}
          {wifi && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
              <Wifi className="w-4 h-4" />
              WLAN inkl.
            </span>
          )}
          {parking && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
              <ParkingCircle className="w-4 h-4" />
              Parkplatz
            </span>
          )}
          {nights && nights > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-sm font-medium border border-violet-200">
              <Moon className="w-4 h-4" />
              {nights} {nights === 1 ? 'Nacht' : 'Nächte'}
            </span>
          )}
        </div>

        {/* Detail List with Icons */}
        <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden bg-white">
          {roomType && (
            <DetailRow 
              icon={Bed} 
              iconColor="bg-violet-100 text-violet-600" 
              label="Zimmertyp" 
              value={roomType}
            />
          )}
          {roomNumber && (
            <DetailRow 
              icon={DoorOpen} 
              iconColor="bg-gray-100 text-gray-600" 
              label="Zimmernummer" 
              value={roomNumber}
            />
          )}
          {pricePerNight && (
            <DetailRow 
              icon={Euro} 
              iconColor="bg-emerald-100 text-emerald-600" 
              label="Preis/Nacht" 
              value={typeof pricePerNight === 'number' ? `${pricePerNight.toFixed(2)} €` : pricePerNight}
            />
          )}
          {cancellation && (
            <DetailRow 
              icon={CalendarX} 
              iconColor="bg-red-100 text-red-600" 
              label="Stornierung" 
              value={cancellation}
              valueClassName="max-w-[55%] truncate"
            />
          )}
        </div>
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
      <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
        {detailEntries.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
            <span className="text-sm font-medium text-gray-900">
              {typeof value === 'boolean' ? (value ? 'Ja' : 'Nein') : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Render travelers - MONOCHROME
  const renderTravelers = () => {
    const travelers = getTravelers();
    if (travelers.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="text-xs text-gray-400 uppercase tracking-wide">Reisende</div>
        <div className="space-y-2">
          {travelers.map((name, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{name}</div>
                {booking.details?.traveler_bookings?.[name] && (
                  <div className="text-xs text-gray-400 font-mono">
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

  // Get PDF attachments for ticket display - NUR zugeordnete Anhänge!
  const pdfAttachments = assignedAttachments.filter(a => a.content_type?.includes('pdf'));
  const unassignedPdfAttachments = unassignedAttachments.filter(a => a.content_type?.includes('pdf'));

  return (
    <div>
      <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${isMobile ? 'rounded-t-2xl rounded-b-none' : ''}`}>
        {/* Header - Clean */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <TypeIcon className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {booking.venue_name || booking.destination_city}
                </h3>
                {booking.booking_type === 'hotel' && getHotelWebsiteUrl() ? (
                  <a 
                    href={getHotelWebsiteUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Website
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
                className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => window.open(generateGoogleCalendarUrl(), '_blank')}
                title="Zu Google Calendar hinzufügen"
                className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Calendar className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[60vh] lg:max-h-none overflow-y-auto">
          {/* TICKET FIRST - Most important for travelers! */}
          {booking.booking_type === 'train' && (
            <>
              {/* Ticket/Reservation PDF - Dynamic label based on document type */}
              {pdfAttachments.length > 0 ? (
                <div className="space-y-2">
                  {pdfAttachments.map(att => {
                    // Determine document type from booking details, attachment, file name, or price
                    const docType = booking.details?.document_type || att.document_type;
                    const hasZeroPrice = !booking.details?.total_amount || booking.details?.total_amount === 0;
                    const hasSeatInfo = booking.details?.wagon || booking.details?.seat || booking.details?.coach;
                    
                    const isReservation = 
                      docType === 'seat_reservation' ||
                      att.file_name.toLowerCase().includes('reservierung') ||
                      att.file_name.toLowerCase().includes('reservation') ||
                      att.file_name.toLowerCase().includes('sitzplatz') ||
                      (hasZeroPrice && hasSeatInfo); // Preis 0 + Sitzplatz = Reservierung
                    
                    const documentLabel = isReservation ? 'Sitzplatzreservierung' : 'Fahrkarte';
                    const buttonLabel = isReservation ? 'Reservierung anzeigen' : 'Ticket anzeigen';
                    
                    // Get QR code as thumbnail preview
                    const qrPreview = att.qr_code_image_path 
                      ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/qr-codes/${att.qr_code_image_path}`
                      : null;
                    
                    return (
                      <div key={att.id}>
                        <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">{documentLabel}</div>
                        <button
                          onClick={() => setViewingDocument(att)}
                          className="flex items-center gap-4 w-full p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 hover:border-blue-300 transition-all text-left group"
                        >
                          {/* PDF Thumbnail Preview */}
                          <div className="relative w-14 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:shadow-md transition-shadow">
                            {qrPreview ? (
                              <img 
                                src={qrPreview} 
                                alt="Ticket-Vorschau" 
                                className="w-full h-full object-cover opacity-90"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <>
                                <Ticket className="w-6 h-6 text-blue-500" />
                                <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 bg-blue-500 rounded text-[8px] font-bold text-white">
                                  PDF
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                              {buttonLabel}
                              <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-sm text-gray-500 truncate">{att.file_name}</div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-blue-300 group-hover:text-blue-500 transition-colors" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <div className="text-sm text-amber-700">
                    Kein Ticket-PDF verfügbar
                  </div>
                </div>
              )}
            </>
          )}

          {/* Booking Number */}
          {bookingNumber && (
            <button 
              onClick={copyBookingNumber}
              className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">
                  {booking.booking_type === 'train' ? 'Auftragsnummer' : 'Buchungsnummer'}
                </div>
                <div className="font-mono font-semibold text-gray-900 text-lg">{bookingNumber}</div>
              </div>
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {/* Type-specific route/details */}
          {booking.booking_type === 'train' && renderTrainRoute()}
          
          {booking.booking_type === 'flight' && (
            <>
              {renderFlightRoute()}
              {/* Flight Ticket PDF */}
              {pdfAttachments.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Flugticket</div>
                {pdfAttachments.map(att => {
                  const labelText = att.document_type === 'seat_reservation' 
                    ? 'Reservierung anzeigen' 
                    : 'Ticket anzeigen';
                  return (
                    <button
                      key={att.id}
                      onClick={() => setViewingDocument(att)}
                      className="flex items-center gap-4 w-full p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{labelText}</div>
                        <div className="text-sm text-gray-500 truncate">{att.file_name}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
                  );
                })}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    Kein Ticket-PDF verfügbar
                  </div>
                </div>
              )}
            </>
          )}
          
          {booking.booking_type === 'hotel' && (
            <>
              {/* Hotel Date Info */}
              <div className="rounded-xl border border-gray-200 p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Check-in</div>
                    <div className="text-base font-medium text-gray-900">
                      {format(parseISO(booking.start_datetime), "d. MMM", { locale: de })}
                    </div>
                    <div className="text-sm text-gray-500">{formatTimeDisplay(booking.start_datetime)}</div>
                  </div>
                  {booking.end_datetime && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Check-out</div>
                      <div className="text-base font-medium text-gray-900">
                        {format(parseISO(booking.end_datetime), "d. MMM", { locale: de })}
                      </div>
                      <div className="text-sm text-gray-500">{formatTimeDisplay(booking.end_datetime)}</div>
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
              <div className="space-y-2">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Zeitraum</div>
                <div className="text-sm">
                  <div className="text-gray-900">
                    {format(parseISO(booking.start_datetime), "EEEE, d. MMMM yyyy", { locale: de })}
                    {hasRealTime(booking.start_datetime) && (
                      <span className="text-gray-500"> um {format(parseISO(booking.start_datetime), "HH:mm 'Uhr'", { locale: de })}</span>
                    )}
                  </div>
                  {booking.end_datetime && (
                    <div className="mt-1 text-gray-500">
                      bis{' '}
                      <span className="text-gray-900">
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
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">In Verbindung mit</div>
              <div className="text-gray-900 font-medium">{relatedEvent.title}</div>
              <div className="text-sm text-gray-500">
                {relatedEvent.venue_name || relatedEvent.location}, {format(parseISO(relatedEvent.start_time), "HH:mm 'Uhr'", { locale: de })}
              </div>
            </div>
          )}

          {/* Location */}
          {(booking.venue_address || (booking.booking_type === 'hotel' && booking.destination_city)) && (
            <>
              <Separator className="bg-gray-100" />
              <div className="space-y-2">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Adresse</div>
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm text-gray-600 flex-1">
                    {booking.venue_address || booking.destination_city}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getGoogleMapsUrl(), '_blank')}
                    className="flex-shrink-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100 h-8 px-3"
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
              <Separator className="bg-gray-100" />
              <div className="space-y-1">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Anbieter</div>
                <div className="text-sm font-medium text-gray-900">{booking.provider}</div>
              </div>
            </>
          )}

          {/* Travelers */}
          {getTravelers().length > 0 && (
            <>
              <Separator className="bg-gray-100" />
              {renderTravelers()}
            </>
          )}

          {/* Attachments (non-PDF or if not train/flight) - NUR zugeordnete Anhänge */}
          {(assignedAttachments.filter(att => !['train', 'flight'].includes(booking.booking_type) || !att.content_type?.includes('pdf')).length > 0 || originalEmail) && (
            <>
              <Separator className="bg-gray-100" />
              <div className="space-y-3">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Dokumente</div>
                <div className="space-y-2">
                  {originalEmail && (
                    <button
                      onClick={() => setViewingDocument({ 
                        id: "email", 
                        file_name: originalEmail.subject || "Original E-Mail",
                        file_path: "",
                        content_type: "text/html"
                      })}
                      className="flex items-center gap-3 w-full p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900 text-sm">Original E-Mail</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{originalEmail.subject}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                  {assignedAttachments
                    .filter(att => !['train', 'flight'].includes(booking.booking_type) || !att.content_type?.includes('pdf'))
                    .map((att) => (
                    <button
                      key={att.id}
                      onClick={() => setViewingDocument(att)}
                      className="flex items-center gap-3 w-full p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900 text-sm truncate max-w-[200px]">{att.file_name}</div>
                        <div className="text-xs text-gray-500">{att.content_type || 'Dokument'}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Unzugeordnete Anhänge aus derselben E-Mail (Collapsible) */}
          {unassignedAttachments.length > 0 && (
            <>
              <Separator className="bg-gray-100" />
              <div className="space-y-2">
                <button
                  onClick={() => setShowUnassignedAttachments(!showUnassignedAttachments)}
                  className="flex items-center gap-2 text-sm w-full group"
                >
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-amber-600 uppercase tracking-wide group-hover:text-amber-700 transition-colors">
                    Weitere Anhänge aus dieser E-Mail ({unassignedAttachments.length})
                  </span>
                  {showUnassignedAttachments ? (
                    <ChevronUp className="w-4 h-4 ml-auto text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
                  )}
                </button>
                {showUnassignedAttachments && (
                  <div className="space-y-2 pt-2 pl-6 border-l-2 border-amber-200">
                    <div className="text-xs text-gray-500 mb-2">
                      Diese Anhänge wurden noch keiner Buchung zugeordnet
                    </div>
                    {unassignedAttachments.map((att) => (
                      <button
                        key={att.id}
                        onClick={() => setViewingDocument(att)}
                        className="flex items-center gap-3 w-full p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 text-sm truncate max-w-[200px]">{att.file_name}</div>
                          <div className="text-xs text-amber-600">
                            {att.traveler_name ? `Reisender: ${att.traveler_name}` : 'Reisender unbekannt'}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Version History */}
          {versions.length > 0 && (
            <>
              <Separator className="bg-gray-100" />
              <div className="space-y-2">
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className="flex items-center gap-2 text-sm w-full group"
                >
                  <History className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wide group-hover:text-gray-600 transition-colors">
                    Versionen ({versions.length})
                  </span>
                  {showVersions ? (
                    <ChevronUp className="w-4 h-4 ml-auto text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
                  )}
                </button>
                {showVersions && (
                  <div className="space-y-3 pt-2">
                    {versions.map((version) => (
                      <div key={version.id} className="text-sm border-l-2 border-gray-200 pl-3 py-1">
                        <div className="font-medium text-gray-900">Version {version.version_number}</div>
                        <div className="text-gray-400 text-xs">
                          {format(parseISO(version.created_at), "d. MMM yyyy, HH:mm", { locale: de })}
                        </div>
                        {version.change_summary && (
                          <div className="mt-1 text-gray-500">{version.change_summary}</div>
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
            <div className="pt-2 flex items-center gap-2 text-xs text-gray-400">
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