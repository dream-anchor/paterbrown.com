import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Share2,
  Copy,
  Check,
  Train,
  Plane,
  Hotel,
  Car,
  Theater,
  Film,
  MapPin,
  User,
  MoreHorizontal,
  Grid3X3,
  LayoutList,
  Pencil,
  Trash2,
  Link2,
  List,
  Download,
  FileUp,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuickAddEventModal from "./QuickAddEventModal";
import CalendarEventDetail from "./CalendarEventDetail";
import EventTimeline from "./EventTimeline";
import EventFilterPanel from "./EventFilterPanel";
import CalendarExport from "./CalendarExport";
import EventUploader from "./EventUploader";
import SwipeableCard from "./SwipeableCard";
import MobileAgendaView from "./MobileAgendaView";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";

// Types
export interface CalendarEntry {
  id: string;
  title: string;
  type: "travel" | "tour" | "theater" | "filming" | "private" | "meeting" | "other";
  category: "travel" | "tour" | "manual";
  start: Date;
  end?: Date;
  allDay?: boolean;
  color: string;
  textColor: string;
  icon: typeof Train;
  location?: string;
  tourIndex?: number; // For tour events: their chronological position
  isOptioned?: boolean; // Optioniert status
  isCancelled?: boolean; // Cancelled status
  metadata?: {
    booking_type?: string;
    origin_city?: string;
    destination_city?: string;
    booking_number?: string;
    provider?: string;
    venue_name?: string;
    venue_address?: string;
    venue_phone?: string;
    venue_email?: string;
    venue_url?: string;
    source?: string;
    description?: string;
    qr_code_url?: string;
    event_status?: string;
    tour_source?: string;
  };
}

interface TravelBooking {
  id: string;
  booking_type: string;
  start_datetime: string;
  end_datetime?: string;
  origin_city?: string;
  destination_city: string;
  provider?: string;
  booking_number?: string;
  venue_name?: string;
  qr_code_url?: string;
}

interface AdminEvent {
  id: string;
  title: string;
  location: string;
  state?: string;
  venue_name?: string;
  venue_address?: string;
  venue_phone?: string;
  venue_email?: string;
  venue_url?: string;
  start_time: string;
  end_time?: string;
  note?: string;
  source: "KL" | "KBA" | "unknown";
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  event_type: string;
  tour_source?: string | null;
  event_status?: string | null;
  start_datetime: string;
  end_datetime?: string | null;
  location?: string | null;
  color?: string | null;
  all_day?: boolean | null;
}

interface FullCalendarProps {
  onNavigateToTravel?: (bookingId: string) => void;
  onNavigateToTour?: (eventId: string) => void;
  onEventsAdded?: () => void;
  refreshTrigger?: number;
}

// Color schemes for different event types
const eventColors: Record<string, { bg: string; text: string; border: string }> = {
  // Reisen = Blau
  travel: { bg: "bg-blue-500", text: "text-blue-700", border: "border-blue-200" },
  train: { bg: "bg-blue-500", text: "text-blue-700", border: "border-blue-200" },
  flight: { bg: "bg-blue-400", text: "text-blue-700", border: "border-blue-200" },
  hotel: { bg: "bg-blue-600", text: "text-blue-700", border: "border-blue-200" },
  rental_car: { bg: "bg-blue-300", text: "text-blue-700", border: "border-blue-200" },
  // Tour Landgraf (KL) = Orange
  tour_KL: { bg: "bg-yellow-500", text: "text-yellow-700", border: "border-yellow-200" },
  // Tour KBA = Grün
  tour_KBA: { bg: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-200" },
  tour: { bg: "bg-gray-500", text: "text-gray-700", border: "border-gray-200" }, // unknown source
  // Optioniert = Orange
  optioniert: { bg: "bg-orange-500", text: "text-orange-700", border: "border-orange-200" },
  theater: { bg: "bg-red-600", text: "text-red-700", border: "border-red-200" },
  filming: { bg: "bg-purple-500", text: "text-purple-700", border: "border-purple-200" },
  meeting: { bg: "bg-amber-500", text: "text-amber-700", border: "border-amber-200" },
  private: { bg: "bg-green-500", text: "text-green-700", border: "border-green-200" },
  other: { bg: "bg-gray-400", text: "text-gray-600", border: "border-gray-200" },
};

const getEventIcon = (type: string, bookingType?: string): typeof Train => {
  if (bookingType) {
    switch (bookingType) {
      case "train": return Train;
      case "flight": return Plane;
      case "hotel": return Hotel;
      case "rental_car": return Car;
    }
  }
  switch (type) {
    case "travel": return Train;
    case "tour": return MapPin;
    case "theater": return Theater;
    case "filming": return Film;
    case "private": return User;
    case "meeting": return User;
    default: return Calendar;
  }
};

const FullCalendar = ({ onNavigateToTravel, onNavigateToTour, onEventsAdded, refreshTrigger }: FullCalendarProps) => {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize currentDate from URL parameter or today
  const getInitialDate = () => {
    const monthParam = searchParams.get("month");
    if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number);
      if (year && month) {
        return new Date(year, month - 1, 1);
      }
    }
    return new Date();
  };
  
  const [currentDate, setCurrentDate] = useState(getInitialDate);
  const [copied, setCopied] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEntry | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "cards" | "timeline">("calendar");
  const [filteredEntries, setFilteredEntries] = useState<CalendarEntry[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Data states
  const [travelBookings, setTravelBookings] = useState<TravelBooking[]>([]);
  const [adminEvents, setAdminEvents] = useState<AdminEvent[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  // Status badge helper
  const getEventStatus = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = eventDay.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: "Vergangen", color: "bg-gray-200 text-gray-500", pulse: false, isPast: true };
    if (diffDays === 0) return { label: "Heute", color: "bg-yellow-400 text-yellow-900", pulse: true, isPast: false };
    if (diffDays === 1) return { label: "Morgen", color: "bg-blue-100 text-blue-700", pulse: false, isPast: false };
    if (diffDays <= 7) return { label: "Diese Woche", color: "bg-green-100 text-green-700", pulse: false, isPast: false };
    return null;
  };

  // Calendar feed URL
  const calendarFeedUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendar-feed`;

  // Sync currentDate to URL when it changes
  useEffect(() => {
    const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    const currentTab = searchParams.get("tab") || "calendar";
    // Only update if we're on calendar tab and month changed
    if (currentTab === "calendar") {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("month", monthStr);
      setSearchParams(newParams, { replace: true });
    }
  }, [currentDate]);

  // Load all data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, eventsRes, calEventsRes] = await Promise.all([
        supabase.from("travel_bookings").select("*").is("deleted_at", null).order("start_datetime"),
        supabase.from("admin_events").select("*").is("deleted_at", null).order("start_time"),
        supabase.from("calendar_events").select("*").is("deleted_at", null).order("start_datetime"),
      ]);

      if (bookingsRes.data) setTravelBookings(bookingsRes.data);
      if (eventsRes.data) setAdminEvents(eventsRes.data);
      if (calEventsRes.data) setCalendarEvents(calEventsRes.data);
    } catch (error) {
      console.error("Error loading calendar data:", error);
      toast({
        title: "Fehler",
        description: "Kalenderdaten konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Reload when parent data changes (e.g. edits in EventMap)
  const refreshRef = useRef(refreshTrigger);
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger !== refreshRef.current) {
      refreshRef.current = refreshTrigger;
      loadData();
    }
  }, [refreshTrigger]);

  // Combine all events into unified CalendarEntry format
  const allEntries = useMemo((): CalendarEntry[] => {
    const entries: CalendarEntry[] = [];

    // Travel bookings
    travelBookings.forEach((booking) => {
      const colorKey = booking.booking_type || "travel";
      const colors = eventColors[colorKey] || eventColors.travel;
      
      let title = "";
      if (booking.booking_type === "train" || booking.booking_type === "flight") {
        title = `${booking.origin_city || "?"} → ${booking.destination_city}`;
      } else if (booking.booking_type === "hotel") {
        title = booking.venue_name || booking.destination_city;
      } else {
        title = booking.destination_city;
      }

      entries.push({
        id: booking.id,
        title,
        type: "travel",
        category: "travel",
        start: new Date(booking.start_datetime),
        end: booking.end_datetime ? new Date(booking.end_datetime) : undefined,
        color: colors.bg,
        textColor: colors.text,
        icon: getEventIcon("travel", booking.booking_type),
        location: booking.destination_city,
        metadata: {
          booking_type: booking.booking_type,
          origin_city: booking.origin_city,
          destination_city: booking.destination_city,
          booking_number: booking.booking_number,
          provider: booking.provider,
          venue_name: booking.venue_name,
          qr_code_url: booking.qr_code_url,
        },
      });
    });

    // Admin events (tour dates) - sorted by date to calculate tour index
    const sortedAdminEvents = [...adminEvents].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    
    sortedAdminEvents.forEach((event, index) => {
      // Get color based on source
      const colorKey = event.source === "KL" ? "tour_KL" : 
                       event.source === "KBA" ? "tour_KBA" : "tour";
      const colors = eventColors[colorKey];
      const tourIndex = index + 1; // 1-based tour station number
      
      entries.push({
        id: event.id,
        title: `#${tourIndex} ${event.location}`,
        type: "tour",
        category: "tour",
        start: new Date(event.start_time),
        end: event.end_time ? new Date(event.end_time) : undefined,
        color: colors.bg,
        textColor: colors.text,
        icon: MapPin,
        location: event.state ? `${event.location} (${event.state})` : event.location,
        tourIndex,
        metadata: {
          venue_name: event.venue_name,
          venue_address: event.venue_address,
          venue_phone: event.venue_phone,
          venue_email: event.venue_email,
          venue_url: event.venue_url,
          source: event.source,
          description: event.note,
        },
      });
    });

    // Manual calendar events
    calendarEvents.forEach((event) => {
      // Determine color based on event_type and tour_source
      let colorKey = event.event_type || "other";
      if (event.event_type === "tour" && event.tour_source) {
        colorKey = event.tour_source === "KL" ? "tour_KL" : "tour_KBA";
      }
      
      const colors = eventColors[colorKey] || eventColors.other;
      const isOptioned = event.event_status === "optioniert";
      const isCancelled = event.event_status === "cancelled";
      
      entries.push({
        id: event.id,
        title: event.title,
        type: event.event_type as CalendarEntry["type"],
        category: "manual",
        start: new Date(event.start_datetime),
        end: event.end_datetime ? new Date(event.end_datetime) : undefined,
        allDay: event.all_day,
        color: isCancelled ? "bg-gray-400" : colors.bg,
        textColor: isCancelled ? "text-gray-500" : colors.text,
        icon: getEventIcon(event.event_type),
        location: event.location,
        isOptioned,
        isCancelled,
        metadata: {
          description: event.description,
          event_status: event.event_status,
          tour_source: event.tour_source,
          source: event.tour_source, // For compatibility
        },
      });
    });

    return entries.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [travelBookings, adminEvents, calendarEvents]);

  // Sorted entries for card view - use filtered entries if available, otherwise all entries
  const displayEntries = filteredEntries.length > 0 || allEntries.length === 0 ? filteredEntries : allEntries;
  
  const sortedEntries = useMemo(() => {
    const now = new Date();
    const upcoming = displayEntries.filter(e => e.start >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    const past = displayEntries.filter(e => e.start < now)
      .sort((a, b) => b.start.getTime() - a.start.getTime());
    return [...upcoming, ...past];
  }, [displayEntries]);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link kopiert" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  const dayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;
    return { daysInMonth, startDayOfWeek };
  };

  const { daysInMonth, startDayOfWeek } = getDaysInMonth(currentDate);

  const entriesByDate = useMemo(() => {
    const map: Record<string, CalendarEntry[]> = {};
    allEntries.forEach((entry) => {
      const dateStr = entry.start.toISOString().split("T")[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(entry);
    });
    return map;
  }, [allEntries]);

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleQuickAdd = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setQuickAddDate(date);
    setShowQuickAdd(true);
  };

  const handleEventClick = (entry: CalendarEntry) => {
    setSelectedEvent(entry);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Berlin",
    });
  };

  const today = new Date();

  // Calculate total events this month
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const eventsThisMonth = allEntries.filter(e => e.start >= monthStart && e.start <= monthEnd).length;

  // Convert entries to searchable items (must be before early return)
  const searchableItems = useMemo(() => {
    return allEntries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      type: entry.category as "tour" | "travel" | "calendar",
      location: entry.location,
      venueName: entry.metadata?.venue_name,
      provider: entry.metadata?.provider,
      bookingType: entry.metadata?.booking_type,
      date: entry.start,
      source: entry.metadata?.source,
    }));
  }, [allEntries]);

  const handleSearchSelect = (item: { id: string; type: string }) => {
    const entry = allEntries.find((e) => e.id === item.id);
    if (entry) {
      setSelectedEvent(entry);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/30">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1 border-2 border-amber-500/30 border-t-amber-500 rounded-2xl"
            />
          </div>
          <span className="text-sm text-gray-500 font-medium">Lade Kalender...</span>
        </motion.div>
      </div>
    );
  }

  // Event Card Component for card view
  const EventCard = ({ entry, onSwipeEdit, onSwipeDelete }: { 
    entry: CalendarEntry; 
    onSwipeEdit?: () => void;
    onSwipeDelete?: () => void;
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const status = getEventStatus(entry.start);
    const isPast = status?.isPast || false;
    const Icon = entry.icon;

    const handleCopyLink = (e: React.MouseEvent) => {
      e.stopPropagation();
      const link = `${window.location.origin}/admin?tab=map&activeEventId=${entry.id}`;
      navigator.clipboard.writeText(link);
      toast({ title: "Link kopiert" });
    };

    const handleDelete = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      // For now just show a toast - actual delete would need confirmation
      toast({ title: "Löschen wird noch implementiert", variant: "destructive" });
    };

    const handleEdit = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setSelectedEvent(entry);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        onClick={() => handleEventClick(entry)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative p-4 rounded-2xl border cursor-pointer transition-all duration-300",
          isPast 
            ? "bg-gray-50 border-gray-200" 
            : "bg-white border-gray-200/60 hover:border-amber-300/50 hover:shadow-xl hover:shadow-amber-500/10"
        )}
      >
        {/* Source Icon - links oben */}
        <div className="absolute top-3 left-3 flex items-center gap-1">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg",
            entry.color,
            entry.isOptioned && "opacity-60"
          )}>
            {entry.metadata?.source === "KL" ? "KL" : entry.metadata?.source === "KBA" ? "KBA" : <Icon className="w-5 h-5" />}
          </div>
          {/* Premium Optioniert Badge with glassmorphism */}
          {entry.isOptioned && (
            <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full bg-orange-100/80 backdrop-blur-sm text-orange-700 border border-orange-200/50">
              Optioniert
            </span>
          )}
          {entry.isCancelled && (
            <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full bg-gray-100/80 backdrop-blur-sm text-gray-600 border border-gray-200/50">
              Abgesagt
            </span>
          )}
        </div>
        
        {/* Status Badge - rechts oben (hide when hovered for quick actions) */}
        {status && !isHovered && !entry.isOptioned && !entry.isCancelled && (
          <div className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-medium rounded-full
            ${status.color} ${status.pulse ? "animate-pulse" : ""}`}>
            {status.label}
          </div>
        )}
        
        {/* Quick Actions - bei Hover rechts oben */}
        {isHovered && !isPast && (
          <div className="absolute top-3 right-3 flex gap-1">
            <button 
              onClick={handleEdit}
              className="p-1.5 rounded-md bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button 
              onClick={handleCopyLink}
              className="p-1.5 rounded-md bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Link2 className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button 
              onClick={handleDelete}
              className="p-1.5 rounded-md bg-white shadow-sm border border-gray-200 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={`mt-8 ${isPast ? "opacity-60" : ""}`}>
          {/* Titel */}
          <h3 className={`font-semibold text-gray-900 text-base mb-1 truncate ${isPast ? "line-through" : ""}`}>
            {entry.title}
          </h3>
          
          {/* Datum + Zeit */}
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium">
              {format(entry.start, "EEEE, d. MMMM yyyy", { locale: de })}
            </span>
            {!entry.allDay && (
              <span className="text-amber-600 font-semibold">
                {format(entry.start, "HH:mm", { locale: de })} Uhr
              </span>
            )}
          </div>
          
          {/* Location */}
          {entry.location && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{entry.location}</span>
            </div>
          )}
          
          {/* Venue */}
          {entry.metadata?.venue_name && (
            <p className="text-xs text-gray-400 mt-1 ml-6 truncate">
              {entry.metadata.venue_name}
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">

      {/* Filter Panel */}
      <EventFilterPanel
        entries={allEntries}
        onFilterChange={setFilteredEntries}
        totalCount={allEntries.length}
        filteredCount={displayEntries.length}
      />
      
      {/* Calendar Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left side: Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="apple" size="sm" onClick={goToToday} className="rounded-lg text-xs sm:text-sm min-h-[44px]">
            Heute
          </Button>
          <div className="flex items-center">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <h2 className="text-base sm:text-xl font-semibold text-gray-800 ml-1 sm:ml-2">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>

        {/* Right side: Actions - stacked on mobile */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Toggle - Desktop */}
          <div className="hidden sm:flex items-center gap-0.5 bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setViewMode("calendar")}
              className={`p-2 rounded-md transition-colors
                ${viewMode === "calendar" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              title="Kalender-Ansicht"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2 rounded-md transition-colors
                ${viewMode === "cards" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              title="Karten-Ansicht"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`p-2 rounded-md transition-colors
                ${viewMode === "timeline" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              title="Timeline-Ansicht"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Event count badge */}
          <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">{eventsThisMonth} Termine</span>
          
          {/* Quick Add Button */}
          <Button variant="apple" size="sm" onClick={() => { setQuickAddDate(new Date()); setShowQuickAdd(true); }} className="text-xs sm:text-sm">
            <Plus className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Termin</span>
          </Button>
          
          {/* More Actions Dropdown - combines Import & Share on mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="apple" size="sm" className="rounded-lg">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onClick={() => setShowImportModal(true)} className="cursor-pointer">
                <FileUp className="w-4 h-4 mr-2" />
                <div className="flex flex-col">
                  <span className="font-medium">Termine importieren</span>
                  <span className="text-xs text-gray-500">Aus Excel oder Text</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowExportModal(true)} className="cursor-pointer">
                <Download className="w-4 h-4 mr-2" />
                <div className="flex flex-col">
                  <span className="font-medium">Exportieren</span>
                  <span className="text-xs text-gray-500">iCal, CSV, PDF oder Google</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyToClipboard(calendarFeedUrl)} className="cursor-pointer">
                {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                <div className="flex flex-col">
                  <span className="font-medium">iCal-Link kopieren</span>
                  <span className="text-xs text-gray-500">Für Apple Kalender, Outlook</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.open(`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendarFeedUrl)}`, '_blank')} 
                className="cursor-pointer"
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium">Google Kalender öffnen</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Export Modal */}
          <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Kalender exportieren</DialogTitle>
              </DialogHeader>
              <CalendarExport 
                events={adminEvents.map(e => ({
                  id: e.id,
                  title: e.title,
                  location: e.location,
                  venue_name: e.venue_name,
                  start_time: e.start_time,
                  end_time: e.end_time,
                  note: e.note,
                  source: e.source,
                }))}
              />
            </DialogContent>
          </Dialog>
          
          {/* Import Modal */}
          <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Termine importieren</DialogTitle>
              </DialogHeader>
              <EventUploader onEventsAdded={() => {
                loadData();
                onEventsAdded?.();
                setShowImportModal(false);
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Grid View - Hidden on mobile, show Agenda instead */}
      {viewMode === "calendar" && !isMobile && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-lg shadow-gray-200/50"
        >
          {/* Premium Day Names Header */}
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[140px] border-r border-b border-gray-100 bg-gray-50/30" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEntries = entriesByDate[dateStr] || [];
              const isToday = today.toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
              const isWeekend = (startDayOfWeek + i) % 7 >= 5;
              const isHovered = hoveredDay === day;

              return (
                <div
                  key={day}
                  className={`min-h-[140px] border-r border-b border-gray-100 p-1 relative group ${isWeekend ? "bg-gray-50/50" : ""}`}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-1 px-1">
                    <span className={`w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full
                      ${isToday ? "bg-amber-500 text-white" : "text-gray-700"}`}>
                      {day}
                    </span>
                    
                    {/* Quick Add Button */}
                    <button
                      onClick={() => handleQuickAdd(day)}
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all
                        ${isHovered ? "opacity-100" : "opacity-0"}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Event Badges */}
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEntries.slice(0, 4).map((entry) => {
                      const EntryIcon = entry.icon;
                      return (
                        <button
                          key={entry.id}
                          onClick={() => handleEventClick(entry)}
                          className={`w-full px-1.5 py-1 rounded text-[10px] font-medium text-white truncate flex items-center gap-1 min-h-[24px]
                            ${entry.color} hover:opacity-90 transition-opacity text-left
                            ${entry.isOptioned ? "opacity-60 border border-dashed border-white/50" : ""}
                            ${entry.isCancelled ? "line-through opacity-50" : ""}`}
                          title={`${formatTime(entry.start)} ${entry.title}${entry.isOptioned ? " (Optioniert)" : ""}${entry.isCancelled ? " (Abgesagt)" : ""}`}
                        >
                          <EntryIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {entry.allDay ? "" : `${formatTime(entry.start)} `}
                            {entry.title}
                          </span>
                          {entry.isOptioned && <span className="text-[8px]">?</span>}
                        </button>
                      );
                    })}
                    {dayEntries.length > 4 && (
                      <button
                        onClick={() => {
                          setSelectedEvent(dayEntries[0]);
                        }}
                        className="text-[10px] text-gray-500 font-medium pl-1.5 hover:text-gray-700"
                      >
                        +{dayEntries.length - 4} weitere
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Mobile Agenda View - Shows when calendar mode is selected on mobile */}
      {viewMode === "calendar" && isMobile && (
        <MobileAgendaView 
          entries={sortedEntries}
          onEventClick={handleEventClick}
          onRefresh={loadData}
        />
      )}

      {/* Cards View */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEntries.map((entry) => {
            const isPast = getEventStatus(entry.start)?.isPast || false;
            
            return isMobile ? (
              <SwipeableCard 
                key={entry.id}
                onEdit={() => setSelectedEvent(entry)}
                onDelete={() => toast({ title: "Löschen wird noch implementiert", variant: "destructive" })}
                disabled={isPast}
              >
                <EventCard entry={entry} />
              </SwipeableCard>
            ) : (
              <EventCard key={entry.id} entry={entry} />
            );
          })}
          {sortedEntries.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Keine Termine gefunden
            </div>
          )}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <EventTimeline 
          entries={sortedEntries} 
          onEventClick={handleEventClick} 
        />
      )}

      {/* Premium Legend with glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600 py-4 px-4 bg-gray-50/50 backdrop-blur-sm rounded-2xl border border-gray-200/60"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm" />
          <span className="font-medium">Reisen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-sm" />
          <span className="font-medium">Landgraf (KL)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm" />
          <span className="font-medium">KBA</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 shadow-sm border border-dashed border-orange-300" />
          <span className="font-medium">Optioniert</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-lg bg-gradient-to-br from-red-500 to-red-700 shadow-sm" />
          <span className="font-medium">Theater</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 shadow-sm" />
          <span className="font-medium">Dreh</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm" />
          <span className="font-medium">Meeting</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-lg bg-gradient-to-br from-green-400 to-green-600 shadow-sm" />
          <span className="font-medium">Privat</span>
        </div>
      </motion.div>

      {/* Quick Add Modal */}
      <QuickAddEventModal
        open={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        date={quickAddDate}
        onEventAdded={loadData}
      />

      {/* Event Detail Modal */}
      <CalendarEventDetail
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={loadData}
        onNavigateToTravel={onNavigateToTravel}
        onNavigateToTour={onNavigateToTour}
      />
    </div>
  );
};

export default FullCalendar;
