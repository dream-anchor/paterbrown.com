import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar, MapPin, Clock, RefreshCw, ChevronUp, Sparkles } from "lucide-react";
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
 * Mobile-optimized agenda view - Premium design with framer-motion
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
      return { label: format(date, "EEEE, d. MMMM", { locale: de }), badge: "Heute", badgeColor: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30" };
    }
    if (isTomorrow(date)) {
      return { label: format(date, "EEEE, d. MMMM", { locale: de }), badge: "Morgen", badgeColor: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30" };
    }
    if (isThisWeek(date)) {
      return { label: format(date, "EEEE, d. MMMM", { locale: de }), badge: "Diese Woche", badgeColor: "bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md shadow-emerald-500/20" };
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 px-4"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative inline-block"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
        </motion.div>
        <h3 className="font-bold text-xl text-gray-900 mb-2">Keine anstehenden Termine</h3>
        <p className="text-gray-500 mb-6">Der Kalender ist leer.</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="rounded-xl"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
          Aktualisieren
        </Button>
      </motion.div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative overflow-y-auto pb-24"
      style={{ height: 'calc(100vh - 220px)' }}
    >
      {/* Premium Header with glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-gray-200/60 -mx-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900 block">
              {totalUpcoming} Termine
            </span>
            <span className="text-xs text-gray-500">Anstehend</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
        </Button>
      </motion.div>

      {/* Upcoming events grouped by date */}
      <div className="space-y-6 mt-4 px-1">
        <AnimatePresence mode="popLayout">
          {groupedUpcoming.map((group, groupIndex) => {
            const { label, badge, badgeColor } = getDateLabel(group.date);

            return (
              <motion.div 
                key={group.dateKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: Math.min(groupIndex * 0.05, 0.2) }}
              >
                {/* Premium Date Header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {label}
                  </span>
                  {badge && (
                    <motion.span 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-bold rounded-full",
                        badgeColor
                      )}
                    >
                      {badge}
                    </motion.span>
                  )}
                </div>

                {/* Events for this date - Premium Cards */}
                <div className="space-y-2">
                  {group.entries.map((entry, entryIndex) => {
                    const Icon = entry.icon;
                    
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min((groupIndex * 10 + entryIndex) * 0.02, 0.3) }}
                      >
                        <SwipeableCard
                          onEdit={() => handleEdit(entry)}
                          onDelete={handleDelete}
                        >
                          <button
                            onClick={() => {
                              haptics.tap();
                              onEventClick(entry);
                            }}
                            className={cn(
                              "w-full text-left bg-white rounded-2xl",
                              "border border-gray-200/60 hover:border-amber-300/50",
                              "shadow-sm hover:shadow-lg hover:shadow-amber-500/10",
                              "p-4 transition-all duration-300 active:scale-[0.98]",
                              entry.isCancelled && "opacity-50"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              {/* Premium Icon Badge with glassmorphism */}
                              <div className={cn(
                                "relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-lg",
                                entry.color,
                                entry.isOptioned && "opacity-60"
                              )}>
                                {entry.metadata?.source === "KL" ? (
                                  <span className="text-sm font-bold">KL</span>
                                ) : entry.metadata?.source === "KBA" ? (
                                  <span className="text-sm font-bold">KBA</span>
                                ) : (
                                  <Icon className="w-6 h-6" />
                                )}
                                
                                {/* Status indicator dot */}
                                {isToday(entry.start) && (
                                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
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
                                  
                                  {/* Premium Status badges with glassmorphism */}
                                  <div className="flex gap-1 flex-shrink-0">
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
                                </div>

                                {/* Time with premium styling */}
                                {!entry.allDay && (
                                  <div className="flex items-center gap-1.5 mt-1.5 text-sm">
                                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="font-medium text-amber-600">
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
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Premium Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className={cn(
              "fixed bottom-24 right-4 z-30 w-12 h-12",
              "bg-white/90 backdrop-blur-xl rounded-full",
              "shadow-xl shadow-gray-500/20 border border-gray-200/60",
              "flex items-center justify-center text-gray-600",
              "active:scale-95 transition-transform"
            )}
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MobileAgendaView;