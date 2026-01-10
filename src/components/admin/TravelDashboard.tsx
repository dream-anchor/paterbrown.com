import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { de } from "date-fns/locale";
import { 
  Hotel, Train, Plane, Bus, Car, Package, 
  Calendar, MapPin, Users, Hash, ChevronRight,
  Mail, Clock, AlertCircle, CheckCircle2, Loader2,
  Filter, Search, RefreshCw, Upload, LayoutGrid, List,
  User, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TravelBookingDetail from "./TravelBookingDetail";
import TravelEmailInbox from "./TravelEmailInbox";
import TravelImportModal from "./TravelImportModal";
import TravelCard from "./TravelCard";
import TravelTimeline from "./TravelTimeline";
import TravelerProfileEditor from "./TravelerProfileEditor";
import QrCodeModal from "./QrCodeModal";

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
  qr_code_url?: string | null;
}

interface GroupedBookings {
  [date: string]: TravelBooking[];
}

// Monochrome Apple Design 2026 - icons only, no colors
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

// Format time with fallback - show "TBA" if no real time
const formatTime = (datetime: string): string => {
  if (!hasRealTime(datetime)) return "TBA";
  return format(parseISO(datetime), "HH:mm", { locale: de });
};

// Deduplicate bookings by type, date, and route
const deduplicateBookings = (bookings: TravelBooking[]): TravelBooking[] => {
  const seen = new Map<string, TravelBooking>();
  
  for (const booking of bookings) {
    const key = `${booking.booking_type}-${booking.start_datetime.split('T')[0]}-${booking.origin_city || ''}-${booking.destination_city}`;
    
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, booking);
    } else {
      // Keep the booking with more details
      if (
        (booking.end_datetime && !existing.end_datetime) ||
        (booking.booking_number && !existing.booking_number) ||
        (hasRealTime(booking.start_datetime) && !hasRealTime(existing.start_datetime)) ||
        Object.keys(booking.details || {}).length > Object.keys(existing.details || {}).length
      ) {
        seen.set(key, booking);
      }
    }
  }
  
  return Array.from(seen.values());
};

// Extract all unique traveler names from bookings
const extractUniqueTravelers = (bookings: TravelBooking[]): string[] => {
  const travelers = new Set<string>();
  
  bookings.forEach(booking => {
    if (booking.traveler_name) {
      travelers.add(booking.traveler_name);
    }
    if (booking.traveler_names) {
      booking.traveler_names.forEach(name => travelers.add(name));
    }
  });
  
  return Array.from(travelers).sort();
};

export default function TravelDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState<TravelBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<TravelBooking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"timeline" | "cards" | "list">("timeline");
  const [selectedTravelers, setSelectedTravelers] = useState<string[]>([]);
  const [qrModalBooking, setQrModalBooking] = useState<TravelBooking | null>(null);
  const { toast } = useToast();

  // Get sub-tab from URL, default to "bookings"
  const activeTab = searchParams.get("subtab") || "bookings";

  const handleSubTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("subtab", value);
    setSearchParams(newParams);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("travel_bookings")
        .select("*")
        .order("start_datetime", { ascending: true });

      if (error) throw error;
      // Deduplicate the bookings
      const deduplicated = deduplicateBookings((data as TravelBooking[]) || []);
      setBookings(deduplicated);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Fehler",
        description: "Buchungen konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique travelers for filter
  const allTravelers = useMemo(() => extractUniqueTravelers(bookings), [bookings]);

  // Toggle traveler selection
  const toggleTraveler = (name: string) => {
    setSelectedTravelers(prev => 
      prev.includes(name) 
        ? prev.filter(t => t !== name)
        : [...prev, name]
    );
  };

  // Group bookings by date with filters applied
  const groupedBookings: GroupedBookings = bookings
    .filter(b => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
          b.destination_city?.toLowerCase().includes(query) ||
          b.origin_city?.toLowerCase().includes(query) ||
          b.traveler_name?.toLowerCase().includes(query) ||
          b.traveler_names?.some(n => n.toLowerCase().includes(query)) ||
          b.booking_number?.toLowerCase().includes(query) ||
          b.venue_name?.toLowerCase().includes(query) ||
          b.provider?.toLowerCase().includes(query)
        );
        if (!matchesSearch) return false;
      }
      
      // Traveler filter (if any selected)
      if (selectedTravelers.length > 0) {
        const bookingTravelers = [
          b.traveler_name,
          ...(b.traveler_names || [])
        ].filter(Boolean) as string[];
        
        const matchesTraveler = bookingTravelers.some(t => 
          selectedTravelers.includes(t)
        );
        if (!matchesTraveler) return false;
      }
      
      return true;
    })
    .reduce((groups, booking) => {
      const date = format(parseISO(booking.start_datetime), "yyyy-MM-dd");
      if (!groups[date]) groups[date] = [];
      groups[date].push(booking);
      return groups;
    }, {} as GroupedBookings);

  // Sort dates: ALL dates in descending order (newest first) - 10.1., 9.1., 8.1., 7.1., 6.1.
  const sortedDates = Object.keys(groupedBookings).sort((a, b) => {
    const dateA = parseISO(a);
    const dateB = parseISO(b);
    // Always descending - newest dates first
    return dateB.getTime() - dateA.getTime();
  });

  // Get next upcoming trip info for Quick Summary
  const getNextTripSummary = () => {
    const upcomingDates = sortedDates.filter(d => !isPast(parseISO(d)) || isToday(parseISO(d)));
    if (upcomingDates.length === 0) return null;
    
    const nextDate = upcomingDates[0];
    const nextBookings = groupedBookings[nextDate];
    
    const trainCount = nextBookings.filter(b => b.booking_type === 'train').length;
    const flightCount = nextBookings.filter(b => b.booking_type === 'flight').length;
    const hotelCount = nextBookings.filter(b => b.booking_type === 'hotel').length;
    
    const destinations = [...new Set(nextBookings.map(b => b.destination_city))].filter(Boolean);
    
    return {
      date: nextDate,
      bookings: nextBookings,
      trainCount,
      flightCount,
      hotelCount,
      destinations
    };
  };

  const nextTrip = getNextTripSummary();

  // Always use full German date format
  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, "EEEE, d. MMMM yyyy", { locale: de });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-Navigation - Apple Segmented Control Style */}
      <Tabs value={activeTab} onValueChange={handleSubTabChange}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList className="inline-flex p-1 bg-gray-100/80 rounded-xl gap-0.5">
            <TabsTrigger 
              value="bookings" 
              className="px-5 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Buchungen
            </TabsTrigger>
            <TabsTrigger 
              value="inbox" 
              className="px-5 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Mail className="w-4 h-4 mr-2" />
              Posteingang
            </TabsTrigger>
            <TabsTrigger 
              value="profiles" 
              className="px-5 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {activeTab === "bookings" && (
            <div className="flex items-center gap-2">
              {/* View Mode Toggle - 3 options now */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "timeline" 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Timeline"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "cards" 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Kartenansicht"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "list" 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Listenansicht"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-56 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-all h-9"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={fetchBookings}
                className="h-9 w-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setIsImportModalOpen(true)}
                className="h-9 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 gap-2"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import</span>
              </Button>
            </div>
          )}
        </div>

        {/* Person Filter - Multi-Select */}
        {activeTab === "bookings" && allTravelers.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-4">
            <span className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Filter:
            </span>
            <button
              onClick={() => setSelectedTravelers([])}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedTravelers.length === 0
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Alle
            </button>
            {allTravelers.map(traveler => (
              <button
                key={traveler}
                onClick={() => toggleTraveler(traveler)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedTravelers.includes(traveler)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {traveler}
              </button>
            ))}
          </div>
        )}

        {/* Import Modal */}
        <TravelImportModal
          open={isImportModalOpen}
          onOpenChange={setIsImportModalOpen}
          onImportComplete={() => {
            fetchBookings();
            setIsImportModalOpen(false);
          }}
        />

        <TabsContent value="bookings" className="mt-6">
          {/* Quick Summary Header */}
          {nextTrip && viewMode === "timeline" && (
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nächste Reise</p>
                    <p className="font-semibold text-gray-900">
                      {isToday(parseISO(nextTrip.date)) 
                        ? "Heute" 
                        : isTomorrow(parseISO(nextTrip.date))
                          ? "Morgen"
                          : format(parseISO(nextTrip.date), "EEEE, d. MMMM", { locale: de })
                      }
                      {nextTrip.destinations.length > 0 && (
                        <span className="text-gray-500 font-normal"> → {nextTrip.destinations[0]}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  {nextTrip.trainCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Train className="w-4 h-4" />
                      {nextTrip.trainCount}
                    </span>
                  )}
                  {nextTrip.flightCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Plane className="w-4 h-4" />
                      {nextTrip.flightCount}
                    </span>
                  )}
                  {nextTrip.hotelCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Hotel className="w-4 h-4" />
                      {nextTrip.hotelCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Split View Container */}
          <div className="h-[calc(100vh-280px)] min-h-[500px] flex gap-6 overflow-hidden">
            {/* Bookings List - Scrollable */}
            <div className="flex-1 md:flex-[2] overflow-y-auto min-h-0 space-y-4 pr-2">
              {sortedDates.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Keine Buchungen
                  </h3>
                  <p className="text-sm text-gray-500">
                    Leite E-Mails an die Travel-Adresse weiter, um Buchungen zu erfassen.
                  </p>
                </div>
              ) : viewMode === "timeline" ? (
                /* Timeline View - New Default */
                sortedDates.map((date) => (
                  <TravelTimeline
                    key={date}
                    date={date}
                    bookings={groupedBookings[date]}
                    selectedBookingId={selectedBooking?.id}
                    onSelect={setSelectedBooking}
                  />
                ))
              ) : viewMode === "cards" ? (
                /* Card View - 2-Spalten */
                sortedDates.map((date) => (
                  <div key={date} className="space-y-3">
                    {/* Date Header */}
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        isPast(parseISO(date)) && !isToday(parseISO(date))
                          ? "text-gray-400"
                          : "text-gray-700"
                      }`}>
                        {getDateLabel(date)}
                      </div>
                      {isToday(parseISO(date)) && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                          Heute
                        </span>
                      )}
                      {isTomorrow(parseISO(date)) && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
                          Morgen
                        </span>
                      )}
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>

                    {/* 2-Column Layout */}
                    {(() => {
                      const transportBookings = groupedBookings[date].filter(
                        b => ['train', 'flight', 'bus', 'rental_car'].includes(b.booking_type)
                      );
                      const accommodationBookings = groupedBookings[date].filter(
                        b => b.booking_type === 'hotel'
                      );
                      const otherBookings = groupedBookings[date].filter(
                        b => !['train', 'flight', 'bus', 'rental_car', 'hotel'].includes(b.booking_type)
                      );
                      
                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            {transportBookings.length > 0 && (
                              <>
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                  <Train className="h-3 w-3" />
                                  Reisen
                                </h4>
                                {transportBookings.map((booking) => (
                                  <TravelCard
                                    key={booking.id}
                                    booking={booking}
                                    isSelected={selectedBooking?.id === booking.id}
                                    onSelect={setSelectedBooking}
                                    onShowQrCode={() => setQrModalBooking(booking)}
                                  />
                                ))}
                              </>
                            )}
                            {otherBookings.map((booking) => (
                              <TravelCard
                                key={booking.id}
                                booking={booking}
                                isSelected={selectedBooking?.id === booking.id}
                                onSelect={setSelectedBooking}
                                onShowQrCode={() => setQrModalBooking(booking)}
                              />
                            ))}
                          </div>
                          
                          <div className="space-y-3">
                            {accommodationBookings.length > 0 && (
                              <>
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                  <Hotel className="h-3 w-3" />
                                  Unterkünfte
                                </h4>
                                {accommodationBookings.map((booking) => (
                                  <TravelCard
                                    key={booking.id}
                                    booking={booking}
                                    isSelected={selectedBooking?.id === booking.id}
                                    onSelect={setSelectedBooking}
                                    onShowQrCode={() => setQrModalBooking(booking)}
                                  />
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ))
              ) : (
                /* List View - Compact */
                sortedDates.map((date) => (
                  <div key={date} className="space-y-1">
                    {/* Date Header for List View */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        isPast(parseISO(date)) && !isToday(parseISO(date))
                          ? "text-gray-400"
                          : "text-gray-700"
                      }`}>
                        {getDateLabel(date)}
                      </div>
                      {isToday(parseISO(date)) && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                          Heute
                        </span>
                      )}
                      {isTomorrow(parseISO(date)) && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
                          Morgen
                        </span>
                      )}
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>

                    {/* List Items */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      {groupedBookings[date].map((booking) => {
                        const typeConfig = bookingTypeConfig[booking.booking_type];
                        const TypeIcon = typeConfig.icon;

                        return (
                          <button
                            key={booking.id}
                            onClick={() => setSelectedBooking(booking)}
                            className={`group w-full text-left py-3 px-4 border-b border-gray-100 last:border-b-0 transition-colors ${
                              selectedBooking?.id === booking.id
                                ? "bg-gray-50"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                                <TypeIcon className="w-4 h-4 text-gray-500" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-gray-900 truncate">
                                    {booking.booking_type === "hotel" 
                                      ? booking.venue_name || booking.destination_city
                                      : booking.origin_city 
                                        ? `${booking.origin_city} → ${booking.destination_city}`
                                        : booking.destination_city
                                    }
                                  </span>
                                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                                </div>
                                
                                <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    {hasRealTime(booking.start_datetime) ? (
                                      <>
                                        {formatTime(booking.start_datetime)}
                                        {booking.end_datetime && hasRealTime(booking.end_datetime) && (
                                          <> – {formatTime(booking.end_datetime)}</>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-gray-400">TBA</span>
                                    )}
                                  </span>
                                  {booking.provider && (
                                    <span className="truncate text-gray-400">{booking.provider}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Detail Panel (Desktop) */}
            <div className="hidden md:flex md:flex-1 h-full overflow-hidden">
              <div className="w-full h-full overflow-y-auto rounded-2xl">
                <TravelBookingDetail 
                  booking={selectedBooking} 
                  onClose={() => setSelectedBooking(null)}
                  onUpdate={fetchBookings}
                />
              </div>
            </div>
          </div>

          {/* Mobile Detail Panel - Sheet-style overlay */}
          {selectedBooking && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
              <div 
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-auto shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">
                  <TravelBookingDetail 
                    booking={selectedBooking} 
                    onClose={() => setSelectedBooking(null)}
                    onUpdate={fetchBookings}
                    isMobile
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inbox" className="mt-6">
          <TravelEmailInbox onEmailProcessed={fetchBookings} />
        </TabsContent>

        <TabsContent value="profiles" className="mt-6">
          <TravelerProfileEditor />
        </TabsContent>
      </Tabs>

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={!!qrModalBooking}
        onClose={() => setQrModalBooking(null)}
        bookingId={qrModalBooking?.id}
        bookingNumber={qrModalBooking?.booking_number || undefined}
        qrCodeImageUrl={qrModalBooking?.qr_code_url || undefined}
        documentType={qrModalBooking?.booking_type === 'train' ? 'ticket' : undefined}
        onQrExtracted={(url) => {
          // Update the booking in state with the new QR URL
          setBookings(prev => prev.map(b => 
            b.id === qrModalBooking?.id ? { ...b, qr_code_url: url } : b
          ));
          if (qrModalBooking) {
            setQrModalBooking({ ...qrModalBooking, qr_code_url: url });
          }
        }}
      />
    </div>
  );
}
