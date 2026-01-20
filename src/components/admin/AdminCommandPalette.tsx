import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Calendar,
  Map,
  Plane,
  Upload,
  Plus,
  Download,
  Search,
  Clock,
  MapPin,
  Train,
  Hotel,
  FileText,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface AdminEvent {
  id: string;
  title: string;
  location: string;
  start_time: string;
  source: string;
}

interface TravelBooking {
  id: string;
  booking_type: string;
  destination_city: string;
  origin_city: string | null;
  start_datetime: string;
  provider: string | null;
}

interface RecentItem {
  id: string;
  type: "event" | "booking" | "action";
  label: string;
  timestamp: number;
}

interface AdminCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickAdd?: () => void;
  onExportCalendar?: () => void;
}

const RECENT_ITEMS_KEY = "admin-command-palette-recent";
const MAX_RESULTS = 8;

// Simple fuzzy match function
const fuzzyMatch = (text: string, query: string): { match: boolean; score: number } => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Exact match
  if (textLower.includes(queryLower)) {
    return { match: true, score: 100 - textLower.indexOf(queryLower) };
  }
  
  // Fuzzy match - check if all query chars appear in order
  let queryIndex = 0;
  let score = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 10;
      queryIndex++;
    }
  }
  
  return { match: queryIndex === queryLower.length, score };
};

// Highlight matching text
const HighlightedText = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>;
  
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const index = textLower.indexOf(queryLower);
  
  if (index === -1) return <>{text}</>;
  
  return (
    <>
      {text.slice(0, index)}
      <span className="font-bold text-gray-900">{text.slice(index, index + query.length)}</span>
      {text.slice(index + query.length)}
    </>
  );
};

const getBookingIcon = (type: string) => {
  switch (type) {
    case "train": return Train;
    case "flight": return Plane;
    case "hotel": return Hotel;
    default: return FileText;
  }
};

export const AdminCommandPalette = ({
  open,
  onOpenChange,
  onQuickAdd,
  onExportCalendar,
}: AdminCommandPaletteProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [bookings, setBookings] = useState<TravelBooking[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadData();
      loadRecentItems();
      setQuery("");
    }
  }, [open]);

  const loadData = async () => {
    const [eventsResult, bookingsResult] = await Promise.all([
      supabase
        .from("admin_events")
        .select("id, title, location, start_time, source")
        .order("start_time", { ascending: true })
        .limit(50),
      supabase
        .from("travel_bookings")
        .select("id, booking_type, destination_city, origin_city, start_datetime, provider")
        .order("start_datetime", { ascending: true })
        .limit(50),
    ]);

    if (eventsResult.data) setEvents(eventsResult.data);
    if (bookingsResult.data) setBookings(bookingsResult.data);
  };

  const loadRecentItems = () => {
    try {
      const stored = localStorage.getItem(RECENT_ITEMS_KEY);
      if (stored) {
        const items = JSON.parse(stored) as RecentItem[];
        // Only keep items from last 7 days
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        setRecentItems(items.filter((item) => item.timestamp > cutoff).slice(0, 5));
      }
    } catch (e) {
      console.error("Failed to load recent items", e);
    }
  };

  const addRecentItem = useCallback((item: Omit<RecentItem, "timestamp">) => {
    const newItem = { ...item, timestamp: Date.now() };
    setRecentItems((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      const updated = [newItem, ...filtered].slice(0, 5);
      localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Quick Actions
  const quickActions = useMemo(() => [
    {
      id: "quick-add",
      label: "Neues Event erstellen",
      icon: Plus,
      shortcut: "⌘N",
      action: () => {
        onQuickAdd?.();
        addRecentItem({ id: "quick-add", type: "action", label: "Neues Event erstellen" });
      },
    },
    {
      id: "export-calendar",
      label: "Kalender exportieren",
      icon: Download,
      shortcut: "⌘E",
      action: () => {
        onExportCalendar?.();
        addRecentItem({ id: "export-calendar", type: "action", label: "Kalender exportieren" });
      },
    },
  ], [onQuickAdd, onExportCalendar, addRecentItem]);

  // Navigation items
  const navigationItems = useMemo(() => [
    {
      id: "nav-calendar",
      label: "Kalender",
      icon: Calendar,
      shortcut: "⌘1",
      action: () => {
        setSearchParams({ tab: "calendar" });
        addRecentItem({ id: "nav-calendar", type: "action", label: "Kalender" });
      },
    },
    {
      id: "nav-map",
      label: "Tour-Karte",
      icon: Map,
      shortcut: "⌘2",
      action: () => {
        setSearchParams({ tab: "map" });
        addRecentItem({ id: "nav-map", type: "action", label: "Tour-Karte" });
      },
    },
    {
      id: "nav-travel",
      label: "Reisen",
      icon: Plane,
      shortcut: "⌘3",
      action: () => {
        setSearchParams({ tab: "travel" });
        addRecentItem({ id: "nav-travel", type: "action", label: "Reisen" });
      },
    },
  ], [setSearchParams, addRecentItem]);

  // Filter and score results
  const filteredEvents = useMemo(() => {
    if (!query) return [];
    
    return events
      .map((event) => {
        const titleMatch = fuzzyMatch(event.title, query);
        const locationMatch = fuzzyMatch(event.location, query);
        const dateStr = format(new Date(event.start_time), "d. MMMM yyyy", { locale: de });
        const dateMatch = fuzzyMatch(dateStr, query);
        
        const bestScore = Math.max(titleMatch.score, locationMatch.score, dateMatch.score);
        const matches = titleMatch.match || locationMatch.match || dateMatch.match;
        
        return { event, score: bestScore, matches };
      })
      .filter((item) => item.matches)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map((item) => item.event);
  }, [events, query]);

  const filteredBookings = useMemo(() => {
    if (!query) return [];
    
    return bookings
      .map((booking) => {
        const destMatch = fuzzyMatch(booking.destination_city, query);
        const originMatch = booking.origin_city ? fuzzyMatch(booking.origin_city, query) : { match: false, score: 0 };
        const providerMatch = booking.provider ? fuzzyMatch(booking.provider, query) : { match: false, score: 0 };
        
        const bestScore = Math.max(destMatch.score, originMatch.score, providerMatch.score);
        const matches = destMatch.match || originMatch.match || providerMatch.match;
        
        return { booking, score: bestScore, matches };
      })
      .filter((item) => item.matches)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map((item) => item.booking);
  }, [bookings, query]);

  const filteredQuickActions = useMemo(() => {
    if (!query) return quickActions;
    return quickActions.filter((action) => fuzzyMatch(action.label, query).match);
  }, [quickActions, query]);

  const filteredNavigation = useMemo(() => {
    if (!query) return navigationItems;
    return navigationItems.filter((nav) => fuzzyMatch(nav.label, query).match);
  }, [navigationItems, query]);

  const handleSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
  };

  const handleEventSelect = (event: AdminEvent) => {
    setSearchParams({ tab: "map", activeEventId: event.id });
    addRecentItem({ id: event.id, type: "event", label: event.title });
    onOpenChange(false);
  };

  const handleBookingSelect = (booking: TravelBooking) => {
    setSearchParams({ tab: "travel" });
    addRecentItem({ 
      id: booking.id, 
      type: "booking", 
      label: `${booking.origin_city || ""} → ${booking.destination_city}` 
    });
    onOpenChange(false);
  };

  const hasResults = 
    filteredQuickActions.length > 0 ||
    filteredNavigation.length > 0 ||
    filteredEvents.length > 0 ||
    filteredBookings.length > 0 ||
    (!query && recentItems.length > 0);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-xl border-0">
        <div className="flex items-center border-b border-gray-100 px-4">
          <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche nach Events, Reisen oder Aktionen..."
            className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
          />
          <kbd className="ml-2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-400 sm:flex">
            ESC
          </kbd>
        </div>
        <CommandList className="max-h-[400px] overflow-y-auto p-2">
          {!hasResults && (
            <CommandEmpty className="py-8 text-center text-sm text-gray-500">
              Keine Ergebnisse für "{query}" gefunden
            </CommandEmpty>
          )}

          {/* Recent Items */}
          {!query && recentItems.length > 0 && (
            <CommandGroup heading="Zuletzt verwendet" className="px-2">
              {recentItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
                    if (item.type === "event") {
                      setSearchParams({ tab: "map", activeEventId: item.id });
                    } else if (item.type === "booking") {
                      setSearchParams({ tab: "travel" });
                    }
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Quick Actions */}
          {filteredQuickActions.length > 0 && (
            <>
              <CommandGroup heading="Schnellaktionen" className="px-2">
                {filteredQuickActions.map((action) => (
                  <CommandItem
                    key={action.id}
                    value={action.id}
                    onSelect={() => handleSelect(action.action)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <action.icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1 text-sm">
                      <HighlightedText text={action.label} query={query} />
                    </span>
                    <CommandShortcut className="text-xs text-gray-400">
                      {action.shortcut}
                    </CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator className="my-2" />
            </>
          )}

          {/* Navigation */}
          {filteredNavigation.length > 0 && (
            <>
              <CommandGroup heading="Navigation" className="px-2">
                {filteredNavigation.map((nav) => (
                  <CommandItem
                    key={nav.id}
                    value={nav.id}
                    onSelect={() => handleSelect(nav.action)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                      <nav.icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1 text-sm">
                      <HighlightedText text={nav.label} query={query} />
                    </span>
                    <CommandShortcut className="text-xs text-gray-400">
                      {nav.shortcut}
                    </CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
              {(filteredEvents.length > 0 || filteredBookings.length > 0) && (
                <CommandSeparator className="my-2" />
              )}
            </>
          )}

          {/* Events */}
          {filteredEvents.length > 0 && (
            <>
              <CommandGroup heading="Events" className="px-2">
                {filteredEvents.map((event) => (
                  <CommandItem
                    key={event.id}
                    value={`event-${event.id}`}
                    onSelect={() => handleEventSelect(event)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      event.source === "KL" 
                        ? "bg-yellow-50 text-yellow-600" 
                        : "bg-green-50 text-green-600"
                    }`}>
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        <HighlightedText text={event.title} query={query} />
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        <HighlightedText text={event.location} query={query} /> · {format(new Date(event.start_time), "d. MMM yyyy", { locale: de })}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                  </CommandItem>
                ))}
              </CommandGroup>
              {filteredBookings.length > 0 && <CommandSeparator className="my-2" />}
            </>
          )}

          {/* Travel Bookings */}
          {filteredBookings.length > 0 && (
            <CommandGroup heading="Reisen" className="px-2">
              {filteredBookings.map((booking) => {
                const Icon = getBookingIcon(booking.booking_type);
                return (
                  <CommandItem
                    key={booking.id}
                    value={`booking-${booking.id}`}
                    onSelect={() => handleBookingSelect(booking)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {booking.origin_city && (
                          <>
                            <HighlightedText text={booking.origin_city} query={query} />
                            {" → "}
                          </>
                        )}
                        <HighlightedText text={booking.destination_city} query={query} />
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {booking.provider && <HighlightedText text={booking.provider} query={query} />}
                        {booking.provider && " · "}
                        {format(new Date(booking.start_datetime), "d. MMM yyyy", { locale: de })}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">↑↓</kbd>
              Navigieren
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">↵</kbd>
              Auswählen
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">⌘K</kbd>
            Öffnen
          </span>
        </div>
      </Command>
    </CommandDialog>
  );
};

export default AdminCommandPalette;

