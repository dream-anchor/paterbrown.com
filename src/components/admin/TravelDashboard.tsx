import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { de } from "date-fns/locale";
import { 
  Hotel, Train, Plane, Bus, Car, Package, 
  Calendar, MapPin, Users, Hash, ChevronRight,
  Mail, Clock, AlertCircle, CheckCircle2, Loader2,
  Filter, Search, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TravelBookingDetail from "./TravelBookingDetail";
import TravelEmailInbox from "./TravelEmailInbox";

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

const bookingTypeConfig = {
  hotel: { icon: Hotel, label: "Hotel", color: "bg-blue-100 text-blue-700 border-blue-200" },
  train: { icon: Train, label: "Zug", color: "bg-green-100 text-green-700 border-green-200" },
  flight: { icon: Plane, label: "Flug", color: "bg-orange-100 text-orange-700 border-orange-200" },
  bus: { icon: Bus, label: "Bus", color: "bg-purple-100 text-purple-700 border-purple-200" },
  rental_car: { icon: Car, label: "Mietwagen", color: "bg-teal-100 text-teal-700 border-teal-200" },
  other: { icon: Package, label: "Sonstiges", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

const statusConfig = {
  confirmed: { label: "Bestätigt", color: "bg-emerald-100 text-emerald-700" },
  changed: { label: "Geändert", color: "bg-amber-100 text-amber-700" },
  cancelled: { label: "Storniert", color: "bg-red-100 text-red-700" },
  pending: { label: "Ausstehend", color: "bg-gray-100 text-gray-600" },
};

export default function TravelDashboard() {
  const [bookings, setBookings] = useState<TravelBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<TravelBooking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("bookings");
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
      setBookings((data as TravelBooking[]) || []);
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
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-gray-100 rounded-md px-4">
              <Calendar className="w-4 h-4 mr-2" />
              Buchungen
            </TabsTrigger>
            <TabsTrigger value="inbox" className="data-[state=active]:bg-gray-100 rounded-md px-4">
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
                  className="pl-9 w-64 bg-white"
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchBookings}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="bookings" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bookings List */}
            <div className="lg:col-span-2 space-y-6">
              {sortedDates.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
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
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isPast(parseISO(date)) && !isToday(parseISO(date))
                          ? "bg-gray-100 text-gray-500"
                          : isToday(parseISO(date))
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {getDateLabel(date)}
                      </div>
                      <div className="h-px flex-1 bg-gray-200" />
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
                            className={`w-full text-left bg-white border rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 group ${
                              selectedBooking?.id === booking.id
                                ? "border-amber-400 shadow-md ring-2 ring-amber-100"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Type Icon */}
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig.color} border`}>
                                <TypeIcon className="w-5 h-5" />
                              </div>

                              {/* Main Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold text-gray-900">
                                        {booking.booking_type === "hotel" 
                                          ? booking.venue_name || booking.destination_city
                                          : booking.origin_city 
                                            ? `${booking.origin_city} → ${booking.destination_city}`
                                            : booking.destination_city
                                        }
                                      </span>
                                      <Badge variant="outline" className={status.color}>
                                        {status.label}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                      {booking.provider}
                                    </div>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                                </div>

                                {/* Meta info */}
                                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {format(parseISO(booking.start_datetime), "HH:mm", { locale: de })}
                                    {booking.end_datetime && (
                                      <> – {format(parseISO(booking.end_datetime), "HH:mm", { locale: de })}</>
                                    )}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {getTravelerDisplay(booking)}
                                  </span>
                                  {booking.booking_number && (
                                    <span className="flex items-center gap-1">
                                      <Hash className="w-4 h-4" />
                                      {booking.booking_number}
                                    </span>
                                  )}
                                </div>

                                {/* Hotel specific details */}
                                {booking.booking_type === "hotel" && booking.details && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {booking.details.room_category && (
                                      <Badge variant="secondary" className="text-xs">
                                        {booking.details.room_category}
                                      </Badge>
                                    )}
                                    {booking.details.breakfast_included && (
                                      <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                                        ✓ Frühstück
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {/* Transport specific details */}
                                {["train", "flight"].includes(booking.booking_type) && booking.details && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {(booking.details.train_number || booking.details.flight_number) && (
                                      <Badge variant="secondary" className="text-xs">
                                        {booking.details.train_number || booking.details.flight_number}
                                      </Badge>
                                    )}
                                    {booking.details.seat && (
                                      <Badge variant="secondary" className="text-xs">
                                        Platz {booking.details.seat}
                                      </Badge>
                                    )}
                                    {booking.details.wagon && (
                                      <Badge variant="secondary" className="text-xs">
                                        Wagen {booking.details.wagon}
                                      </Badge>
                                    )}
                                  </div>
                                )}
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

            {/* Detail Panel (sticky) */}
            <div className="hidden lg:block">
              <div className="sticky top-32">
                <TravelBookingDetail 
                  booking={selectedBooking} 
                  onClose={() => setSelectedBooking(null)}
                  onUpdate={fetchBookings}
                />
              </div>
            </div>
          </div>

          {/* Mobile Detail Panel */}
          {selectedBooking && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSelectedBooking(null)}>
              <div 
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <TravelBookingDetail 
                  booking={selectedBooking} 
                  onClose={() => setSelectedBooking(null)}
                  onUpdate={fetchBookings}
                  isMobile
                />
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
