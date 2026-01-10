import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { de } from "date-fns/locale";
import { 
  Hotel, Train, Plane, Bus, Car, Package, 
  Calendar, MapPin, Users, Hash, ChevronRight,
  Mail, Clock, AlertCircle, CheckCircle2, Loader2,
  Filter, Search, RefreshCw, Upload, LayoutGrid, List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TravelBookingDetail from "./TravelBookingDetail";
import TravelEmailInbox from "./TravelEmailInbox";
import TravelImportModal from "./TravelImportModal";
import TravelCard from "./TravelCard";

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
  created_at: string;
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

export default function TravelDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState<TravelBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<TravelBooking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
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

  // Group bookings by date
  const groupedBookings: GroupedBookings = bookings
    .filter(b => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        b.destination_city?.toLowerCase().includes(query) ||
        b.origin_city?.toLowerCase().includes(query) ||
        b.traveler_name?.toLowerCase().includes(query) ||
        b.traveler_names?.some(n => n.toLowerCase().includes(query)) ||
        b.booking_number?.toLowerCase().includes(query) ||
        b.venue_name?.toLowerCase().includes(query) ||
        b.provider?.toLowerCase().includes(query)
      );
    })
    .reduce((groups, booking) => {
      const date = format(parseISO(booking.start_datetime), "yyyy-MM-dd");
      if (!groups[date]) groups[date] = [];
      groups[date].push(booking);
      return groups;
    }, {} as GroupedBookings);

  const sortedDates = Object.keys(groupedBookings).sort();

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Heute";
    if (isTomorrow(date)) return "Morgen";
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
          </TabsList>

          {activeTab === "bookings" && (
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
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
          {/* Split View Container */}
          <div className="h-[calc(100vh-220px)] min-h-[500px] flex gap-6 overflow-hidden">
            {/* Bookings List - Scrollable */}
            <div className="flex-1 md:flex-[2] overflow-y-auto min-h-0 space-y-6 pr-2">
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
              ) : (
                sortedDates.map((date) => (
                  <div key={date} className="space-y-3">
                    {/* Date Header */}
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        isPast(parseISO(date)) && !isToday(parseISO(date))
                          ? "text-gray-400"
                          : isToday(parseISO(date))
                          ? "bg-gray-900 text-white"
                          : "text-gray-700"
                      }`}>
                        {getDateLabel(date)}
                      </div>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>

                    {/* Bookings for this date */}
                    {viewMode === "cards" ? (
                      /* Card View - Grid */
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {groupedBookings[date].map((booking) => (
                          <TravelCard
                            key={booking.id}
                            booking={booking}
                            isSelected={selectedBooking?.id === booking.id}
                            onSelect={setSelectedBooking}
                          />
                        ))}
                      </div>
                    ) : (
                      /* List View - Compact */
                      <div className="space-y-1">
                        {groupedBookings[date].map((booking) => {
                          const typeConfig = bookingTypeConfig[booking.booking_type];
                          const TypeIcon = typeConfig.icon;

                          return (
                            <button
                              key={booking.id}
                              onClick={() => setSelectedBooking(booking)}
                              className={`group w-full text-left py-3 px-4 border-b border-gray-100 transition-colors ${
                                selectedBooking?.id === booking.id
                                  ? "bg-gray-50"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Type Icon - Simple gray */}
                                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <TypeIcon className="w-4 h-4 text-gray-500" />
                                </div>

                                {/* Main Content */}
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
                                  
                                  {/* Meta - Single line */}
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
                    )}
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
      </Tabs>
    </div>
  );
}
