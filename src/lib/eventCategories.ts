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
  type LucideIcon,
} from "lucide-react";

export interface EventCategory {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const EVENT_CATEGORIES: EventCategory[] = [
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
    value: "tour_kl",
    label: "Tour (Landgraf)",
    icon: Train,
    color: "bg-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-500",
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

export const getCategoryByValue = (value: string): EventCategory => {
  return EVENT_CATEGORIES.find((c) => c.value === value) || EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1];
};

export const getCategoryIcon = (value: string): LucideIcon => {
  return getCategoryByValue(value).icon;
};

export const getCategoryColor = (value: string): string => {
  return getCategoryByValue(value).color;
};
