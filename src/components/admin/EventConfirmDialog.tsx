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
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "KBA":
        return "bg-purple-100 text-purple-700 border-purple-300";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
  };

  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {events.length} Termine erkannt
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Überprüfe die extrahierten Termine und korrigiere sie bei Bedarf
          </DialogDescription>
        </DialogHeader>

        {hasUnknownSource && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-700">
              Einige Termine haben keine erkannte Quelle. Bitte wähle KL oder KBA.
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {events.map((event, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">
                    {formatDate(event.date)} · {event.start_time}
                    {event.end_time && ` – ${event.end_time}`} Uhr
                  </p>
                  <p className="text-amber-600 font-medium">
                    {event.city}
                    {event.state && ` (${event.state})`}
                  </p>
                  {event.venue && (
                    <p className="text-gray-600 text-sm">{event.venue}</p>
                  )}
                  {event.note && (
                    <p className="text-gray-500 text-sm italic mt-1">
                      {event.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Source Selection */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Quelle:</span>
                <button
                  onClick={() => updateEventSource(index, "KL")}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                    event.source === "KL"
                      ? "bg-blue-100 text-blue-700 border-blue-400"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  KL
                </button>
                <button
                  onClick={() => updateEventSource(index, "KBA")}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                    event.source === "KBA"
                      ? "bg-purple-100 text-purple-700 border-purple-400"
                      : "bg-white text-gray-600 border-gray-300 hover:border-purple-400"
                  }`}
                >
                  KBA
                </button>
                {event.source === "unknown" && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
                    Bitte wählen
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Abbrechen
          </button>
          <button
            onClick={() => onConfirm(events)}
            disabled={hasUnknownSource}
            className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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