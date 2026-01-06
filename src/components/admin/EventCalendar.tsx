import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock, Trash2 } from "lucide-react";
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
    
    // Adjust for Monday start (0 = Monday, 6 = Sunday)
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

  const selectedDateStr = selectedDate?.toISOString().split("T")[0];
  const selectedEvents = selectedDateStr ? eventsByDate[selectedDateStr] || [] : [];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-card transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h2 className="text-xl font-bold text-foreground">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-card transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card/50 border border-border rounded-xl p-4">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for start offset */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = eventsByDate[dateStr] || [];
            const hasEvents = dayEvents.length > 0;
            const isSelected = selectedDate?.getDate() === day && 
                              selectedDate?.getMonth() === currentDate.getMonth() &&
                              selectedDate?.getFullYear() === currentDate.getFullYear();
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all
                  ${isSelected ? "bg-gold text-primary-foreground" : "hover:bg-card"}
                  ${isToday && !isSelected ? "ring-2 ring-gold/50" : ""}
                `}
              >
                <span className={`text-sm ${isSelected ? "font-bold" : ""}`}>
                  {day}
                </span>
                {hasEvents && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          e.source === "KL"
                            ? "bg-blue-400"
                            : e.source === "KBA"
                            ? "bg-purple-400"
                            : "bg-yellow-400"
                        } ${isSelected ? "opacity-70" : ""}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground">
            {selectedDate.toLocaleDateString("de-DE", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>

          {selectedEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm p-4 bg-card/50 border border-border rounded-lg">
              Keine Termine an diesem Tag
            </p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-card/50 border border-border rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-foreground">{event.title}</p>
                      <div className="flex items-center gap-2 text-gold text-sm">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                        {event.state && ` (${event.state})`}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(event.start_time)}
                        {event.end_time && ` – ${formatTime(event.end_time)}`} Uhr
                      </div>
                      {event.venue_name && (
                        <p className="text-muted-foreground text-sm mt-1">
                          📍 {event.venue_name}
                        </p>
                      )}
                      {event.note && (
                        <p className="text-muted-foreground text-sm italic mt-1">
                          {event.note}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          KL
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          KBA
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          Unbekannt
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
