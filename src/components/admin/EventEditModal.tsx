import { useState, useEffect, useCallback } from "react";
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
  Calendar,
  MapPin,
  Clock,
  Save,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_CATEGORIES, getCategoryByValue } from "@/lib/eventCategories";

// Unified event interface for all sources
export interface UniversalEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date | null;
  allDay?: boolean;
  location?: string | null;
  description?: string | null;
  category: string; // event_type or mapped category
  source: "calendar_events" | "admin_events" | "travel_bookings";
  metadata?: Record<string, any>;
}

interface EventEditModalProps {
  event: UniversalEvent | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

const EventEditModal = ({
  event,
  open,
  onClose,
  onSave,
  onDelete,
}: EventEditModalProps) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("other");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState("21:00");
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  // Populate form when event changes
  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setCategory(event.category || "other");
      setDate(event.start.toISOString().split("T")[0]);
      setStartTime(
        event.start.toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
      if (event.end) {
        setEndTime(
          event.end.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        );
      }
      setAllDay(event.allDay || false);
      setLocation(event.location || "");
      setDescription(event.description || "");
      setErrors({});
    }
  }, [event]);

  // Validation
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = "Titel ist erforderlich";
    }
    
    if (!date) {
      newErrors.date = "Datum ist erforderlich";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !event) return;

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

      // Update based on source table
      if (event.source === "calendar_events") {
        const { error } = await supabase
          .from("calendar_events")
          .update({
            title: title.trim(),
            event_type: category,
            start_datetime: startDatetime.toISOString(),
            end_datetime: endDatetime?.toISOString() || null,
            all_day: allDay,
            location: location.trim() || null,
            description: description.trim() || null,
          })
          .eq("id", event.id);

        if (error) throw error;
      } else if (event.source === "admin_events") {
        // Map category back to source for admin_events
        let source: "KL" | "KBA" | "unknown" = "unknown";
        if (category === "tour_kl") source = "KL";
        else if (category === "tour_kba") source = "KBA";

        const { error } = await supabase
          .from("admin_events")
          .update({
            title: title.trim(),
            source,
            start_time: startDatetime.toISOString(),
            end_time: endDatetime?.toISOString() || null,
            location: location.trim() || "",
            note: description.trim() || null,
          })
          .eq("id", event.id);

        if (error) throw error;
      } else if (event.source === "travel_bookings") {
        // Travel bookings have limited editable fields
        const { error } = await supabase
          .from("travel_bookings")
          .update({
            destination_city: location.trim() || event.metadata?.destination_city,
            start_datetime: startDatetime.toISOString(),
            end_datetime: endDatetime?.toISOString() || null,
          })
          .eq("id", event.id);

        if (error) throw error;
      }

      toast({
        title: "Gespeichert",
        description: `"${title}" wurde aktualisiert`,
      });

      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast({
        title: "Fehler",
        description: error.message || "Termin konnte nicht gespeichert werden",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !confirm("Diesen Termin wirklich löschen?")) return;

    setIsDeleting(true);
    try {
      let error = null;
      
      if (event.source === "calendar_events") {
        const result = await supabase.from("calendar_events").delete().eq("id", event.id);
        error = result.error;
      } else if (event.source === "admin_events") {
        const result = await supabase.from("admin_events").delete().eq("id", event.id);
        error = result.error;
      } else if (event.source === "travel_bookings") {
        const result = await supabase.from("travel_bookings").delete().eq("id", event.id);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Gelöscht",
        description: "Termin wurde gelöscht",
      });

      onDelete?.();
      onClose();
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Fehler",
        description: error.message || "Termin konnte nicht gelöscht werden",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if we can edit the category (not for travel bookings)
  const canEditCategory = event?.source !== "travel_bookings";
  const canDelete = event?.source !== "travel_bookings"; // Or allow with confirmation

  const formattedDate = date
    ? new Date(date).toLocaleDateString("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const selectedCategory = getCategoryByValue(category);
  const CategoryIcon = selectedCategory.icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", selectedCategory.color)}>
              <CategoryIcon className="w-4 h-4 text-white" />
            </div>
            Termin bearbeiten
          </DialogTitle>
          {date && (
            <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Title */}
          <div>
            <Label htmlFor="edit-title" className="flex items-center gap-1">
              Titel <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titel des Termins"
              className={cn(
                "mt-1 bg-white border-gray-200",
                errors.title && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Category Selector */}
          {canEditCategory && (
            <div>
              <Label>Kategorie</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                {EVENT_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={cn(
                        "flex flex-col items-center justify-center p-2.5 rounded-lg border-2 transition-all text-center",
                        isSelected
                          ? `${cat.color} border-transparent text-white shadow-md`
                          : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                      )}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-medium leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <Label htmlFor="edit-date" className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Datum <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={cn(
                  "mt-1 bg-white border-gray-200",
                  errors.date && "border-red-500"
                )}
              />
              {errors.date && (
                <p className="text-xs text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            {/* Time */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Zeit
                </Label>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
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
                    className="flex-1 bg-white border-gray-200"
                  />
                  <span className="text-gray-400">–</span>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="flex-1 bg-white border-gray-200"
                  />
                </div>
              )}
              {errors.time && (
                <p className="text-xs text-red-500 mt-1">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="edit-location" className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Ort
            </Label>
            <Input
              id="edit-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="z.B. Berlin, Friedrichstadtpalast"
              className="mt-1 bg-white border-gray-200"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="edit-description">Notizen</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Zusätzliche Informationen..."
              rows={3}
              className="mt-1 bg-white border-gray-200 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {canDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {isDeleting ? "Löschen..." : "Löschen"}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-200"
              >
                <X className="w-4 h-4 mr-1" />
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Save className="w-4 h-4 mr-1" />
                {isSubmitting ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventEditModal;
