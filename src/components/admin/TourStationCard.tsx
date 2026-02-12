import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Car, Navigation, Home, Train, Ticket, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { differenceInDays } from "date-fns";

// Event status type
type EventStatus = "upcoming" | "today" | "past";

// Source-based colors (KL = Amber, KBA = Green) - consistent with EventMap
const sourceColors = {
  KL: {
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-400",
    ring: "ring-amber-200",
    shadow: "shadow-amber-500/20",
    glow: "hover:shadow-amber-500/15",
    from: "from-amber-500",
    to: "to-amber-600",
  },
  KBA: {
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-400",
    ring: "ring-emerald-200",
    shadow: "shadow-emerald-500/20",
    glow: "hover:shadow-emerald-500/15",
    from: "from-emerald-500",
    to: "to-emerald-600",
  },
  unknown: {
    gradient: "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
    bg: "bg-gray-400",
    bgLight: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-300",
    ring: "ring-gray-200",
    shadow: "shadow-gray-500/10",
    glow: "hover:shadow-gray-500/10",
    from: "from-gray-400",
    to: "to-gray-500",
  },
};

interface AdminEvent {
  id: string;
  title: string;
  location: string;
  state: string | null;
  venue_name: string | null;
  ticket_url: string | null;
  ticket_url_approved: boolean;
  start_time: string;
  end_time: string | null;
  note: string | null;
  source: "KL" | "KBA" | "unknown";
  latitude: number | null;
  longitude: number | null;
}

interface DistanceInfo {
  distanceKm: number;
  durationMin: number;
}

interface TourColor {
  bg: string;       // e.g. "bg-indigo-500"
  light: string;    // e.g. "bg-indigo-50"
  text: string;     // e.g. "text-indigo-700"
  border: string;   // e.g. "border-indigo-400"
  ring: string;     // e.g. "ring-indigo-200"
  shadow: string;   // e.g. "shadow-indigo-500/20"
  glow: string;     // e.g. "hover:shadow-indigo-500/15"
  from: string;     // e.g. "from-indigo-500"
  to: string;       // e.g. "to-indigo-600"
}

interface TourStationCardProps {
  event: AdminEvent;
  index: number;
  isActive: boolean;
  status: EventStatus;
  distanceInfo: DistanceInfo | null;
  isLoadingDistances: boolean;
  hasNextEvent: boolean;
  nextEventStartTime?: string; // To calculate gap days
  onSelect: (event: AdminEvent, isAlreadyActive: boolean) => void;
  isMobile?: boolean;
  tourColor?: TourColor; // Tour group color (overrides source color for main elements)
}

// Format date
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

// Format time
const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
};

// Format duration
const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} Min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const TourStationCard = ({
  event,
  index,
  isActive,
  status,
  distanceInfo,
  isLoadingDistances,
  hasNextEvent,
  nextEventStartTime,
  onSelect,
  isMobile = false,
  tourColor,
}: TourStationCardProps) => {
  const sourceColor = sourceColors[event.source] || sourceColors.unknown;
  // Tour color overrides the main color; source color is used for the ring
  const colors = tourColor || sourceColor;
  
  // Calculate if there's a gap > 2 days (means traveling home first, then by train)
  const gapDays = nextEventStartTime 
    ? differenceInDays(new Date(nextEventStartTime), new Date(event.start_time))
    : 0;
  const isHomeTrip = gapDays > 2;

  return (
    <div>
      {/* Event Card */}
      <motion.div
        id={`station-${event.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          haptics.tap();
          onSelect(event, isActive);
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl bg-white cursor-pointer",
          "border transition-all duration-300",
          isActive
            ? cn(colors.border, "ring-2", colors.ring, "shadow-lg", colors.shadow)
            : cn("border-gray-200/60", "hover:border-gray-300", "hover:shadow-xl", colors.glow)
        )}
      >
        <div className="flex items-stretch">
          {/* Left: Station Number circle - tour color fill, source-colored ring */}
          <div className="relative flex flex-col items-center justify-center px-3 py-4 flex-shrink-0">
            <div
              className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg text-white",
                colors.bg,
                // Source ring: amber for KL, emerald for KBA - thick & visible
                tourColor
                  ? cn("ring-[4px]", event.source === "KL" ? "ring-amber-500" : event.source === "KBA" ? "ring-emerald-500" : "ring-gray-400")
                  : "ring-[3px] ring-white/30"
              )}
            >
              {index + 1}
            </div>
            {status === "today" && (
              <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                    {event.location}
                  </h3>
                  {status === "today" && (
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="text-[10px] font-bold text-red-600 bg-red-100/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full whitespace-nowrap"
                    >
                      HEUTE
                    </motion.span>
                  )}
                </div>
                {event.state && (
                  <p className="text-xs text-gray-400 mt-0.5">{event.state}</p>
                )}
              </div>

              {/* Source badge - always uses source colors (KL/KBA) */}
              <div
                className={cn(
                  "flex-shrink-0 px-2.5 py-1 rounded-full",
                  "backdrop-blur-sm text-xs font-medium",
                  sourceColor.bgLight,
                  sourceColor.text
                )}
              >
                {event.source === "KL"
                  ? "Landgraf"
                  : event.source === "KBA"
                  ? "Augsburg"
                  : "Unbekannt"}
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(event.start_time)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(event.start_time)} Uhr
              </span>
            </div>

            {/* Venue + Ticket indicator */}
            <div className="flex items-center gap-2">
              {event.venue_name && (
                <p className="text-xs text-gray-400 truncate flex items-center gap-1 flex-1 min-w-0">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {event.venue_name}
                </p>
              )}
              {event.ticket_url ? (
                <a
                  href={event.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-colors",
                    event.ticket_url_approved
                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200 border-dashed"
                  )}
                >
                  <Ticket className="w-2.5 h-2.5" />
                  {event.ticket_url_approved ? "VVK" : "Entwurf"}
                </a>
              ) : event.source === "KL" ? (
                <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-500 text-[10px]">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  Kein VVK
                </span>
              ) : null}
            </div>
          </div>

          {/* Right: Navigation indicator on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 1 : 0 }}
            className="flex items-center pr-3"
          >
            <div className="p-2 rounded-full bg-gray-100">
              <Navigation className="w-4 h-4 text-gray-500" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Distance connector to next station */}
      {hasNextEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: Math.min(index * 0.03 + 0.15, 0.5) }}
          className="flex items-center justify-center py-2.5"
        >
          {isHomeTrip ? (
            // Gap > 2 days: Travel home first, then by train to next venue
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-50 to-stone-50 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm">
              <div className="h-4 w-px bg-gradient-to-b from-slate-200 to-slate-300" />
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">via Heimat</span>
              <Train className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">
                {gapDays} Tage Pause
              </span>
              <div className="h-4 w-px bg-gradient-to-b from-slate-300 to-slate-200" />
            </div>
          ) : (
            // Direct car travel
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
              <div className="h-4 w-px bg-gradient-to-b from-gray-200 to-gray-300" />
              <Car className="w-3.5 h-3.5 text-slate-400" />
              {distanceInfo ? (
                <span className="text-xs font-medium text-gray-600">
                  {distanceInfo.distanceKm} km · {formatDuration(distanceInfo.durationMin)}
                </span>
              ) : isLoadingDistances ? (
                <span className="text-xs text-gray-400">...</span>
              ) : (
                <span className="text-xs text-gray-400">–</span>
              )}
              <div className="h-4 w-px bg-gradient-to-b from-gray-300 to-gray-200" />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TourStationCard;
