import {
  Plane,
  Train,
  Calendar,
  Theater,
  Film,
  Users,
  User,
  HelpCircle,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  type LucideIcon,
} from "lucide-react";

// ============================================
// EVENT TYPES (What is it?)
// ============================================
export interface EventType {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const EVENT_TYPES: EventType[] = [
  {
    value: "travel",
    label: "Reisen",
    icon: Plane,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-500",
  },
  {
    value: "tour",
    label: "Tour",
    icon: MapPin,
    color: "bg-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-500",
  },
  {
    value: "theater",
    label: "Theater",
    icon: Theater,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-500",
  },
  {
    value: "filming",
    label: "Dreh",
    icon: Film,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-500",
  },
  {
    value: "meeting",
    label: "Meeting",
    icon: Users,
    color: "bg-teal-500",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
    borderColor: "border-teal-500",
  },
  {
    value: "private",
    label: "Privat",
    icon: User,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-500",
  },
  {
    value: "other",
    label: "Sonstiges",
    icon: HelpCircle,
    color: "bg-gray-400",
    bgColor: "bg-gray-50",
    textColor: "text-gray-600",
    borderColor: "border-gray-400",
  },
];

// ============================================
// TOUR SOURCES (For tour events only)
// ============================================
export interface TourSource {
  value: "KL" | "KBA";
  label: string;
  sublabel: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const TOUR_SOURCES: TourSource[] = [
  {
    value: "KL",
    label: "Konzertdirektion Landgraf",
    sublabel: "Gelbe Tour-Markierung",
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-500",
  },
  {
    value: "KBA",
    label: "Konzertbüro Augsburg",
    sublabel: "Grüne Tour-Markierung",
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-500",
  },
];

// ============================================
// EVENT STATUS (Combinable with any type)
// ============================================
export interface EventStatus {
  value: "confirmed" | "optioniert" | "cancelled";
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const EVENT_STATUSES: EventStatus[] = [
  {
    value: "confirmed",
    label: "Bestätigt",
    icon: CheckCircle,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-500",
  },
  {
    value: "optioniert",
    label: "Optioniert",
    icon: Clock,
    color: "bg-orange-400",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-400",
  },
  {
    value: "cancelled",
    label: "Abgesagt",
    icon: XCircle,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-500",
  },
];

// ============================================
// LEGACY: EVENT_CATEGORIES (for backwards compatibility)
// Maps old flat category system to new hierarchical system
// ============================================
export interface EventCategory {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

// Legacy categories - keep for backwards compatibility
export const EVENT_CATEGORIES: EventCategory[] = [
  ...EVENT_TYPES.filter(t => t.value !== "tour"),
  {
    value: "tour_kl",
    label: "Tour (Landgraf)",
    icon: Train,
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-500",
  },
  {
    value: "tour_kba",
    label: "Tour (KBA)",
    icon: Train,
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-500",
  },
  {
    value: "optioned",
    label: "Optioniert",
    icon: Clock,
    color: "bg-orange-400",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-400",
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getEventTypeByValue = (value: string): EventType => {
  // Handle legacy tour_kl/tour_kba values
  if (value === "tour_kl" || value === "tour_kba") {
    return EVENT_TYPES.find((t) => t.value === "tour") || EVENT_TYPES[EVENT_TYPES.length - 1];
  }
  // Handle legacy "optioned" value - default to "other"
  if (value === "optioned" || value === "optioniert") {
    return EVENT_TYPES.find((t) => t.value === "other") || EVENT_TYPES[EVENT_TYPES.length - 1];
  }
  return EVENT_TYPES.find((t) => t.value === value) || EVENT_TYPES[EVENT_TYPES.length - 1];
};

export const getTourSourceByValue = (value: string | null): TourSource | null => {
  if (!value) return null;
  return TOUR_SOURCES.find((s) => s.value === value) || null;
};

export const getEventStatusByValue = (value: string | null): EventStatus => {
  if (!value) return EVENT_STATUSES[0]; // Default to confirmed
  return EVENT_STATUSES.find((s) => s.value === value) || EVENT_STATUSES[0];
};

// Legacy function - keep for backwards compatibility
export const getCategoryByValue = (value: string): EventCategory => {
  return EVENT_CATEGORIES.find((c) => c.value === value) || EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1];
};

export const getCategoryIcon = (value: string): LucideIcon => {
  return getCategoryByValue(value).icon;
};

export const getCategoryColor = (value: string): string => {
  return getCategoryByValue(value).color;
};

// ============================================
// COLOR COMPUTATION FOR CALENDAR/MAP DISPLAY
// ============================================
export interface ComputedEventStyle {
  bgColor: string;
  textColor: string;
  borderColor: string;
  opacity: string;
  borderStyle: string;
  strikethrough: boolean;
}

export const computeEventStyle = (
  eventType: string,
  tourSource: string | null,
  eventStatus: string | null
): ComputedEventStyle => {
  // Get base color from type
  let baseStyle: { bgColor: string; textColor: string; borderColor: string };

  if (eventType === "tour" && tourSource) {
    const source = getTourSourceByValue(tourSource);
    if (source) {
      baseStyle = {
        bgColor: source.bgColor,
        textColor: source.textColor,
        borderColor: source.borderColor,
      };
    } else {
      baseStyle = {
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-500",
      };
    }
  } else {
    const type = getEventTypeByValue(eventType);
    baseStyle = {
      bgColor: type.bgColor,
      textColor: type.textColor,
      borderColor: type.borderColor,
    };
  }

  // Apply status modifiers
  const status = getEventStatusByValue(eventStatus);
  let opacity = "";
  let borderStyle = "";
  let strikethrough = false;

  if (status.value === "optioniert") {
    opacity = "opacity-60";
    borderStyle = "border-dashed";
  } else if (status.value === "cancelled") {
    baseStyle = {
      bgColor: "bg-gray-100",
      textColor: "text-gray-400",
      borderColor: "border-gray-300",
    };
    strikethrough = true;
  }

  return {
    ...baseStyle,
    opacity,
    borderStyle,
    strikethrough,
  };
};
