import { useMemo, useState, useEffect, useCallback, useRef, type RefObject } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, MapPin, Navigation, RefreshCw,
  AlertCircle, Car, ExternalLink, Eye, Filter, ChevronDown,
  Sparkles, Pencil, ChevronUp, Route
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { haptics } from "@/lib/haptics";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EventEditModal, { type UniversalEvent } from "./EventEditModal";
import TourStationCard from "./TourStationCard";

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
const FitBoundsToMarkers = ({
  coords,
  watch,
}: {
  coords: [number, number][];
  watch?: string;
}) => {
  const map = useMap();
  
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);

      const getTightPadding = () => {
        // Goal: show all cities with minimal margins so the route completely fills the viewport.
        // Use very small padding - just enough to not clip markers at the edge.
        return [4, 4] as [number, number];
      };

      // Delay slightly so Leaflet has the correct container size on mobile.
      // Without this, fitBounds can calculate with a too-small width (gray area issue)
      // and ends up zooming way too far out.
      const t = window.setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(bounds, {
          padding: getTightPadding(),
          // Allow closer framing for filtered subsets while still keeping all cities visible.
          maxZoom: 10,
        });
      }, 200);

      return () => window.clearTimeout(t);
    }
  }, [coords, map, watch]);
  
  return null;
};

/**
 * Leaflet can render with a wrong internal size if the container changes after mount
 * (very common on mobile with sticky headers / dynamic heights). This leads to the
 * classic "gray area" / clipped tiles on the right.
 */
const InvalidateLeafletSize = ({
  containerRef,
  watch,
}: {
  containerRef: RefObject<HTMLElement>;
  watch?: string;
}) => {
  const map = useMap();

  useEffect(() => {
    // 1) immediate + delayed invalidation (covers initial layout + fonts)
    const raf = requestAnimationFrame(() => map.invalidateSize());
    const t = window.setTimeout(() => map.invalidateSize(), 150);

    // 2) observe container resizes (orientation change, address bar collapse, etc.)
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(t);
      };
    }

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      ro.disconnect();
    };
  }, [map, containerRef, watch]);

  return null;
};

// Component to pan the map to a specific coordinate (keep current zoom)
const FlyToMarker = ({ coords }: { coords: [number, number] | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coords) {
      // Important: do NOT change zoom when selecting from list on mobile.
      // We only pan so the marker becomes visible + highlighted.
      map.panTo(coords, { animate: true, duration: 0.5 });
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

// Get event status based on date
type EventStatus = "upcoming" | "today" | "past";
const getEventStatus = (startTime: string): EventStatus => {
  const eventDate = new Date(startTime);
  const today = new Date();
  const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  if (eventDateOnly.getTime() === todayOnly.getTime()) return "today";
  if (eventDateOnly > todayOnly) return "upcoming";
  return "past";
};

// Status-based colors
const statusColors = {
  upcoming: {
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    bg: "bg-amber-500",
    bgLight: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-500",
    ring: "ring-amber-200",
    shadow: "rgba(245, 158, 11, 0.6)",
  },
  today: {
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    bg: "bg-red-500",
    bgLight: "bg-red-100",
    text: "text-red-700",
    border: "border-red-500",
    ring: "ring-red-200",
    shadow: "rgba(239, 68, 68, 0.6)",
  },
  past: {
    gradient: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
    bg: "bg-gray-400",
    bgLight: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-400",
    ring: "ring-gray-200",
    shadow: "rgba(107, 114, 128, 0.4)",
  },
};

// Create status-based marker icon
const createStatusIcon = (num: number, status: EventStatus) => {
  const colors = statusColors[status];
  const isPulsing = status === "today";
  
  return L.divIcon({
    className: 'custom-status-marker',
    html: `<div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${colors.gradient};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 13px;
      border: 3px solid white;
      box-shadow: 0 2px 8px ${colors.shadow};
      ${isPulsing ? 'animation: marker-pulse 1s infinite;' : ''}
    ">${num}</div>
    ${isPulsing ? `<style>
      @keyframes marker-pulse {
        0%, 100% { transform: scale(1); box-shadow: 0 2px 8px ${colors.shadow}; }
        50% { transform: scale(1.1); box-shadow: 0 4px 20px ${colors.shadow}; }
      }
    </style>` : ''}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Create highlighted marker icon
const createHighlightedStatusIcon = (num: number, status: EventStatus) => {
  const colors = statusColors[status];
  
  return L.divIcon({
    className: 'custom-highlighted-marker',
    html: `<div style="
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: ${colors.gradient};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      border: 4px solid white;
      box-shadow: 0 0 24px ${colors.shadow}, 0 4px 16px rgba(0,0,0,0.3);
      animation: marker-glow 1.5s infinite;
    ">${num}</div>
    <style>
      @keyframes marker-glow {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
      }
    </style>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
};

// Cluster colors by source - darker versions
const clusterColors = {
  KL: {
    gradient: "linear-gradient(135deg, #b45309 0%, #92400e 100%)",
    shadow: "rgba(180, 83, 9, 0.5)",
  },
  KBA: {
    gradient: "linear-gradient(135deg, #047857 0%, #065f46 100%)",
    shadow: "rgba(4, 120, 87, 0.5)",
  },
  mixed: {
    gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    shadow: "rgba(99, 102, 241, 0.5)",
  },
};

// Convert number to Roman numerals (for cluster markers)
const toRoman = (num: number): string => {
  if (num <= 0 || num > 50) return num.toString(); // Fallback for edge cases
  const romanNumerals: [number, string][] = [
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'],
    [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  for (const [value, symbol] of romanNumerals) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
};

// Create cluster icon with source-based coloring
// Uses ROMAN NUMERALS to differentiate from single station markers (Arabic)
const createClusterCustomIcon = (cluster: any, isHighlighted: boolean = false) => {
  const count = cluster.getChildCount();
  const markers = cluster.getAllChildMarkers();
  
  // Determine dominant source in cluster
  let klCount = 0;
  let kbaCount = 0;
  
  markers.forEach((marker: any) => {
    const source = marker.options?.eventSource;
    if (source === "KL") klCount++;
    else if (source === "KBA") kbaCount++;
  });
  
  // Choose color based on majority
  let colorScheme = clusterColors.mixed;
  if (klCount > 0 && kbaCount === 0) {
    colorScheme = clusterColors.KL;
  } else if (kbaCount > 0 && klCount === 0) {
    colorScheme = clusterColors.KBA;
  }
  
  const size = isHighlighted ? 48 : 40;
  // Dynamic font size based on Roman numeral length
  const romanNumeral = toRoman(count);
  const baseFontSize = isHighlighted ? 14 : 12;
  const fontSize = romanNumeral.length > 4 ? baseFontSize - 2 : baseFontSize;
  const borderWidth = isHighlighted ? 4 : 3;
  const animation = isHighlighted ? 'animation: cluster-glow 1.5s infinite;' : '';
  const glowShadow = isHighlighted 
    ? `0 0 24px ${colorScheme.shadow}, 0 4px 16px rgba(0,0,0,0.3)` 
    : `0 4px 12px ${colorScheme.shadow}`;
  
  return L.divIcon({
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${colorScheme.gradient};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: ${fontSize}px;
      font-family: 'Times New Roman', Georgia, serif;
      letter-spacing: -0.5px;
      border: ${borderWidth}px solid white;
      box-shadow: ${glowShadow};
      ${animation}
    ">${romanNumeral}</div>
    ${isHighlighted ? `<style>
      @keyframes cluster-glow {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    </style>` : ''}`,
    className: 'custom-cluster-icon',
    iconSize: L.point(size, size, true),
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
  const [highlightedCluster, setHighlightedCluster] = useState<any>(null);
  const [drivingDistances, setDrivingDistances] = useState<Map<string, DrivingDistance>>(new Map());
  const [isLoadingDistances, setIsLoadingDistances] = useState(false);
  const [routesLoaded, setRoutesLoaded] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);
  const [enableClustering, setEnableClustering] = useState(true);
  const [dateRangeValue, setDateRangeValue] = useState<number[]>([0, 100]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState<AdminEvent | null>(null);
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);
  const [editingEvent, setEditingEvent] = useState<UniversalEvent | null>(null);
  const clusterGroupRef = useRef<any>(null);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const mapViewportRef = useRef<HTMLDivElement>(null);
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

  // Date range calculation
  const dateRange = useMemo(() => {
    if (events.length === 0) return { min: new Date(), max: new Date() };
    const dates = events.map(e => new Date(e.start_time).getTime());
    return {
      min: new Date(Math.min(...dates)),
      max: new Date(Math.max(...dates)),
    };
  }, [events]);

  // Calculate date from slider value
  const getDateFromSliderValue = (value: number) => {
    const range = dateRange.max.getTime() - dateRange.min.getTime();
    return new Date(dateRange.min.getTime() + (range * value / 100));
  };
  
  // Handle initial active event on mount or when it changes
  useEffect(() => {
    if (initialActiveEventId) {
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
    const minDate = getDateFromSliderValue(dateRangeValue[0]);
    const maxDate = getDateFromSliderValue(dateRangeValue[1]);
    
    return [...events]
      .filter(event => {
        const eventDate = new Date(event.start_time);
        const eventYear = eventDate.getFullYear().toString();
        const yearMatch = selectedYear === "all" || eventYear === selectedYear;
        const sourceMatch = selectedSource === "all" || event.source === selectedSource;
        const upcomingMatch = !showUpcomingOnly || getEventStatus(event.start_time) !== "past";
        const dateRangeMatch = eventDate >= minDate && eventDate <= maxDate;
        return yearMatch && sourceMatch && upcomingMatch && dateRangeMatch;
      })
      .sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
  }, [events, selectedYear, selectedSource, showUpcomingOnly, dateRangeValue]);


  // Get coordinates for an event
  const getCoordinates = (event: AdminEvent): [number, number] | null => {
    if (event.latitude && event.longitude) {
      return [event.latitude, event.longitude];
    }
    
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
      .map((event, index) => ({
        ...event,
        coords: getCoordinates(event),
        stationNumber: index + 1,
        status: getEventStatus(event.start_time),
      }))
      .filter(event => event.coords !== null);
  }, [sortedEvents]);

  // Fetch driving distances between consecutive events with caching
  const loadDrivingDistances = useCallback(async () => {
    if (eventsWithCoords.length < 2) return;
    
    setIsLoadingDistances(true);
    const newDistances = new Map<string, DrivingDistance>();
    
    try {
      const { data: cachedRoutes, error: cacheError } = await supabase
        .from('cached_routes')
        .select('*');
      
      if (cacheError) {
        console.error('Error loading cached routes:', cacheError);
      }
      
      const routeCache = new Map<string, { distanceKm: number; durationMin: number }>();
      cachedRoutes?.forEach((route: CachedRoute) => {
        const key = getCacheKey([route.from_lat, route.from_lng], [route.to_lat, route.to_lng]);
        routeCache.set(key, { distanceKm: route.distance_km, durationMin: route.duration_min });
      });
      
      const missingRoutes: { from: [number, number]; to: [number, number]; fromId: string; toId: string }[] = [];
      
      for (let i = 0; i < eventsWithCoords.length - 1; i++) {
        const fromEvent = eventsWithCoords[i];
        const toEvent = eventsWithCoords[i + 1];
        const eventKey = `${fromEvent.id}-${toEvent.id}`;
        const cacheKey = getCacheKey(fromEvent.coords as [number, number], toEvent.coords as [number, number]);
        
        if (routeCache.has(cacheKey)) {
          const cached = routeCache.get(cacheKey)!;
          newDistances.set(eventKey, {
            fromId: fromEvent.id,
            toId: toEvent.id,
            distanceKm: cached.distanceKm,
            durationMin: cached.durationMin,
          });
        } else {
          missingRoutes.push({
            from: fromEvent.coords as [number, number],
            to: toEvent.coords as [number, number],
            fromId: fromEvent.id,
            toId: toEvent.id,
          });
        }
      }
      
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
            
            routesToSave.push({
              from_lat: roundCoord(route.from[0]),
              from_lng: roundCoord(route.from[1]),
              to_lat: roundCoord(route.to[0]),
              to_lng: roundCoord(route.to[1]),
              distance_km: result.distanceKm,
              duration_min: result.durationMin,
            });
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
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

  // Handle hover on station list - find and highlight containing cluster
  const handleStationHover = useCallback((eventId: string | null) => {
    setActiveEventId(eventId);
    
    if (!eventId || !clusterGroupRef.current || !enableClustering) {
      if (highlightedCluster) {
        highlightedCluster.setIcon(createClusterCustomIcon(highlightedCluster, false));
        setHighlightedCluster(null);
      }
      return;
    }

    const marker = markerRefs.current.get(eventId);
    if (!marker) return;

    // Find the cluster containing this marker
    const clusterGroup = clusterGroupRef.current;
    const visibleParent = clusterGroup.getVisibleParent(marker);
    
    // Reset previous highlighted cluster
    if (highlightedCluster && highlightedCluster !== visibleParent) {
      highlightedCluster.setIcon(createClusterCustomIcon(highlightedCluster, false));
    }

    // If the marker is in a cluster (visibleParent is not the marker itself)
    if (visibleParent && visibleParent !== marker && visibleParent.getChildCount) {
      visibleParent.setIcon(createClusterCustomIcon(visibleParent, true));
      setHighlightedCluster(visibleParent);
    } else {
      setHighlightedCluster(null);
    }
  }, [enableClustering, highlightedCluster]);

  const openDirections = (event: AdminEvent) => {
    const coords = getCoordinates(event);
    if (coords) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`, '_blank');
    }
  };

  // Convert AdminEvent to UniversalEvent for editing
  const convertToUniversalEvent = (event: AdminEvent): UniversalEvent => {
    let category = "other";
    if (event.source === "KL") category = "tour_kl";
    else if (event.source === "KBA") category = "tour_kba";

    return {
      id: event.id,
      title: event.title,
      start: new Date(event.start_time),
      end: event.end_time ? new Date(event.end_time) : null,
      allDay: false,
      location: event.location,
      description: event.note,
      category,
      source: "admin_events",
      metadata: {
        venue_name: event.venue_name,
        state: event.state,
        source: event.source,
      },
    };
  };

  // Open edit modal
  const handleEditEvent = (event: AdminEvent) => {
    const universalEvent = convertToUniversalEvent(event);
    setEditingEvent(universalEvent);
    setSelectedEventDetail(null); // Close detail dialog
  };

  // Count stats
  const statusCounts = useMemo(() => {
    return {
      upcoming: sortedEvents.filter(e => getEventStatus(e.start_time) === "upcoming").length,
      today: sortedEvents.filter(e => getEventStatus(e.start_time) === "today").length,
      past: sortedEvents.filter(e => getEventStatus(e.start_time) === "past").length,
    };
  }, [sortedEvents]);


  const isMobile = useIsMobile();
  const [mobileListExpanded, setMobileListExpanded] = useState(false);

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Header Section - Premium Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 p-3 md:p-4 border-b border-gray-200/60 bg-white"
      >
        {/* Missing Geodata Warning - Premium Card */}
        {eventsWithMissingGeodata.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 md:mb-4 shadow-sm"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 backdrop-blur-sm">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-800 text-sm md:text-base">
                  {eventsWithMissingGeodata.length} ohne Geodaten
                </p>
                <p className="text-xs md:text-sm text-amber-600/80 hidden sm:block">
                  KI kann fehlende Koordinaten recherchieren
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGeocodeEvents}
              disabled={isGeocoding}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 w-full sm:w-auto"
            >
              {isGeocoding ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Recherchiere...</span>
                  <span className="sm:hidden">Lädt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Geodaten ergänzen</span>
                  <span className="sm:hidden">Ergänzen</span>
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Title & Filters */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
          {/* Title section with icon */}
          <div className="flex items-center justify-between md:block">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/25 hidden md:flex">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Tour-Karte</h2>
                <p className="text-gray-500 text-xs md:text-sm">
                  {eventsWithCoords.length} von {sortedEvents.length} auf der Karte
                </p>
              </div>
            </div>
            {/* Mobile: Quick toggle */}
            <div className="flex md:hidden items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                  showUpcomingOnly 
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Nur anstehende
              </motion.button>
            </div>
          </div>

          {/* Status Summary - Premium badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-3 px-3 md:mx-0 md:px-0 md:mt-2 scrollbar-hide">
            {statusCounts.today > 0 && (
              <motion.span
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 border border-red-200/50"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {statusCounts.today} Heute
              </motion.span>
            )}
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 border border-amber-200/50">
              {statusCounts.upcoming} Anstehend
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 border border-gray-200/50">
              {statusCounts.past} Vergangen
            </span>
          </div>
          
          {/* Filters - Hidden on mobile, shown in dropdown */}
          <div className="hidden md:flex flex-wrap items-center gap-3">
            {/* Quick Filters */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="upcoming-only"
                  checked={showUpcomingOnly}
                  onCheckedChange={setShowUpcomingOnly}
                />
                <Label htmlFor="upcoming-only" className="text-sm text-gray-600 cursor-pointer">
                  Nur anstehende
                </Label>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-2">
                <Switch
                  id="clustering"
                  checked={enableClustering}
                  onCheckedChange={setEnableClustering}
                />
                <Label htmlFor="clustering" className="text-sm text-gray-600 cursor-pointer">
                  Clustering
                </Label>
              </div>
            </div>

            {/* Advanced Filters */}
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isFilterOpen && "rotate-180")} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="absolute z-20 right-4 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl p-4 space-y-4">
                {/* Year Filter */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jahr</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">Alle Jahre</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                {/* Source Filter */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quelle</label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">Alle</option>
                    <option value="KL">Landgraf</option>
                    <option value="KBA">KBA</option>
                  </select>
                </div>

                {/* Date Range Slider */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Zeitraum</label>
                  <div className="mt-3 px-2">
                    <Slider
                      value={dateRangeValue}
                      onValueChange={setDateRangeValue}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{getDateFromSliderValue(dateRangeValue[0]).toLocaleDateString("de-DE", { month: "short", year: "2-digit" })}</span>
                      <span>{getDateFromSliderValue(dateRangeValue[1]).toLocaleDateString("de-DE", { month: "short", year: "2-digit" })}</span>
                    </div>
                  </div>
                </div>

                {/* Filter Badge */}
                {(selectedYear !== "all" || selectedSource !== "all" || showUpcomingOnly || dateRangeValue[0] > 0 || dateRangeValue[1] < 100) && (
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSelectedYear("all");
                        setSelectedSource("all");
                        setShowUpcomingOnly(false);
                        setDateRangeValue([0, 100]);
                      }}
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                    >
                      Alle Filter zurücksetzen
                    </button>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
            
            {(selectedYear !== "all" || selectedSource !== "all" || showUpcomingOnly) && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                {sortedEvents.length} Termine gefiltert
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content - Full Screen Split View (Desktop) / Stacked with Sticky Map (Mobile) */}
      <div className={cn(
        "flex-1 overflow-hidden",
        isMobile ? "flex flex-col" : "flex flex-row"
      )}>
        
        {/* Map Container - Fixed on desktop, Full-width with fixed height on mobile */}
        <div className={cn(
          "flex flex-col",
          isMobile 
            ? "w-full flex-shrink-0 border-b border-gray-200" 
            : "w-1/2 h-full border-r border-gray-200"
        )}
        style={isMobile ? { height: '55vh', minHeight: '320px', maxHeight: '500px' } : undefined}
        >
          {/* Map Container */}
          <div ref={mapViewportRef} className="flex-1 min-h-0 relative">
            <MapContainer
              center={germanCenter}
              zoom={isMobile ? 5.5 : 6}
              scrollWheelZoom={true}
              className="absolute inset-0 h-full w-full"
            >
              <InvalidateLeafletSize
                containerRef={mapViewportRef}
                watch={`${isMobile}-${sortedEvents.length}`}
              />
              <FitBoundsToMarkers coords={routeCoords} watch={`${isMobile}-${sortedEvents.length}`} />
              <FlyToMarker coords={flyToCoords} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Route line - dashed journey visualization */}
              {routeCoords.length > 1 && (
                <Polyline
                  positions={routeCoords}
                  color="#6366f1"
                  weight={3}
                  opacity={0.7}
                  dashArray="10, 6"
                />
              )}
              
              {/* Markers with optional clustering */}
              {enableClustering ? (
                <MarkerClusterGroup
                  ref={clusterGroupRef}
                  chunkedLoading
                  iconCreateFunction={(cluster: any) => createClusterCustomIcon(cluster, false)}
                  maxClusterRadius={50}
                  spiderfyOnMaxZoom={true}
                  showCoverageOnHover={false}
                >
                  {eventsWithCoords.map((event) => (
                    <Marker 
                      key={event.id} 
                      position={event.coords as [number, number]}
                      icon={activeEventId === event.id 
                        ? createHighlightedStatusIcon(event.stationNumber, event.status) 
                        : createStatusIcon(event.stationNumber, event.status)}
                      // @ts-ignore - custom property for cluster grouping
                      eventSource={event.source}
                      ref={(ref) => {
                        if (ref) markerRefs.current.set(event.id, ref);
                      }}
                      eventHandlers={{
                        click: () => scrollToEvent(event.id),
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -16]} opacity={1}>
                        <div className="text-xs font-medium">
                          <p className="font-bold">{event.location}</p>
                          <p className="text-gray-500">{formatDate(event.start_time)}</p>
                        </div>
                      </Tooltip>
                      <Popup className="custom-popup">
                        <div className="min-w-[220px] p-1">
                          {/* Header */}
                          <div className={cn(
                            "flex items-center gap-2 mb-3 p-2 -m-1 rounded-lg",
                            statusColors[event.status].bgLight
                          )}>
                            <span className={cn(
                              "text-xs font-bold px-2 py-1 rounded-full text-white",
                              statusColors[event.status].bg
                            )}>
                              Station {event.stationNumber}
                            </span>
                            <span className={cn(
                              "text-xs font-medium capitalize",
                              statusColors[event.status].text
                            )}>
                              {event.status === "upcoming" ? "Anstehend" : 
                               event.status === "today" ? "Heute!" : "Vergangen"}
                            </span>
                          </div>
                          
                          {/* Content */}
                          <p className="font-bold text-gray-900 mb-2">{event.title}</p>
                          <div className="space-y-1.5 mb-3">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {formatDate(event.start_time)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {formatTime(event.start_time)} Uhr
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {event.location}
                            </div>
                            {event.venue_name && (
                              <p className="text-xs text-gray-500 pl-5">{event.venue_name}</p>
                            )}
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="flex gap-2 pt-2 border-t border-gray-100">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs h-8"
                              onClick={() => setSelectedEventDetail(event)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs h-8"
                              onClick={() => openDirections(event)}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Route
                            </Button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              ) : (
                // Without clustering
                eventsWithCoords.map((event) => (
                  <Marker 
                    key={event.id} 
                    position={event.coords as [number, number]}
                    icon={activeEventId === event.id 
                      ? createHighlightedStatusIcon(event.stationNumber, event.status) 
                      : createStatusIcon(event.stationNumber, event.status)}
                    eventHandlers={{
                      click: () => scrollToEvent(event.id),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -16]} opacity={1}>
                      <div className="text-xs font-medium">
                        <p className="font-bold">{event.location}</p>
                        <p className="text-gray-500">{formatDate(event.start_time)}</p>
                      </div>
                    </Tooltip>
                    <Popup className="custom-popup">
                      <div className="min-w-[220px] p-1">
                        {/* Header */}
                        <div className={cn(
                          "flex items-center gap-2 mb-3 p-2 -m-1 rounded-lg",
                          statusColors[event.status].bgLight
                        )}>
                          <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full text-white",
                            statusColors[event.status].bg
                          )}>
                            Station {event.stationNumber}
                          </span>
                          <span className={cn(
                            "text-xs font-medium capitalize",
                            statusColors[event.status].text
                          )}>
                            {event.status === "upcoming" ? "Anstehend" : 
                             event.status === "today" ? "Heute!" : "Vergangen"}
                          </span>
                        </div>
                        
                        {/* Content */}
                        <p className="font-bold text-gray-900 mb-2">{event.title}</p>
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(event.start_time)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {formatTime(event.start_time)} Uhr
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {event.location}
                          </div>
                          {event.venue_name && (
                            <p className="text-xs text-gray-500 pl-5">{event.venue_name}</p>
                          )}
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs h-8"
                            onClick={() => setSelectedEventDetail(event)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs h-8"
                            onClick={() => openDirections(event)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Route
                          </Button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))
              )}
            </MapContainer>
          </div>

          {/* Legend - below map */}
          <div className="flex-shrink-0 flex items-center justify-center gap-4 text-xs text-gray-500 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white shadow">1</div>
              <span>Landgraf (KL)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white shadow">1</div>
              <span>Konzertbüro Augsburg (KBA)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-indigo-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #6366f1 0px, #6366f1 6px, transparent 6px, transparent 12px)' }}></div>
              <span>Route</span>
            </div>
            {eventsWithCoords.length > 1 && (
              <>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1.5 text-indigo-600">
                  <Navigation className="w-4 h-4" />
                  <span>{eventsWithCoords.length} Stationen</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Stations List - Premium Design */}
        <div className={cn(
          "overflow-y-auto",
          isMobile 
            ? "flex-1 px-4 pt-4 pb-24 bg-gradient-to-b from-gray-50 to-white" 
            : "w-1/2 h-full p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50"
        )}>
          {/* Premium Header - Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "sticky top-0 z-10 -mx-4 px-4 py-3",
              "bg-white border-b border-gray-100"
            )}
          >
            {isMobile ? (
              <button
                onClick={() => {
                  haptics.tap();
                  setMobileListExpanded(!mobileListExpanded);
                }}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 shadow-sm active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold shadow-lg shadow-amber-500/25">
                    {sortedEvents.length}
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-gray-900">Stationen</span>
                    <p className="text-xs text-gray-500">Tour-Übersicht</p>
                  </div>
                </div>
                <ChevronUp className={cn(
                  "w-5 h-5 text-amber-600 transition-transform",
                  mobileListExpanded && "rotate-180"
                )} />
              </button>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/25">
                    <Route className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Alle Stationen</h3>
                    <p className="text-xs text-gray-500">{sortedEvents.length} Termine auf der Tour</p>
                  </div>
                </div>
                {isLoadingDistances && (
                  <span className="text-amber-600 flex items-center gap-2 text-xs bg-amber-50 px-3 py-1.5 rounded-full">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Routen laden...
                  </span>
                )}
              </div>
            )}
          </motion.div>
          
          {/* Premium Station Cards */}
          <AnimatePresence mode="popLayout">
            <div className="space-y-1">
              {sortedEvents.map((event, index) => {
                const nextEvent = sortedEvents[index + 1];
                const distanceInfo = nextEvent ? getDistanceToNext(event.id, nextEvent.id) : null;
                const status = getEventStatus(event.start_time);
                
                return (
                  <TourStationCard
                    key={event.id}
                    event={event}
                    index={index}
                    isActive={activeEventId === event.id}
                    status={status}
                    distanceInfo={distanceInfo}
                    isLoadingDistances={isLoadingDistances}
                    hasNextEvent={!!nextEvent}
                    onSelect={(evt, isAlreadyActive) => {
                      if (isAlreadyActive) {
                        setSelectedEventDetail(evt);
                      } else {
                        handleStationHover(evt.id);
                        setFlyToCoords(null);
                      }
                    }}
                    isMobile={isMobile}
                  />
                );
              })}

              {sortedEvents.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Keine Termine</p>
                  <p className="text-xs text-gray-400 mt-1">Filter anpassen oder Termine hinzufügen</p>
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        </div>
      </div>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEventDetail} onOpenChange={() => setSelectedEventDetail(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" />
              {selectedEventDetail?.location}
            </DialogTitle>
          </DialogHeader>
          {selectedEventDetail && (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                statusColors[getEventStatus(selectedEventDetail.start_time)].bgLight,
                statusColors[getEventStatus(selectedEventDetail.start_time)].text
              )}>
                {getEventStatus(selectedEventDetail.start_time) === "today" && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
                {getEventStatus(selectedEventDetail.start_time) === "upcoming" ? "Anstehender Termin" : 
                 getEventStatus(selectedEventDetail.start_time) === "today" ? "Heute!" : "Vergangener Termin"}
              </div>

              {/* Event Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(selectedEventDetail.start_time)}</p>
                    <p className="text-sm text-gray-500">{formatTime(selectedEventDetail.start_time)} Uhr</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedEventDetail.location}
                      {selectedEventDetail.state && ` (${selectedEventDetail.state})`}
                    </p>
                    {selectedEventDetail.venue_name && (
                      <p className="text-sm text-gray-500">{selectedEventDetail.venue_name}</p>
                    )}
                  </div>
                </div>

                {selectedEventDetail.note && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">{selectedEventDetail.note}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => handleEditEvent(selectedEventDetail)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => openDirections(selectedEventDetail)}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Route planen
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedEventDetail(null)}
                >
                  Schließen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Edit Modal */}
      <EventEditModal
        event={editingEvent}
        open={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onSave={() => {
          onEventsUpdated?.();
        }}
        onDelete={() => {
          onEventsUpdated?.();
        }}
      />
    </div>
  );
};

export default EventMap;
