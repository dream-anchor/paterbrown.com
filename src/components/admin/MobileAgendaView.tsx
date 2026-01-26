import React, { useMemo, useRef, useEffect } from "react";
import { format, isToday, isTomorrow, isThisWeek, isPast } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import SwipeableCard from "./SwipeableCard";
import PullToRefreshContainer from "./PullToRefreshContainer";
import { useToast } from "@/hooks/use-toast";

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
 * Mobile-optimized agenda view with infinite scrolling grouped by date
 */
export function MobileAgendaView({ entries, onEventClick, onRefresh }: MobileAgendaViewProps) {
  const { toast } = useToast();
  const todayRef = useRef<HTMLDivElement>(null);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: Record<string, CalendarEntry[]> = {};
    
    entries.forEach(entry => {
      const dateKey = format(entry.start, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });

    // Sort by date
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, items]) => ({
        date: new Date(dateKey),
        dateKey,
        entries: items.sort((a, b) => a.start.getTime() - b.start.getTime()),
      }));
  }, [entries]);

  // Find first upcoming date index
  const firstUpcomingIndex = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return groupedEntries.findIndex(g => g.date >= today);
  }, [groupedEntries]);

  // Scroll to today on mount
  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

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

  const handleRefresh = async () => {
    await onRefresh();
    toast({ title: "Aktualisiert" });
  };

  const handleEdit = (entry: CalendarEntry) => {
    haptics.tap();
    onEventClick(entry);
  };

  const handleDelete = () => {
    haptics.error();
    toast({ title: "Löschen wird noch implementiert", variant: "destructive" });
  };

  if (groupedEntries.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Keine Termine gefunden</p>
      </div>
    );
  }

  return (
    <PullToRefreshContainer 
      onRefresh={handleRefresh} 
      className="space-y-4 pb-24"
    >
      {groupedEntries.map((group, groupIndex) => {
        const { label, badge, badgeColor } = getDateLabel(group.date);
        const isPastDate = isPast(group.date) && !isToday(group.date);
        const isFirstUpcoming = groupIndex === firstUpcomingIndex;

        return (
          <div 
            key={group.dateKey} 
            ref={isFirstUpcoming ? todayRef : undefined}
            className={cn(
              "transition-opacity",
              isPastDate && "opacity-60"
            )}
          >
            {/* Date Header - Sticky */}
            <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm px-3 py-2 -mx-3 flex items-center gap-2">
              <span className={cn(
                "text-sm font-semibold",
                isPastDate ? "text-gray-400" : "text-gray-900"
              )}>
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
            <div className="space-y-2 mt-2">
              {group.entries.map((entry) => {
                const Icon = entry.icon;
                
                return (
                  <SwipeableCard
                    key={entry.id}
                    onEdit={() => handleEdit(entry)}
                    onDelete={handleDelete}
                    disabled={isPastDate}
                  >
                    <button
                      onClick={() => {
                        haptics.tap();
                        onEventClick(entry);
                      }}
                      className={cn(
                        "w-full text-left bg-white rounded-xl border border-gray-200 p-4 transition-all active:scale-[0.98]",
                        isPastDate && "bg-gray-50",
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
    </PullToRefreshContainer>
  );
}

export default MobileAgendaView;
