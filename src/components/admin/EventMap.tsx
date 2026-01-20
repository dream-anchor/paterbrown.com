import { useMemo, useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { Calendar, Clock, MapPin, Navigation, RefreshCw, CheckCircle, AlertCircle, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Type for driving distance between events
interface DrivingDistance {
  fromId: string;
  toId: string;
  distanceKm: number;
  durationMin: number;
}

// Type for cached route from database
interface CachedRoute {
  id: string;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  distance_km: number;
  duration_min: number;
}

// Round coordinates to 4 decimal places (~11m precision) for cache key
const roundCoord = (coord: number): number => Math.round(coord * 10000) / 10000;

// Generate cache key from coordinates
const getCacheKey = (from: [number, number], to: [number, number]): string => {
  return `${roundCoord(from[0])},${roundCoord(from[1])}-${roundCoord(to[0])},${roundCoord(to[1])}`;
};

// Function to fetch driving distance using OSRM
const fetchDrivingDistance = async (
  from: [number, number],
  to: [number, number]
): Promise<{ distanceKm: number; durationMin: number } | null> => {
  try {
    // OSRM expects coordinates as longitude,latitude
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=false`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code === "Ok" && data.routes?.[0]) {
      const route = data.routes[0];
      return {
        distanceKm: Math.round(route.distance / 1000),
        durationMin: Math.round(route.duration / 60),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching driving distance:", error);
    return null;
  }
};

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

// Create numbered marker icon with source-based colors
const createNumberedIcon = (num: number, source?: "KL" | "KBA" | "unknown") => {
  // KL = Yellow, KBA = Green, unknown = Gray
  const gradient = source === "KL" 
    ? "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)"
    : source === "KBA"
    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)";
  
  // Use dark text for yellow (better contrast)
  const textColor = source === "KL" ? "#1f2937" : "white";
  
  return L.divIcon({
    className: 'custom-numbered-marker',
    html: `<div style="
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: ${gradient};
      color: ${textColor};
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

// Create highlighted marker icon (larger, pulsating) with source-based colors
const createHighlightedIcon = (num: number, source?: "KL" | "KBA" | "unknown") => {
  // KL = Yellow, KBA = Green
  const gradient = source === "KL" 
    ? "linear-gradient(135deg, #facc15 0%, #eab308 100%)"
    : source === "KBA"
    ? "linear-gradient(135deg, #34d399 0%, #10b981 100%)"
    : "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)";
  
  const shadowColor = source === "KL" 
    ? "rgba(234, 179, 8, 0.6)"
    : source === "KBA"
    ? "rgba(5, 150, 105, 0.6)"
    : "rgba(107, 114, 128, 0.6)";
  
  // Use dark text for yellow (better contrast)
  const textColor = source === "KL" ? "#1f2937" : "white";
  
  return L.divIcon({
    className: 'custom-highlighted-marker',
    html: `<div style="
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${gradient};
      color: ${textColor};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      border: 4px solid white;
      box-shadow: 0 0 20px ${shadowColor}, 0 4px 12px rgba(0,0,0,0.3);
      animation: marker-pulse 1.5s infinite;
    ">${num}</div>
    <style>
      @keyframes marker-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
      }
    </style>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
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
  initialActiveEventId?: string;
}

const EventMap = ({ events, onEventsUpdated, initialActiveEventId }: EventMapProps) => {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(initialActiveEventId || null);
  const [drivingDistances, setDrivingDistances] = useState<Map<string, DrivingDistance>>(new Map());
  const [isLoadingDistances, setIsLoadingDistances] = useState(false);
  const [routesLoaded, setRoutesLoaded] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const { toast } = useToast();
  
  // Get available years from events
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    events.forEach(event => {
      const year = new Date(event.start_time).getFullYear().toString();
      years.add(year);
    });
    return Array.from(years).sort();
  }, [events]);
  
  // Handle initial active event on mount or when it changes
  useEffect(() => {
    if (initialActiveEventId) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const element = document.getElementById(`station-${initialActiveEventId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setActiveEventId(initialActiveEventId);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [initialActiveEventId]);
  
  // Filter and sort events
  const sortedEvents = useMemo(() => {
    return [...events]
      .filter(event => {
        const eventYear = new Date(event.start_time).getFullYear().toString();
        const yearMatch = selectedYear === "all" || eventYear === selectedYear;
        const sourceMatch = selectedSource === "all" || event.source === selectedSource;
        return yearMatch && sourceMatch;
      })
      .sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
  }, [events, selectedYear, selectedSource]);


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

  // Fetch driving distances between consecutive events with caching
  const loadDrivingDistances = useCallback(async () => {
    if (eventsWithCoords.length < 2) return;
    
    setIsLoadingDistances(true);
    const newDistances = new Map<string, DrivingDistance>();
    
    try {
      // 1. Load cached routes from database
      const { data: cachedRoutes, error: cacheError } = await supabase
        .from('cached_routes')
        .select('*');
      
      if (cacheError) {
        console.error('Error loading cached routes:', cacheError);
      }
      
      // Build cache map from database
      const routeCache = new Map<string, { distanceKm: number; durationMin: number }>();
      cachedRoutes?.forEach((route: CachedRoute) => {
        const key = getCacheKey([route.from_lat, route.from_lng], [route.to_lat, route.to_lng]);
        routeCache.set(key, { distanceKm: route.distance_km, durationMin: route.duration_min });
      });
      
      // 2. Check which routes need to be fetched
      const missingRoutes: { from: [number, number]; to: [number, number]; fromId: string; toId: string }[] = [];
      
      for (let i = 0; i < eventsWithCoords.length - 1; i++) {
        const fromEvent = eventsWithCoords[i];
        const toEvent = eventsWithCoords[i + 1];
        const eventKey = `${fromEvent.id}-${toEvent.id}`;
        const cacheKey = getCacheKey(fromEvent.coords as [number, number], toEvent.coords as [number, number]);
        
        // Check if we have it in DB cache
        if (routeCache.has(cacheKey)) {
          const cached = routeCache.get(cacheKey)!;
          newDistances.set(eventKey, {
            fromId: fromEvent.id,
            toId: toEvent.id,
            distanceKm: cached.distanceKm,
            durationMin: cached.durationMin,
          });
        } else {
          // Need to fetch this route
          missingRoutes.push({
            from: fromEvent.coords as [number, number],
            to: toEvent.coords as [number, number],
            fromId: fromEvent.id,
            toId: toEvent.id,
          });
        }
      }
      
      // 3. Fetch missing routes from OSRM and save to DB
      if (missingRoutes.length > 0) {
        console.log(`Fetching ${missingRoutes.length} new routes from OSRM...`);
        
        const routesToSave: { 
          from_lat: number; 
          from_lng: number; 
          to_lat: number; 
          to_lng: number; 
          distance_km: number; 
          duration_min: number; 
        }[] = [];
        
        for (const route of missingRoutes) {
          const result = await fetchDrivingDistance(route.from, route.to);
          
          if (result) {
            const eventKey = `${route.fromId}-${route.toId}`;
            newDistances.set(eventKey, {
              fromId: route.fromId,
              toId: route.toId,
              distanceKm: result.distanceKm,
              durationMin: result.durationMin,
            });
            
            // Prepare for DB save (use rounded coords)
            routesToSave.push({
              from_lat: roundCoord(route.from[0]),
              from_lng: roundCoord(route.from[1]),
              to_lat: roundCoord(route.to[0]),
              to_lng: roundCoord(route.to[1]),
              distance_km: result.distanceKm,
              duration_min: result.durationMin,
            });
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // 4. Save new routes to database
        if (routesToSave.length > 0) {
          const { error: insertError } = await supabase
            .from('cached_routes')
            .upsert(routesToSave, { 
              onConflict: 'from_lat,from_lng,to_lat,to_lng',
              ignoreDuplicates: true 
            });
          
          if (insertError) {
            console.error('Error saving routes to cache:', insertError);
          } else {
            console.log(`Saved ${routesToSave.length} new routes to cache`);
          }
        }
      } else {
        console.log('All routes loaded from cache');
      }
      
    } catch (error) {
      console.error('Error in loadDrivingDistances:', error);
    }
    
    setDrivingDistances(newDistances);
    setIsLoadingDistances(false);
  }, [eventsWithCoords]);

  // Load distances automatically on mount (only once)
  useEffect(() => {
    if (eventsWithCoords.length > 1 && !routesLoaded) {
      loadDrivingDistances().then(() => setRoutesLoaded(true));
    }
  }, [eventsWithCoords.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get distance to next event
  const getDistanceToNext = (eventId: string, nextEventId: string | null): DrivingDistance | null => {
    if (!nextEventId) return null;
    return drivingDistances.get(`${eventId}-${nextEventId}`) || null;
  };

  // Format duration in hours and minutes
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} Min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

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
      timeZone: "Europe/Berlin",
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
    <div className="space-y-4">
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

      {/* Header with Filters */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Tour-Karte</h2>
          <p className="text-gray-600 text-sm">
            {eventsWithCoords.length} von {sortedEvents.length} Termine auf der Karte
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Jahr:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Alle Jahre</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {/* Source Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Quelle:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Alle</option>
              <option value="KL">Landgraf</option>
              <option value="KBA">KBA</option>
            </select>
          </div>
          
          {/* Count Badge */}
          {(selectedYear !== "all" || selectedSource !== "all") && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              {sortedEvents.length} Termine gefiltert
            </span>
          )}
        </div>
        
        {eventsWithCoords.length > 1 && (
          <div className="flex items-center justify-center gap-2 text-amber-600 text-sm">
            <Navigation className="w-4 h-4" />
            <span>Tourverlauf: {eventsWithCoords.length} Stationen</span>
          </div>
        )}
      </div>

      {/* Desktop: Split-View Grid Layout | Mobile: Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Sticky Map (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          {/* Map fills full sticky container */}
          <div className="h-[500px] lg:h-full w-full flex flex-col">
            <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <MapContainer
                center={germanCenter}
                zoom={6}
                scrollWheelZoom={true}
                className="h-full w-full"
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
                    icon={activeEventId === event.id 
                      ? createHighlightedIcon(index + 1, event.source) 
                      : createNumberedIcon(index + 1, event.source)}
                    eventHandlers={{
                      click: () => scrollToEvent(event.id),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[180px]">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full
                            ${event.source === "KL" ? "bg-yellow-500 text-yellow-900" : 
                              event.source === "KBA" ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"}`}>
                            Station {index + 1}
                          </span>
                          <span className={`text-xs font-medium
                            ${event.source === "KL" ? "text-yellow-600" : 
                              event.source === "KBA" ? "text-emerald-600" : "text-gray-600"}`}>
                            {event.source === "KL" ? "Landgraf" : 
                             event.source === "KBA" ? "KBA" : ""}
                          </span>
                        </div>
                        <p className="font-bold text-gray-900 mb-1">{event.title}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.start_time)}
                        </div>
                        <div className={`flex items-center gap-1 text-xs
                          ${event.source === "KL" ? "text-yellow-600" : 
                            event.source === "KBA" ? "text-emerald-600" : "text-gray-600"}`}>
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Legend - below map */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-3 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 text-[10px] flex items-center justify-center font-bold border-2 border-white shadow">1</div>
                <span>Landgraf</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white shadow">1</div>
                <span>KBA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 bg-amber-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 4px, transparent 4px, transparent 8px)' }}></div>
                <span>Route</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Scrollable Stations List (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 sticky top-0 bg-gray-50/95 backdrop-blur-sm py-2 z-10 flex items-center justify-between">
            <span>Alle Stationen · {sortedEvents.length} Termine</span>
            {isLoadingDistances && (
              <span className="text-amber-500 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Routen laden...
              </span>
            )}
          </h3>
          
          {sortedEvents.map((event, index) => {
            const nextEvent = sortedEvents[index + 1];
            const distanceInfo = nextEvent ? getDistanceToNext(event.id, nextEvent.id) : null;
            
            return (
              <div key={event.id}>
                {/* Event Card */}
                <div
                  id={`station-${event.id}`}
                  className={cn(
                    "flex items-center gap-3 p-3 bg-white rounded-lg border transition-all cursor-pointer",
                    activeEventId === event.id 
                      ? event.source === "KL" 
                        ? "border-yellow-500 ring-2 ring-yellow-200 shadow-md"
                        : event.source === "KBA"
                        ? "border-emerald-500 ring-2 ring-emerald-200 shadow-md"
                        : "border-gray-500 ring-2 ring-gray-200 shadow-md"
                      : event.source === "KL"
                        ? "border-gray-200 hover:border-yellow-300 hover:shadow-sm"
                        : event.source === "KBA"
                        ? "border-gray-200 hover:border-emerald-300 hover:shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  )}
                  onMouseEnter={() => setActiveEventId(event.id)}
                  onMouseLeave={() => setActiveEventId(null)}
                  onClick={() => setActiveEventId(activeEventId === event.id ? null : event.id)}
                >
                  {/* Number - colored by source */}
                  <div className={cn(
                    "w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-sm",
                    event.source === "KL" 
                      ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900"
                      : event.source === "KBA"
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white"
                      : "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
                  )}>
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
                    event.source === "KL" ? "bg-yellow-100 text-yellow-700" : 
                    event.source === "KBA" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600"
                  )}>
                    {event.source === "KL" ? "Landgraf" : 
                     event.source === "KBA" ? "KBA" : event.source}
                  </span>
                </div>

                {/* Distance to next station */}
                {nextEvent && (
                  <div className="flex items-center justify-center py-2 px-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="h-4 w-px bg-gray-300"></div>
                      <Car className="w-3.5 h-3.5 text-amber-500" />
                      {distanceInfo ? (
                        <span className="font-medium text-gray-600">
                          {distanceInfo.distanceKm} km · {formatDuration(distanceInfo.durationMin)}
                        </span>
                      ) : isLoadingDistances ? (
                        <span className="text-gray-400">...</span>
                      ) : (
                        <span className="text-gray-400">Route nicht verfügbar</span>
                      )}
                      <div className="h-4 w-px bg-gray-300"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

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
