import { useState } from "react";
import { Check, X, Edit2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ParsedEvent {
  date: string;
  start_time: string;
  end_time?: string;
  city: string;
  state?: string;
  venue?: string;
  venue_url?: string;
  note?: string;
  source: "KL" | "KBA" | "unknown";
}

interface EventConfirmDialogProps {
  events: ParsedEvent[];
  onConfirm: (events: ParsedEvent[]) => void;
  onCancel: () => void;
  onUpdateEvents: (events: ParsedEvent[]) => void;
}

const EventConfirmDialog = ({
  events,
  onConfirm,
  onCancel,
  onUpdateEvents,
}: EventConfirmDialogProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const hasUnknownSource = events.some((e) => e.source === "unknown");

  const updateEventSource = (index: number, source: "KL" | "KBA") => {
    const updated = [...events];
    updated[index].source = source;
    onUpdateEvents(updated);
  };

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-");
      return `${day}.${month}.${year}`;
    } catch {
      return dateStr;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "KL":
        return "Konzertdirektion Landgraf";
      case "KBA":
        return "Konzertbüro Augsburg";
      default:
        return "Unbekannt";
    }
  };

  const getSourceBadgeClass = (source: string) => {
    switch (source) {
      case "KL":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "KBA":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {events.length} Termine erkannt
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Überprüfe die extrahierten Termine und korrigiere sie bei Bedarf
          </DialogDescription>
        </DialogHeader>

        {hasUnknownSource && (
          <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-400">
              Einige Termine haben keine erkannte Quelle. Bitte wähle KL oder KBA.
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {events.map((event, index) => (
            <div
              key={index}
              className="p-4 bg-background/50 border border-border rounded-lg space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">
                    {formatDate(event.date)} · {event.start_time}
                    {event.end_time && ` – ${event.end_time}`} Uhr
                  </p>
                  <p className="text-gold font-medium">
                    {event.city}
                    {event.state && ` (${event.state})`}
                  </p>
                  {event.venue && (
                    <p className="text-muted-foreground text-sm">{event.venue}</p>
                  )}
                  {event.note && (
                    <p className="text-muted-foreground text-sm italic mt-1">
                      {event.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Source Selection */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Quelle:</span>
                <button
                  onClick={() => updateEventSource(index, "KL")}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                    event.source === "KL"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500"
                      : "bg-transparent text-muted-foreground border-border hover:border-blue-500/50"
                  }`}
                >
                  KL
                </button>
                <button
                  onClick={() => updateEventSource(index, "KBA")}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                    event.source === "KBA"
                      ? "bg-purple-500/20 text-purple-400 border-purple-500"
                      : "bg-transparent text-muted-foreground border-border hover:border-purple-500/50"
                  }`}
                >
                  KBA
                </button>
                {event.source === "unknown" && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    Bitte wählen
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-transparent border border-border text-foreground font-medium rounded-lg hover:bg-card transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Abbrechen
          </button>
          <button
            onClick={() => onConfirm(events)}
            disabled={hasUnknownSource}
            className="flex-1 py-3 bg-gold text-primary-foreground font-bold rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Speichern
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventConfirmDialog;
