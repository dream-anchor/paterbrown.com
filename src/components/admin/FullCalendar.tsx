import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import QuickAddEventModal from "./QuickAddEventModal";
import CalendarEventDetail from "./CalendarEventDetail";
import EventTimeline from "./EventTimeline";
import EventFilterPanel from "./EventFilterPanel";
import AdminSearchBar from "./AdminSearchBar";
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
  metadata?: {
    booking_type?: string;
    origin_city?: string;
    destination_city?: string;
    booking_number?: string;
    provider?: string;
    venue_name?: string;
    source?: string;
    description?: string;
    qr_code_url?: string;
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
  start_time: string;
  end_time?: string;
  note?: string;
  source: "KL" | "KBA" | "unknown";
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  color?: string;
  all_day?: boolean;
}

interface FullCalendarProps {
  onNavigateToTravel?: (bookingId: string) => void;
  onNavigateToTour?: (eventId: string) => void;
}

// Color schemes for different event types
const eventColors: Record<string, { bg: string; text: string; border: string }> = {
  // Reisen = Blau
  travel: { bg: "bg-blue-500", text: "text-blue-700", border: "border-blue-200" },
  train: { bg: "bg-blue-500", text: "text-blue-700", border: "border-blue-200" },
  flight: { bg: "bg-blue-400", text: "text-blue-700", border: "border-blue-200" },
  hotel: { bg: "bg-blue-600", text: "text-blue-700", border: "border-blue-200" },
  rental_car: { bg: "bg-blue-300", text: "text-blue-700", border: "border-blue-200" },
  // Tour Landgraf (KL) = Gelb
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

const FullCalendar = ({ onNavigateToTravel, onNavigateToTour }: FullCalendarProps) => {
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
        supabase.from("travel_bookings").select("*").order("start_datetime"),
        supabase.from("admin_events").select("*").order("start_time"),
        supabase.from("calendar_events").select("*").order("start_datetime"),
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
          source: event.source,
          description: event.note,
        },
      });
    });

    // Manual calendar events
    calendarEvents.forEach((event) => {
      const colorKey = event.event_type || "other";
      const colors = eventColors[colorKey] || eventColors.other;
      entries.push({
        id: event.id,
        title: event.title,
        type: event.event_type as CalendarEntry["type"],
        category: "manual",
        start: new Date(event.start_datetime),
        end: event.end_datetime ? new Date(event.end_datetime) : undefined,
        allDay: event.all_day,
        color: event.color ? `bg-[${event.color}]` : colors.bg,
        textColor: colors.text,
        icon: getEventIcon(event.event_type),
        location: event.location,
        metadata: {
          description: event.description,
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
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Event Card Component for card view
  const EventCard = ({ entry }: { entry: CalendarEntry }) => {
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

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      // For now just show a toast - actual delete would need confirmation
      toast({ title: "Löschen wird noch implementiert", variant: "destructive" });
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedEvent(entry);
    };

    return (
      <div
        onClick={() => handleEventClick(entry)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative p-4 rounded-xl border transition-all duration-200 cursor-pointer
          ${isPast 
            ? "bg-gray-50 border-gray-200" 
            : "bg-white border-gray-200 hover:shadow-md hover:scale-[1.01]"
          }
        `}
      >
        {/* Source Icon - links oben */}
        <div className="absolute top-3 left-3">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold ${entry.color}`}>
            {entry.metadata?.source === "KL" ? "KL" : entry.metadata?.source === "KBA" ? "KBA" : <Icon className="w-3.5 h-3.5" />}
          </div>
        </div>
        
        {/* Status Badge - rechts oben (hide when hovered for quick actions) */}
        {status && !isHovered && (
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
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-sm -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 -mt-4">
        <AdminSearchBar items={searchableItems} onSelect={handleSearchSelect} />
      </div>

      {/* Filter Panel */}
      <EventFilterPanel
        entries={allEntries}
        onFilterChange={setFilteredEntries}
        totalCount={allEntries.length}
        filteredCount={displayEntries.length}
      />
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="apple" size="sm" onClick={goToToday} className="rounded-lg">
            Heute
          </Button>
          <div className="flex items-center">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 ml-2">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-1">
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
          
          <span className="text-sm text-gray-500">{eventsThisMonth} Termine</span>
          
          <Button variant="apple" size="sm" onClick={() => { setQuickAddDate(new Date()); setShowQuickAdd(true); }}>
            <Plus className="w-4 h-4 mr-1" />
            Termin
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="apple" size="sm" className="rounded-lg">
                <Share2 className="w-4 h-4 mr-2" />
                Teilen
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
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
        </div>
      </div>

      {/* Calendar Grid View */}
      {viewMode === "calendar" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 bg-gray-50/50">
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
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all
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
                          className={`w-full px-1.5 py-0.5 rounded text-[10px] font-medium text-white truncate flex items-center gap-1
                            ${entry.color} hover:opacity-90 transition-opacity text-left`}
                          title={`${formatTime(entry.start)} ${entry.title}`}
                        >
                          <EntryIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {entry.allDay ? "" : `${formatTime(entry.start)} `}
                            {entry.title}
                          </span>
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
        </div>
      )}

      {/* Cards View */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEntries.map((entry) => (
            <EventCard key={entry.id} entry={entry} />
          ))}
          {sortedEntries.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
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

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-500" />
          <span>Reisen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-yellow-500" />
          <span>Tour (Landgraf)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500" />
          <span>Tour (KBA)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-orange-500" />
          <span>Optioniert</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-600" />
          <span>Theater</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-purple-500" />
          <span>Dreh</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500" />
          <span>Meeting</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-500" />
          <span>Privat</span>
        </div>
      </div>

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
