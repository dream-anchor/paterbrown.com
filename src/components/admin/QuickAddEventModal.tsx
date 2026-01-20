import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Theater,
  Film,
  User,
  Users,
  Calendar,
  MapPin,
  Copy,
  Clock,
  ChevronDown,
  Check,
  X,
  AlertCircle,
  Command,
  Eye,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface QuickAddEventModalProps {
  open: boolean;
  onClose: () => void;
  date: Date | null;
  onEventAdded: () => void;
}

interface RecentEvent {
  id: string;
  title: string;
  location: string;
  venue_name: string | null;
  start_time: string;
  event_type: string;
}

interface ValidationErrors {
  title?: string;
  date?: string;
  time?: string;
}

const eventTypes = [
  { value: "theater", label: "Theater", icon: Theater, color: "bg-red-600" },
  { value: "filming", label: "Dreh", icon: Film, color: "bg-purple-500" },
  { value: "meeting", label: "Meeting", icon: Users, color: "bg-emerald-500" },
  { value: "private", label: "Privat", icon: User, color: "bg-green-500" },
  { value: "other", label: "Sonstiges", icon: Calendar, color: "bg-gray-400" },
];

const STORAGE_KEY = "admin_recent_locations";
const MAX_RECENT_LOCATIONS = 10;

// Load recent locations from localStorage
const loadRecentLocations = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save location to recent list
const saveRecentLocation = (location: string) => {
  if (!location.trim()) return;
  const locations = loadRecentLocations();
  const filtered = locations.filter((l) => l.toLowerCase() !== location.toLowerCase());
  const updated = [location, ...filtered].slice(0, MAX_RECENT_LOCATIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

const QuickAddEventModal = ({ open, onClose, date, onEventAdded }: QuickAddEventModalProps) => {
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("other");
  const [startTime, setStartTime] = useState("19:00"); // Smart default
  const [endTime, setEndTime] = useState("21:00"); // Default 2h duration
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Autocomplete state
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [recentLocations, setRecentLocations] = useState<string[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [templateOpen, setTemplateOpen] = useState(false);
  
  // Venue suggestions based on location
  const [venueSuggestions, setVenueSuggestions] = useState<string[]>([]);
  
  const { toast } = useToast();
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Load recent locations and events on mount
  useEffect(() => {
    setRecentLocations(loadRecentLocations());
    loadRecentEvents();
  }, []);

  const loadRecentEvents = async () => {
    try {
      const { data } = await supabase
        .from("calendar_events")
        .select("id, title, location, start_datetime, event_type")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (data) {
        setRecentEvents(data.map(e => ({
          id: e.id,
          title: e.title,
          location: e.location || "",
          venue_name: null,
          start_time: e.start_datetime,
          event_type: e.event_type,
        })));
      }
    } catch (error) {
      console.error("Error loading recent events:", error);
    }
  };

  // Look up venue suggestions when location changes
  useEffect(() => {
    if (!location.trim()) {
      setVenueSuggestions([]);
      return;
    }
    
    const fetchVenues = async () => {
      try {
        const { data } = await supabase
          .from("calendar_events")
          .select("location")
          .ilike("location", `%${location}%`)
          .limit(5);
        
        if (data) {
          const venues = [...new Set(data.map(e => e.location).filter(Boolean))];
          setVenueSuggestions(venues);
        }
      } catch {
        // Ignore errors
      }
    };
    
    const timer = setTimeout(fetchVenues, 300);
    return () => clearTimeout(timer);
  }, [location]);

  // Auto-adjust end time when start time changes (keep 2h duration)
  useEffect(() => {
    if (!allDay && startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const endHours = (hours + 2) % 24;
      setEndTime(`${String(endHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
    }
  }, [startTime, allDay]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTitle("");
      setEventType("other");
      setStartTime("19:00");
      setEndTime("21:00");
      setAllDay(false);
      setLocation("");
      setVenue("");
      setDescription("");
      setErrors({});
      setTouched({});
      setShowPreview(false);
      setRecentLocations(loadRecentLocations());
      
      // Focus title input
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘Enter or Ctrl+Enter to save
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit(e as any);
      }
      // Escape to close (handled by Dialog)
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, title, location]);

  // Validation
  const validate = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!title.trim()) {
      newErrors.title = "Titel ist erforderlich";
    }
    
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(date);
      eventDate.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        newErrors.date = "Datum darf nicht in der Vergangenheit liegen";
      }
    }
    
    if (!allDay && startTime && endTime) {
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      if (startH * 60 + startM >= endH * 60 + endM) {
        newErrors.time = "Endzeit muss nach Startzeit liegen";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, date, allDay, startTime, endTime]);

  // Validate on blur
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      // Mark all as touched to show errors
      setTouched({ title: true, date: true, time: true });
      return;
    }
    
    if (!date) return;

    setIsSubmitting(true);
    try {
      const startDatetime = new Date(date);
      if (!allDay) {
        const [hours, minutes] = startTime.split(":").map(Number);
        startDatetime.setHours(hours, minutes, 0, 0);
      } else {
        startDatetime.setHours(0, 0, 0, 0);
      }

      let endDatetime: Date | null = null;
      if (!allDay && endTime) {
        endDatetime = new Date(date);
        const [hours, minutes] = endTime.split(":").map(Number);
        endDatetime.setHours(hours, minutes, 0, 0);
      }

      const fullLocation = venue ? `${location} - ${venue}` : location;

      const { error } = await supabase.from("calendar_events").insert({
        title: title.trim(),
        event_type: eventType,
        start_datetime: startDatetime.toISOString(),
        end_datetime: endDatetime?.toISOString() || null,
        all_day: allDay,
        location: fullLocation.trim() || null,
        description: description.trim() || null,
      });

      if (error) throw error;

      // Save location to recent
      if (location.trim()) {
        saveRecentLocation(location.trim());
      }

      toast({
        title: "Termin erstellt",
        description: `"${title}" wurde hinzugefügt`,
      });

      onEventAdded();
      onClose();
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Fehler",
        description: error.message || "Termin konnte nicht erstellt werden",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (event: RecentEvent) => {
    setTitle(event.title);
    setLocation(event.location);
    setEventType(event.event_type);
    const eventTime = new Date(event.start_time);
    setStartTime(format(eventTime, "HH:mm"));
    setTemplateOpen(false);
    
    toast({
      title: "Vorlage angewendet",
      description: `Daten von "${event.title}" übernommen`,
    });
  };

  const selectLocation = (loc: string) => {
    setLocation(loc);
    setLocationOpen(false);
    setLocationSearch("");
  };

  const filteredLocations = useMemo(() => {
    if (!locationSearch) return recentLocations;
    return recentLocations.filter((l) =>
      l.toLowerCase().includes(locationSearch.toLowerCase())
    );
  }, [recentLocations, locationSearch]);

  const formattedDate = date?.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const selectedType = eventTypes.find((t) => t.value === eventType);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            Neuer Termin
          </DialogTitle>
          {date && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span>{formattedDate}</span>
              {errors.date && touched.date && (
                <span className="text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.date}
                </span>
              )}
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quick Templates */}
          {recentEvents.length > 0 && (
            <Popover open={templateOpen} onOpenChange={setTemplateOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-gray-600"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Aus bestehendem Event kopieren
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2 bg-white z-50" align="start">
                <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">
                  Letzte Events
                </div>
                {recentEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => applyTemplate(event)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {event.location || "Kein Ort"}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {format(new Date(event.start_time), "dd.MM", { locale: de })}
                    </span>
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="flex items-center gap-1">
                  Titel <span className="text-red-500">*</span>
                </Label>
                <Input
                  ref={titleInputRef}
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleBlur("title")}
                  placeholder="z.B. Premiere, Meeting, Drehtag..."
                  className={cn(
                    "mt-1",
                    errors.title && touched.title && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {errors.title && touched.title && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Event Type */}
              <div>
                <Label>Typ</Label>
                <div className="grid grid-cols-5 gap-1.5 mt-2">
                  {eventTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = eventType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setEventType(type.value)}
                        className={cn(
                          "flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all",
                          isSelected
                            ? `${type.color} border-transparent text-white`
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        )}
                      >
                        <Icon className="w-4 h-4 mb-0.5" />
                        <span className="text-[9px] font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Zeit
                  </Label>
                  <label className="flex items-center gap-1.5 text-sm text-gray-600 ml-auto cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allDay}
                      onChange={(e) => setAllDay(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Ganztägig
                  </label>
                </div>
                {!allDay && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      onBlur={() => handleBlur("time")}
                      className={cn(
                        "flex-1",
                        errors.time && touched.time && "border-red-500"
                      )}
                    />
                    <span className="text-gray-400 text-sm">bis</span>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      onBlur={() => handleBlur("time")}
                      className={cn(
                        "flex-1",
                        errors.time && touched.time && "border-red-500"
                      )}
                    />
                  </div>
                )}
                {errors.time && touched.time && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.time}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Location with Autocomplete */}
              <div>
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Ort
                </Label>
                <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative mt-1">
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          setLocationSearch(e.target.value);
                          if (!locationOpen) setLocationOpen(true);
                        }}
                        onFocus={() => setLocationOpen(true)}
                        placeholder="z.B. Berlin, München..."
                      />
                      {location && (
                        <button
                          type="button"
                          onClick={() => {
                            setLocation("");
                            setVenue("");
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="w-3 h-3 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </PopoverTrigger>
                  {filteredLocations.length > 0 && (
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-1 bg-white z-50"
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <div className="text-xs font-medium text-gray-500 px-2 py-1">
                        Letzte Orte
                      </div>
                      {filteredLocations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => selectLocation(loc)}
                          className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {loc}
                        </button>
                      ))}
                    </PopoverContent>
                  )}
                </Popover>
              </div>

              {/* Venue */}
              <div>
                <Label htmlFor="venue">Venue / Adresse</Label>
                <Input
                  id="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="z.B. Friedrichstadt-Palast..."
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Notiz</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Zusätzliche Infos..."
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Preview Toggle */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? "Vorschau ausblenden" : "Vorschau anzeigen"}
            </button>

            {showPreview && title && (
              <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", selectedType?.color)}>
                    {selectedType && <selectedType.icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{title}</h4>
                    <div className="text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                        {!allDay && (
                          <span className="text-amber-600 font-medium">
                            {startTime} - {endTime} Uhr
                          </span>
                        )}
                        {allDay && <span className="text-gray-500">(Ganztägig)</span>}
                      </div>
                      {(location || venue) && (
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {location}
                          {venue && ` - ${venue}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Command className="w-3 h-3" />
              <span>Enter zum Speichern</span>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddEventModal;
