import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Calendar, Clock, MapPin, Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
}

const EventMap = ({ events }: EventMapProps) => {
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Tour-Übersicht</h2>
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

      {/* Leaflet Map */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <MapContainer
          center={germanCenter}
          zoom={6}
          scrollWheelZoom={true}
          className="h-[500px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Route line connecting all stations */}
          {routeCoords.length > 1 && (
            <Polyline
              positions={routeCoords}
              color="#f59e0b"
              weight={3}
              opacity={0.7}
              dashArray="8, 8"
            />
          )}
          
          {/* Numbered markers for each station */}
          {eventsWithCoords.map((event, index) => (
            <Marker 
              key={event.id} 
              position={event.coords as [number, number]}
              icon={createNumberedIcon(index + 1)}
            >
              <Popup>
                <div className="min-w-[200px]">
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
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(event.start_time)} Uhr
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </div>
                  {event.venue_name && (
                    <p className="text-xs text-gray-400 mt-1">{event.venue_name}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      {eventsWithCoords.length > 0 && (
        <div className="flex items-center justify-center gap-6 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white text-xs flex items-center justify-center font-bold border-2 border-white shadow">1</div>
            <span>Nummerierte Stationen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-amber-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 8px, transparent 8px, transparent 16px)' }}></div>
            <span>Tourverlauf</span>
          </div>
        </div>
      )}

      {/* Events Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">
          {sortedEvents.length} Termine
        </h3>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-amber-200" />

          {/* Events */}
          <div className="space-y-4">
            {sortedEvents.map((event) => (
              <div key={event.id} className="relative pl-12">
                {/* Timeline dot */}
                <div className="absolute left-2.5 w-4 h-4 rounded-full border-2 border-white shadow bg-amber-500" />

                <div className="p-4 bg-white border border-gray-200 rounded-lg hover:border-amber-300 transition-colors shadow-sm">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Calendar className="w-3 h-3" />
                    {formatDate(event.start_time)}
                    <span className="mx-1">·</span>
                    <Clock className="w-3 h-3" />
                    {formatTime(event.start_time)} Uhr
                  </div>

                  <p className="font-bold text-gray-900">{event.title}</p>
                  
                  <div className="flex items-center gap-2 text-amber-600 text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                    {event.state && ` (${event.state})`}
                  </div>

                  {event.venue_name && (
                    <p className="text-gray-500 text-sm mt-1">
                      {event.venue_name}
                    </p>
                  )}

                  {event.note && (
                    <p className="text-gray-400 text-sm italic mt-2 pt-2 border-t border-gray-200">
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
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Noch keine Termine vorhanden</p>
        </div>
      )}
    </div>
  );
};

export default EventMap;
