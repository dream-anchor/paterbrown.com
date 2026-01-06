import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminEvent {
  id: string;
  title: string;
  location: string;
  state: string | null;
  venue_name: string | null;
  start_time: string;
  end_time: string | null;
  note: string | null;
  source: "KL" | "KBA" | "unknown";
}

interface EventCalendarProps {
  events: AdminEvent[];
  onEventUpdate: () => void;
}

const EventCalendar = ({ events, onEventUpdate }: EventCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

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

  const eventsByDate = useMemo(() => {
    const map: Record<string, AdminEvent[]> = {};
    events.forEach((event) => {
      const dateStr = event.start_time.split("T")[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(event);
    });
    return map;
  }, [events]);

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Diesen Termin wirklich löschen?")) return;

    try {
      const { error } = await supabase
        .from("admin_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
      
      toast({
        title: "Gelöscht",
        description: "Termin wurde gelöscht",
      });
      onEventUpdate();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventColor = () => {
    return "bg-amber-500"; // Einheitlich Orange
  };

  const getEventTextColor = () => {
    return "text-amber-600"; // Einheitlich Orange
  };

  const getEventDisplayTitle = (event: AdminEvent) => {
    const sourceLabel = event.source === "unknown" ? "?" : event.source;
    return `TOUR PB (${sourceLabel})`;
  };

  const getEventLocation = (event: AdminEvent) => {
    return event.state 
      ? `${event.location} (${event.state})` 
      : event.location;
  };

  const selectedDateStr = selectedDate?.toISOString().split("T")[0];
  const selectedEvents = selectedDateStr ? eventsByDate[selectedDateStr] || [] : [];
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar Section */}
      <div className="flex-1 min-w-0">
        {/* Calendar Header - Google Style */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-150"
            >
              Heute
            </button>
            <div className="flex items-center">
              <button
                onClick={prevMonth}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">{events.length} Termine</span>
          </div>
        </div>

        {/* Calendar Grid - Google Style */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider py-3 bg-gray-50/50"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for start offset */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] border-r border-b border-gray-100 last:border-r-0 bg-gray-50/30" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isSelected = selectedDate?.getDate() === day && 
                                selectedDate?.getMonth() === currentDate.getMonth() &&
                                selectedDate?.getFullYear() === currentDate.getFullYear();
              const isToday = today.toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
              const isWeekend = (startDayOfWeek + i) % 7 >= 5;

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    min-h-[100px] p-1.5 border-r border-b border-gray-100 last:border-r-0 text-left transition-all duration-150
                    hover:bg-amber-50/50
                    ${isSelected ? "bg-amber-50 ring-1 ring-inset ring-amber-200" : ""}
                    ${isWeekend && !isSelected ? "bg-gray-50/50" : ""}
                  `}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-center mb-1">
                    <span
                      className={`
                        w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full transition-all
                        ${isToday 
                          ? "bg-amber-500 text-white" 
                          : isSelected 
                            ? "bg-amber-100 text-amber-700" 
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      {day}
                    </span>
                  </div>
                  
                  {/* Event Chips */}
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`
                          px-1.5 py-0.5 rounded text-[10px] font-medium text-white truncate
                          ${getEventColor()}
                          hover:opacity-90 transition-opacity
                        `}
                        title={`${formatTime(event.start_time)} ${getEventLocation(event)}`}
                      >
                        {formatTime(event.start_time)} {getEventLocation(event)}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-500 font-medium pl-1.5">
                        +{dayEvents.length - 3} mehr
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500" />
            <span>Pater Brown Termine</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span>(KL) = Konzertdirektion Landgraf</span>
            <span>•</span>
            <span>(KBA) = Konzertbüro Augsburg</span>
          </div>
        </div>
      </div>

      {/* Event Details Sidebar */}
      <div className="lg:w-80 xl:w-96">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-24">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              {selectedDate ? (
                selectedDate.toLocaleDateString("de-DE", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              ) : (
                "Datum auswählen"
              )}
            </h3>
            {selectedDate && (
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedEvents.length} {selectedEvents.length === 1 ? "Termin" : "Termine"}
              </p>
            )}
          </div>

          {/* Events List */}
          <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
            {!selectedDate ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Klicke auf einen Tag im Kalender
                </p>
              </div>
            ) : selectedEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  Keine Termine an diesem Tag
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group relative p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-150"
                  >
                    {/* Color Indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${getEventColor()}`} />
                    
                    <div className="pl-3">
                      {/* Time */}
                      <div className={`text-xs font-semibold ${getEventTextColor()} mb-1`}>
                        {formatTime(event.start_time)}
                        {event.end_time && ` – ${formatTime(event.end_time)}`}
                      </div>
                      
                      {/* Title */}
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {getEventDisplayTitle(event)}, {getEventLocation(event)}
                      </p>
                      
                      {/* Venue */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{event.venue_name || getEventLocation(event)}</span>
                      </div>
                      
                      {/* Venue */}
                      {event.venue_name && (
                        <p className="text-xs text-gray-500 mt-1 pl-4">
                          {event.venue_name}
                        </p>
                      )}
                      
                      {/* Note */}
                      {event.note && (
                        <p className="text-xs text-gray-400 italic mt-1 pl-4">
                          {event.note}
                        </p>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
