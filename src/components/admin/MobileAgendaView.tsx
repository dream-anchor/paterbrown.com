import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar, MapPin, Clock, RefreshCw, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import SwipeableCard from "./SwipeableCard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface CalendarEntry {
  id: string;
  title: string;
  type: string;
  category: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color: string;
  textColor: string;
  icon: React.ElementType;
  location?: string;
  tourIndex?: number;
  isOptioned?: boolean;
  isCancelled?: boolean;
  metadata?: {
    booking_type?: string;
    origin_city?: string;
    destination_city?: string;
    source?: string;
    venue_name?: string;
    [key: string]: unknown;
  };
}

interface MobileAgendaViewProps {
  entries: CalendarEntry[];
  onEventClick: (entry: CalendarEntry) => void;
  onRefresh: () => Promise<void>;
}

/**
 * Mobile-optimized agenda view - starts at top, shows upcoming events first
 * Uses manual refresh button instead of pull-to-refresh to avoid scroll conflicts
 */
export function MobileAgendaView({ entries, onEventClick, onRefresh }: MobileAgendaViewProps) {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Filter and sort: Show only upcoming events, sorted chronologically
  const { upcomingEntries, totalUpcoming } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = entries.filter(e => e.start >= today);
    
    return {
      upcomingEntries: upcoming.sort((a, b) => a.start.getTime() - b.start.getTime()),
      totalUpcoming: upcoming.length,
    };
  }, [entries]);

  // Group entries by date
  const groupedUpcoming = useMemo(() => {
    const groups: Record<string, CalendarEntry[]> = {};
    
    upcomingEntries.forEach(entry => {
      const dateKey = format(entry.start, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, items]) => ({
        date: new Date(dateKey),
        dateKey,
        entries: items.sort((a, b) => a.start.getTime() - b.start.getTime()),
      }));
  }, [upcomingEntries]);

  // Handle scroll to detect when to show "scroll to top" button
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 300);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    haptics.tap();
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    haptics.tap();
    try {
      await onRefresh();
      toast({ title: "Aktualisiert" });
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, toast]);

  const getDateLabel = (date: Date): { label: string; badge?: string; badgeColor?: string } => {
    if (isToday(date)) {
      return { label: format(date, "EEEE, d. MMMM", { locale: de }), badge: "Heute", badgeColor: "bg-amber-500 text-white" };
    }
    if (isTomorrow(date)) {
      return { label: format(date, "EEEE, d. MMMM", { locale: de }), badge: "Morgen", badgeColor: "bg-blue-500 text-white" };
    }
    if (isThisWeek(date)) {
      return { label: format(date, "EEEE, d. MMMM", { locale: de }), badge: "Diese Woche", badgeColor: "bg-green-100 text-green-700" };
    }
    return { label: format(date, "EEEE, d. MMMM yyyy", { locale: de }) };
  };

  const handleEdit = (entry: CalendarEntry) => {
    haptics.tap();
    onEventClick(entry);
  };

  const handleDelete = () => {
    haptics.error();
    toast({ title: "Löschen wird noch implementiert", variant: "destructive" });
  };

  if (totalUpcoming === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Keine anstehenden Termine</p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="mt-4"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
          Aktualisieren
        </Button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative overflow-y-auto pb-24"
      style={{ height: 'calc(100vh - 220px)' }}
    >
      {/* Header with refresh button */}
      <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-gray-200 -mx-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
            {totalUpcoming} anstehende Termine
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="h-8 px-2"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
        </Button>
      </div>

      {/* Upcoming events grouped by date */}
      <div className="space-y-6 mt-4 px-1">
        {groupedUpcoming.map((group) => {
          const { label, badge, badgeColor } = getDateLabel(group.date);

          return (
            <div key={group.dateKey}>
              {/* Date Header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-sm font-semibold text-gray-900">
                  {label}
                </span>
                {badge && (
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-bold rounded-full",
                    badgeColor
                  )}>
                    {badge}
                  </span>
                )}
              </div>

              {/* Events for this date */}
              <div className="space-y-2">
                {group.entries.map((entry) => {
                  const Icon = entry.icon;
                  
                  return (
                    <SwipeableCard
                      key={entry.id}
                      onEdit={() => handleEdit(entry)}
                      onDelete={handleDelete}
                    >
                      <button
                        onClick={() => {
                          haptics.tap();
                          onEventClick(entry);
                        }}
                        className={cn(
                          "w-full text-left bg-white rounded-xl border border-gray-200 p-4 transition-all active:scale-[0.98]",
                          entry.isCancelled && "opacity-50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon Badge */}
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white",
                            entry.color,
                            entry.isOptioned && "opacity-60"
                          )}>
                            {entry.metadata?.source === "KL" ? (
                              <span className="text-xs font-bold">KL</span>
                            ) : entry.metadata?.source === "KBA" ? (
                              <span className="text-xs font-bold">KBA</span>
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className={cn(
                                "font-semibold text-gray-900 text-base leading-tight",
                                entry.isCancelled && "line-through"
                              )}>
                                {entry.title}
                              </h3>
                              
                              {/* Status badges */}
                              <div className="flex gap-1 flex-shrink-0">
                                {entry.isOptioned && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-orange-100 text-orange-700">
                                    Optioniert
                                  </span>
                                )}
                                {entry.isCancelled && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-red-100 text-red-700">
                                    Abgesagt
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Time */}
                            {!entry.allDay && (
                              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="font-medium">
                                  {format(entry.start, "HH:mm", { locale: de })} Uhr
                                </span>
                              </div>
                            )}

                            {/* Location */}
                            {entry.location && (
                              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{entry.location}</span>
                              </div>
                            )}

                            {/* Venue */}
                            {entry.metadata?.venue_name && (
                              <p className="text-xs text-gray-400 mt-0.5 ml-5 truncate">
                                {entry.metadata.venue_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    </SwipeableCard>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 z-30 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default MobileAgendaView;
