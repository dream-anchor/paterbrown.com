import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { de } from "date-fns/locale";
import { 
  Hotel, Train, Plane, Bus, Car, Package, 
  Calendar, MapPin, Users, Hash, ChevronRight,
  Mail, Clock, AlertCircle, CheckCircle2, Loader2,
  Filter, Search, RefreshCw, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TravelBookingDetail from "./TravelBookingDetail";
import TravelEmailInbox from "./TravelEmailInbox";
import TravelImportModal from "./TravelImportModal";

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

// Light mode config - Apple HIG inspired
const bookingTypeConfig = {
  hotel: { icon: Hotel, label: "Hotel", color: "bg-blue-50 text-blue-600 border-blue-200" },
  train: { icon: Train, label: "Zug", color: "bg-red-50 text-red-600 border-red-200" }, // DB-Rot
  flight: { icon: Plane, label: "Flug", color: "bg-orange-50 text-orange-600 border-orange-200" },
  bus: { icon: Bus, label: "Bus", color: "bg-purple-50 text-purple-600 border-purple-200" },
  rental_car: { icon: Car, label: "Mietwagen", color: "bg-cyan-50 text-cyan-600 border-cyan-200" },
  other: { icon: Package, label: "Sonstiges", color: "bg-gray-50 text-gray-600 border-gray-200" },
};

const statusConfig = {
  confirmed: { accent: "bg-emerald-500" },
  changed: { accent: "bg-amber-500" },
  cancelled: { accent: "bg-red-500" },
  pending: { accent: "bg-gray-400" },
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
  const [bookings, setBookings] = useState<TravelBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<TravelBooking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("bookings");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { toast } = useToast();

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

  const getTravelerDisplay = (booking: TravelBooking) => {
    if (booking.traveler_names?.length) {
      return booking.traveler_names.join(", ");
    }
    return booking.traveler_name || "-";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-Navigation - Apple Segmented Control Style */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList className="inline-flex p-1 bg-gray-100 rounded-full gap-0.5">
            <TabsTrigger 
              value="bookings" 
              className="px-5 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Buchungen
            </TabsTrigger>
            <TabsTrigger 
              value="inbox" 
              className="px-5 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Mail className="w-4 h-4 mr-2" />
              Posteingang
            </TabsTrigger>
          </TabsList>

          {activeTab === "bookings" && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-full focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={fetchBookings}
                className="rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => setIsImportModalOpen(true)}
                className="rounded-full bg-[#1a1a1a] text-white hover:bg-gray-800 px-4 gap-2"
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
            <div className="flex-1 md:flex-[2] overflow-y-auto min-h-0 space-y-6 pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
              {sortedDates.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1">
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
                      <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                        isPast(parseISO(date)) && !isToday(parseISO(date))
                          ? "bg-gray-100 text-gray-400"
                          : isToday(parseISO(date))
                          ? "bg-[#1a1a1a] text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {getDateLabel(date)}
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                    </div>

                    {/* Bookings for this date */}
                    <div className="space-y-2">
                      {groupedBookings[date].map((booking) => {
                        const typeConfig = bookingTypeConfig[booking.booking_type];
                        const TypeIcon = typeConfig.icon;
                        const status = statusConfig[booking.status];

                        return (
                          <button
                            key={booking.id}
                            onClick={() => setSelectedBooking(booking)}
                            className={`group relative w-full text-left bg-white rounded-xl p-4 border shadow-sm transition-all duration-150 active:scale-[0.98] ${
                              selectedBooking?.id === booking.id
                                ? "border-gray-400 shadow-md"
                                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                            }`}
                          >
                            {/* Status indicator - vertical bar */}
                            <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${status.accent}`} />
                            
                            <div className="flex items-center gap-3 pl-3">
                              {/* Type Icon - Primary visual anchor */}
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig.color} border`}>
                                <TypeIcon className="w-5 h-5" />
                              </div>

                              {/* Main Content - Compact */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-[#1a1a1a] truncate">
                                    {booking.booking_type === "hotel" 
                                      ? booking.venue_name || booking.destination_city
                                      : booking.origin_city 
                                        ? `${booking.origin_city} → ${booking.destination_city}`
                                        : booking.destination_city
                                    }
                                  </span>
                                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                </div>
                                
                                {/* Meta - Single line */}
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {hasRealTime(booking.start_datetime) ? (
                                      <>
                                        {formatTime(booking.start_datetime)}
                                        {booking.end_datetime && hasRealTime(booking.end_datetime) && (
                                          <> – {formatTime(booking.end_datetime)}</>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-gray-400 italic">TBA</span>
                                    )}
                                  </span>
                                  {booking.provider && (
                                    <span className="truncate">{booking.provider}</span>
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
            <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedBooking(null)}>
              <div 
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-auto shadow-2xl animate-slide-up"
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
