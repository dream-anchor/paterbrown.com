import { useMemo } from "react";
import { MapPin, Calendar, Clock } from "lucide-react";

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
  latitude: number | null;
  longitude: number | null;
}

interface EventMapProps {
  events: AdminEvent[];
}

const EventMap = ({ events }: EventMapProps) => {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  }, [events]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "KL":
        return "bg-blue-500";
      case "KBA":
        return "bg-purple-500";
      default:
        return "bg-yellow-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-foreground mb-2">Tour-Übersicht</h2>
        <p className="text-muted-foreground text-sm">
          Alle Termine chronologisch sortiert
        </p>
      </div>

      {/* Map Placeholder - In a real implementation, this would be Mapbox or Leaflet */}
      <div className="bg-card/50 border border-border rounded-xl p-8 text-center">
        <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-2">
          Karten-Integration benötigt Mapbox Token
        </p>
        <p className="text-xs text-muted-foreground">
          Die Events werden unten als Liste angezeigt
        </p>
      </div>

      {/* Events Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">
          {sortedEvents.length} Termine
        </h3>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          {/* Events */}
          <div className="space-y-4">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="relative pl-12">
                {/* Timeline dot */}
                <div
                  className={`absolute left-2.5 w-4 h-4 rounded-full border-2 border-background ${getSourceColor(event.source)}`}
                />

                <div className="p-4 bg-card/50 border border-border rounded-lg hover:border-gold/30 transition-colors">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="w-3 h-3" />
                    {formatDate(event.start_time)}
                    <span className="mx-1">·</span>
                    <Clock className="w-3 h-3" />
                    {formatTime(event.start_time)} Uhr
                  </div>

                  <p className="font-bold text-foreground">{event.title}</p>
                  
                  <div className="flex items-center gap-2 text-gold text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                    {event.state && ` (${event.state})`}
                  </div>

                  {event.venue_name && (
                    <p className="text-muted-foreground text-sm mt-1">
                      {event.venue_name}
                    </p>
                  )}

                  {event.note && (
                    <p className="text-muted-foreground text-sm italic mt-2 pt-2 border-t border-border">
                      {event.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {sortedEvents.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Noch keine Termine vorhanden</p>
        </div>
      )}
    </div>
  );
};

export default EventMap;
