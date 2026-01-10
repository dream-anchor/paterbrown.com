import { useState, useEffect } from "react";
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
import { Theater, Film, User, Users, Calendar } from "lucide-react";

interface QuickAddEventModalProps {
  open: boolean;
  onClose: () => void;
  date: Date | null;
  onEventAdded: () => void;
}

const eventTypes = [
  { value: "theater", label: "Theater", icon: Theater, color: "bg-red-600" },
  { value: "filming", label: "Dreh", icon: Film, color: "bg-purple-500" },
  { value: "meeting", label: "Meeting", icon: Users, color: "bg-emerald-500" },
  { value: "private", label: "Privat", icon: User, color: "bg-green-500" },
  { value: "other", label: "Sonstiges", icon: Calendar, color: "bg-gray-400" },
];

const QuickAddEventModal = ({ open, onClose, date, onEventAdded }: QuickAddEventModalProps) => {
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("other");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTitle("");
      setEventType("other");
      setStartTime("09:00");
      setEndTime("17:00");
      setAllDay(false);
      setLocation("");
      setDescription("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

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

      const { error } = await supabase.from("calendar_events").insert({
        title: title.trim(),
        event_type: eventType,
        start_datetime: startDatetime.toISOString(),
        end_datetime: endDatetime?.toISOString() || null,
        all_day: allDay,
        location: location.trim() || null,
        description: description.trim() || null,
      });

      if (error) throw error;

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

  const formattedDate = date?.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            Neuer Termin
          </DialogTitle>
          {date && (
            <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Premiere, Meeting, Drehtag..."
              className="mt-1"
              autoFocus
            />
          </div>

          {/* Event Type */}
          <div>
            <Label>Typ</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {eventTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = eventType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setEventType(type.value)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all
                      ${isSelected 
                        ? `${type.color} border-transparent text-white` 
                        : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label>Zeit</Label>
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
                  className="flex-1"
                />
                <span className="text-gray-400">bis</span>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="flex-1"
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Ort (optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="z.B. Studio, Theater, Büro..."
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Notiz (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Zusätzliche Infos..."
              className="mt-1 resize-none"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={!title.trim() || isSubmitting}>
              {isSubmitting ? "Speichern..." : "Speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddEventModal;
