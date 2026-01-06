import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EventConfirmDialog from "./EventConfirmDialog";

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

interface EventUploaderProps {
  onEventsAdded: () => void;
}

const EventUploader = ({ onEventsAdded }: EventUploaderProps) => {
  const [textInput, setTextInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedEvents, setParsedEvents] = useState<ParsedEvent[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const parseEvents = async (content: string) => {
    if (!content.trim()) {
      toast({
        title: "Keine Daten",
        description: "Bitte gib Termindaten ein oder lade eine Datei hoch",
        variant: "destructive",
      });
      return;
    }

    setIsParsing(true);

    try {
      const { data, error } = await supabase.functions.invoke("parse-events", {
        body: { content },
      });

      if (error) throw error;

      if (data.events && data.events.length > 0) {
        setParsedEvents(data.events);
        setShowConfirmDialog(true);
      } else {
        toast({
          title: "Keine Termine gefunden",
          description: "Die KI konnte keine Termine aus den Daten extrahieren",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Parse error:", error);
      toast({
        title: "Fehler beim Analysieren",
        description: error.message || "Bitte versuche es erneut",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      readFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTextInput(content);
      toast({
        title: "Datei geladen",
        description: `${file.name} wurde geladen. Klicke auf "KI Analysieren" um fortzufahren.`,
      });
    };
    reader.readAsText(file);
  };

  const handleConfirm = async (events: ParsedEvent[]) => {
    try {
      // Transform events to match database schema
      const dbEvents = events.map((event) => ({
        title: `TOUR PB${event.source !== "unknown" ? ` (${event.source})` : ""}`,
        location: event.city,
        state: event.state || null,
        venue_name: event.venue || null,
        venue_url: event.venue_url || null,
        start_time: `${event.date}T${event.start_time}:00`,
        end_time: event.end_time ? `${event.date}T${event.end_time}:00` : null,
        note: event.note || null,
        source: event.source,
      }));

      const { error } = await supabase.from("admin_events").insert(dbEvents);

      if (error) throw error;

      setTextInput("");
      setParsedEvents([]);
      setShowConfirmDialog(false);
      onEventsAdded();
    } catch (error: any) {
      console.error("Insert error:", error);
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Events konnten nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-foreground mb-2">Termine hinzufügen</h2>
        <p className="text-muted-foreground text-sm">
          Lade eine Datei hoch oder füge Termindaten per Copy & Paste ein
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragging
            ? "border-gold bg-gold/10"
            : "border-border hover:border-gold/50 bg-card/50"
          }
        `}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-gold" : "text-muted-foreground"}`} />
        <p className="text-foreground font-medium mb-2">
          Datei hier ablegen
        </p>
        <p className="text-muted-foreground text-sm mb-4">
          oder klicke zum Auswählen
        </p>
        <input
          type="file"
          accept=".txt,.csv,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg cursor-pointer hover:border-gold/50 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Datei auswählen
        </label>
      </div>

      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Oder Termine hier einfügen:
        </label>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={`Beispiel:
08.01.2026, 20:00 Uhr, Hamburg, Friedrich-Ebert-Halle (Konzertdirektion Landgraf)
15.01.2026, 19:30-22:00 Uhr, München, Deutsches Theater`}
          className="w-full h-40 px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold resize-none"
        />
      </div>

      {/* Parse Button */}
      <button
        onClick={() => parseEvents(textInput)}
        disabled={isParsing || !textInput.trim()}
        className="w-full py-4 bg-gold text-primary-foreground font-bold rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isParsing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            KI analysiert...
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5" />
            KI Analysieren
          </>
        )}
      </button>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <EventConfirmDialog
          events={parsedEvents}
          onConfirm={handleConfirm}
          onCancel={() => {
            setShowConfirmDialog(false);
            setParsedEvents([]);
          }}
          onUpdateEvents={setParsedEvents}
        />
      )}
    </div>
  );
};

export default EventUploader;
