import { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { Calendar, Clock, MapPin, Navigation, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Component to auto-fit map bounds to all markers
const FitBoundsToMarkers = ({ coords }: { coords: [number, number][] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { 
        padding: [40, 40],
        maxZoom: 8
      });
    }
  }, [coords, map]);
  
  return null;
};

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Create numbered marker icon
const createNumberedIcon = (num: number) => {
  return L.divIcon({
    className: 'custom-numbered-marker',
    html: `<div style="
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Known German cities with coordinates
const CITY_COORDINATES: Record<string, [number, number]> = {
  "Hamburg": [53.5511, 9.9937],
  "München": [48.1351, 11.5820],
  "Berlin": [52.5200, 13.4050],
  "Frankfurt": [50.1109, 8.6821],
  "Stuttgart": [48.7758, 9.1829],
  "Köln": [50.9375, 6.9603],
  "Düsseldorf": [51.2277, 6.7735],
  "Leipzig": [51.3397, 12.3731],
  "Dresden": [51.0504, 13.7373],
  "Hannover": [52.3759, 9.7320],
  "Nürnberg": [49.4521, 11.0767],
  "Bremen": [53.0793, 8.8017],
  "Essen": [51.4556, 7.0116],
  "Dortmund": [51.5136, 7.4653],
  "Augsburg": [48.3705, 10.8978],
  "Würzburg": [49.7913, 9.9534],
  "Mannheim": [49.4875, 8.4660],
  "Karlsruhe": [49.0069, 8.4037],
  "Freiburg": [47.9990, 7.8421],
  "Mainz": [49.9929, 8.2473],
  "Wiesbaden": [50.0826, 8.2400],
  "Bonn": [50.7374, 7.0982],
  "Münster": [51.9607, 7.6261],
  "Bielefeld": [52.0302, 8.5325],
  "Kiel": [54.3233, 10.1228],
  "Lübeck": [53.8655, 10.6866],
  "Rostock": [54.0924, 12.0991],
  "Erfurt": [50.9848, 11.0299],
  "Magdeburg": [52.1205, 11.6276],
  "Potsdam": [52.3906, 13.0645],
  "Saarbrücken": [49.2402, 6.9969],
  "Kassel": [51.3127, 9.4797],
  "Regensburg": [49.0134, 12.1016],
  "Ulm": [48.4011, 9.9876],
  "Heilbronn": [49.1427, 9.2109],
  "Pforzheim": [48.8922, 8.6946],
  "Ingolstadt": [48.7665, 11.4258],
  "Oldenburg": [53.1435, 8.2146],
  "Osnabrück": [52.2799, 8.0472],
  "Göttingen": [51.5413, 9.9158],
  "Wolfsburg": [52.4227, 10.7865],
  "Braunschweig": [52.2689, 10.5268],
  "Paderborn": [51.7189, 8.7575],
  "Aachen": [50.7753, 6.0839],
  "Krefeld": [51.3388, 6.5853],
  "Mönchengladbach": [51.1805, 6.4428],
  "Oberhausen": [51.4963, 6.8625],
  "Hagen": [51.3671, 7.4633],
  "Solingen": [51.1652, 7.0671],
  "Wuppertal": [51.2562, 7.1508],
  "Bochum": [51.4818, 7.2162],
  "Duisburg": [51.4344, 6.7623],
  "Gelsenkirchen": [51.5177, 7.0857],
  "Chemnitz": [50.8278, 12.9214],
  "Halle": [51.4969, 11.9688],
  "Schwerin": [53.6355, 11.4012],
  "Trier": [49.7490, 6.6371],
  "Koblenz": [50.3569, 7.5890],
  "Ludwigshafen": [49.4774, 8.4452],
  "Darmstadt": [49.8728, 8.6512],
  "Offenbach": [50.0956, 8.7761],
  "Heidelberg": [49.3988, 8.6724],
  "Konstanz": [47.6779, 9.1732],
  "Baden-Baden": [48.7606, 8.2399],
  "Passau": [48.5665, 13.4319],
  "Bamberg": [49.8988, 10.9028],
  "Bayreuth": [49.9456, 11.5713],
  "Coburg": [50.2612, 10.9627],
  "Landshut": [48.5442, 12.1520],
  "Straubing": [48.8777, 12.5739],
  "Rosenheim": [47.8561, 12.1289],
  "Kempten": [47.7267, 10.3168],
  "Lindau": [47.5460, 9.6829],
  "Garmisch-Partenkirchen": [47.5009, 11.0953],
  "Berchtesgaden": [47.6300, 13.0044],
};

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
  onEventsUpdated?: () => void;
}

const EventMap = ({ events, onEventsUpdated }: EventMapProps) => {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  }, [events]);


  // Get coordinates for an event
  const getCoordinates = (event: AdminEvent): [number, number] | null => {
    // First try stored coordinates
    if (event.latitude && event.longitude) {
      return [event.latitude, event.longitude];
    }
    
    // Then try to match city name
    const cityName = event.location.split(",")[0].trim();
    for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
      if (cityName.toLowerCase().includes(city.toLowerCase()) || 
          city.toLowerCase().includes(cityName.toLowerCase())) {
        return coords;
      }
    }
    
    return null;
  };

  // Events with valid coordinates
  const eventsWithCoords = useMemo(() => {
    return sortedEvents
      .map(event => ({
        ...event,
        coords: getCoordinates(event),
      }))
      .filter(event => event.coords !== null);
  }, [sortedEvents]);

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

  // Germany center
  const germanCenter: [number, number] = [51.1657, 10.4515];

  // Route coordinates for polyline
  const routeCoords = useMemo(() => {
    return eventsWithCoords.map(e => e.coords as [number, number]);
  }, [eventsWithCoords]);

  // Count events with missing geodata
  const eventsWithMissingGeodata = useMemo(() => {
    return sortedEvents.filter(event => !event.latitude || !event.longitude || !event.state);
  }, [sortedEvents]);

  // Handle geocoding
  const handleGeocodeEvents = async () => {
    setIsGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke("geocode-events");
      
      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Geodaten aktualisiert",
        description: `${data.updated} von ${data.total} Events wurden aktualisiert.`,
      });

      // Refresh events
      if (onEventsUpdated) {
        onEventsUpdated();
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast({
        title: "Fehler beim Geocoding",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  // Scroll to event in list
  const scrollToEvent = (eventId: string) => {
    const element = document.getElementById(`station-${eventId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveEventId(eventId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Missing Geodata Warning */}
      {eventsWithMissingGeodata.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">
                {eventsWithMissingGeodata.length} Termine ohne vollständige Geodaten
              </p>
              <p className="text-sm text-amber-600">
                KI kann fehlende Koordinaten und Bundesländer recherchieren
              </p>
            </div>
          </div>
          <button
            onClick={handleGeocodeEvents}
            disabled={isGeocoding}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isGeocoding ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Recherchiere...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Geodaten ergänzen
              </>
            )}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Tour-Karte</h2>
        <p className="text-gray-600 text-sm">
          {eventsWithCoords.length} von {sortedEvents.length} Termine auf der Karte
        </p>
        {eventsWithCoords.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2 text-amber-600 text-sm">
            <Navigation className="w-4 h-4" />
            <span>Tourverlauf: {eventsWithCoords.length} Stationen</span>
          </div>
        )}
      </div>

      {/* Split Layout: Map + List */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Map - 2/5 columns (sticky) */}
        <div className="lg:col-span-2 lg:sticky lg:top-28 lg:self-start">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <MapContainer
              center={germanCenter}
              zoom={6}
              scrollWheelZoom={true}
              className="h-[600px] lg:h-[800px] w-full"
            >
              <FitBoundsToMarkers coords={routeCoords} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Route line */}
              {routeCoords.length > 1 && (
                <Polyline
                  positions={routeCoords}
                  color="#f59e0b"
                  weight={3}
                  opacity={0.7}
                  dashArray="8, 8"
                />
              )}
              
              {/* Numbered markers */}
              {eventsWithCoords.map((event, index) => (
                <Marker 
                  key={event.id} 
                  position={event.coords as [number, number]}
                  icon={createNumberedIcon(index + 1)}
                  eventHandlers={{
                    click: () => scrollToEvent(event.id),
                  }}
                >
                  <Popup>
                    <div className="min-w-[180px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Station {index + 1}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 mb-1">{event.title}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event.start_time)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white shadow">1</div>
              <span>Station</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-amber-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 4px, transparent 4px, transparent 8px)' }}></div>
              <span>Route</span>
            </div>
          </div>
        </div>

        {/* Stations List - 3/5 columns */}
        <div className="lg:col-span-3 space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 sticky top-24 bg-gray-50/95 backdrop-blur-sm py-2">
            Alle Stationen · {sortedEvents.length} Termine
          </h3>
          
          {sortedEvents.map((event, index) => (
            <div
              key={event.id}
              id={`station-${event.id}`}
              className={cn(
                "flex items-center gap-3 p-3 bg-white rounded-lg border transition-all cursor-pointer",
                activeEventId === event.id 
                  ? "border-amber-500 ring-2 ring-amber-200 shadow-md" 
                  : "border-gray-200 hover:border-amber-300 hover:shadow-sm"
              )}
              onMouseEnter={() => setActiveEventId(event.id)}
              onMouseLeave={() => setActiveEventId(null)}
            >
              {/* Number */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                {index + 1}
              </div>
              
              {/* Event Details */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {event.location}{event.state ? ` (${event.state})` : ''}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span>{formatDate(event.start_time)}</span>
                  <span>·</span>
                  <span>{formatTime(event.start_time)} Uhr</span>
                </div>
                {event.venue_name && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{event.venue_name}</p>
                )}
              </div>

              {/* Source Badge */}
              <span className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0",
                event.source === "KL" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
              )}>
                {event.source}
              </span>
            </div>
          ))}

          {sortedEvents.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Termine vorhanden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventMap;
