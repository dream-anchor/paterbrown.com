import { useMemo, useState } from "react";
import { format, formatDistanceToNow, isToday, isTomorrow, differenceInDays } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar, MapPin, Train, Plane, Hotel, Car, Theater, Film, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CalendarEntry } from "./FullCalendar";

interface EventTimelineProps {
  entries: CalendarEntry[];
  onEventClick: (entry: CalendarEntry) => void;
}

const EventTimeline = ({ entries, onEventClick }: EventTimelineProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Group entries by month
  const groupedEntries = useMemo(() => {
    const groups: Record<string, CalendarEntry[]> = {};
    
    entries.forEach((entry) => {
      const monthKey = format(entry.start, "yyyy-MM");
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(entry);
    });

    // Sort months and entries within each month
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, monthEntries]) => ({
        monthKey,
        monthLabel: format(new Date(monthKey + "-01"), "MMMM yyyy", { locale: de }),
        entries: monthEntries.sort((a, b) => a.start.getTime() - b.start.getTime()),
      }));
  }, [entries]);

  // Get relative time label
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const daysDiff = differenceInDays(date, now);

    if (isToday(date)) return "Heute";
    if (isTomorrow(date)) return "Morgen";
    
    if (daysDiff > 0 && daysDiff <= 7) {
      return `In ${daysDiff} Tagen`;
    }
    
    if (daysDiff < 0 && daysDiff >= -7) {
      return `Vor ${Math.abs(daysDiff)} Tagen`;
    }

    return formatDistanceToNow(date, { addSuffix: true, locale: de });
  };

  // Check if event is in the past
  const isPast = (date: Date): boolean => {
    return date < new Date();
  };

  // Get icon for entry type
  const getIcon = (entry: CalendarEntry) => {
    if (entry.metadata?.booking_type) {
      switch (entry.metadata.booking_type) {
        case "train": return Train;
        case "flight": return Plane;
        case "hotel": return Hotel;
        case "rental_car": return Car;
      }
    }
    switch (entry.type) {
      case "travel": return Train;
      case "tour": return MapPin;
      case "theater": return Theater;
      case "filming": return Film;
      case "private": return User;
      case "meeting": return User;
      default: return Calendar;
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Keine Termine gefunden
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="max-w-4xl mx-auto">
        {groupedEntries.map((group, groupIndex) => (
          <div key={group.monthKey} className="relative">
            {/* Month Divider */}
            <div className="flex items-center gap-4 mb-6 mt-8 first:mt-0">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-200">
                {group.monthLabel}
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Timeline for this month */}
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />

              {/* Events */}
              {group.entries.map((entry, index) => {
                const Icon = getIcon(entry);
                const past = isPast(entry.start);
                const isHovered = hoveredId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className="relative mb-6 last:mb-0"
                    onMouseEnter={() => setHoveredId(entry.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Timeline Dot */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onEventClick(entry)}
                          className={`
                            absolute -left-5 top-3 w-3 h-3 rounded-full ring-4 ring-white transition-all duration-200
                            ${past 
                              ? "bg-gray-300 hover:bg-gray-400" 
                              : "bg-amber-500 hover:bg-amber-600 hover:scale-125"
                            }
                            ${isHovered ? "scale-125" : ""}
                          `}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="left" className="bg-white border border-gray-200 shadow-lg">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{entry.title}</p>
                          <p className="text-gray-500">{format(entry.start, "HH:mm", { locale: de })} Uhr</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    {/* Event Card */}
                    <div
                      onClick={() => onEventClick(entry)}
                      className={`
                        ml-4 p-4 rounded-xl border cursor-pointer transition-all duration-200
                        ${past 
                          ? "bg-gray-50 border-gray-200 opacity-70" 
                          : "bg-white border-gray-200 hover:shadow-md hover:border-gray-300"
                        }
                        ${isHovered ? "shadow-md border-gray-300" : ""}
                      `}
                    >
                      <div className="flex items-start gap-4">
                        {/* Date Column */}
                        <div className="flex-shrink-0 w-20 text-right">
                          <div className={`text-xs font-medium ${past ? "text-gray-400" : "text-amber-600"}`}>
                            {getRelativeTime(entry.start)}
                          </div>
                          <div className={`text-sm ${past ? "text-gray-400" : "text-gray-600"}`}>
                            {format(entry.start, "EEE, d. MMM", { locale: de })}
                          </div>
                          {!entry.allDay && (
                            <div className={`text-sm font-semibold ${past ? "text-gray-400" : "text-gray-800"}`}>
                              {format(entry.start, "HH:mm", { locale: de })}
                            </div>
                          )}
                        </div>

                        {/* Divider */}
                        <div className={`w-px h-14 ${past ? "bg-gray-200" : "bg-gray-300"}`} />

                        {/* Event Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white ${entry.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-gray-900 truncate ${past ? "line-through opacity-60" : ""}`}>
                                {entry.title}
                              </h4>
                              {entry.location && (
                                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span className="truncate">{entry.location}</span>
                                </div>
                              )}
                              {entry.metadata?.venue_name && (
                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                  {entry.metadata.venue_name}
                                </p>
                              )}
                            </div>

                            {/* Source Badge */}
                            {entry.metadata?.source && (
                              <span className={`
                                flex-shrink-0 px-2 py-0.5 text-[10px] font-bold rounded
                                ${entry.metadata.source === "KL" 
                                  ? "bg-yellow-100 text-yellow-700" 
                                  : "bg-green-100 text-green-700"
                                }
                              `}>
                                {entry.metadata.source}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default EventTimeline;
