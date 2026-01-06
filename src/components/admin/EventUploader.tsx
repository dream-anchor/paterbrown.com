import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, Sparkles, CloudUpload } from "lucide-react";
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
  latitude?: number;
  longitude?: number;
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
        description: `${file.name} wurde geladen`,
      });
    };
    reader.readAsText(file);
  };

  const handleConfirm = async (events: ParsedEvent[]) => {
    try {
      const dbEvents = events.map((event) => ({
        title: `TOUR PB (${event.source === "unknown" ? "?" : event.source})`,
        location: event.state ? `${event.city} (${event.state})` : event.city,
        state: event.state || null,
        venue_name: event.venue || null,
        venue_url: event.venue_url || null,
        start_time: `${event.date}T${event.start_time}:00`,
        end_time: event.end_time ? `${event.date}T${event.end_time}:00` : null,
        note: event.note || null,
        source: event.source,
        latitude: event.latitude || null,
        longitude: event.longitude || null,
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
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
          <CloudUpload className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
          Termine hinzufügen
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Lade eine Datei hoch oder füge Termindaten per Copy & Paste ein
        </p>
      </div>

      {/* Drop Zone - Notion Style */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200
          ${isDragging
            ? "border-amber-400 bg-amber-50 scale-[1.02]"
            : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50"
          }
        `}
      >
        <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-200
          ${isDragging ? "bg-amber-100" : "bg-gray-100"}
        `}>
          <Upload className={`w-8 h-8 transition-colors duration-200 ${isDragging ? "text-amber-500" : "text-gray-400"}`} />
        </div>
        
        <p className="text-gray-900 font-medium mb-1">
          Datei hierher ziehen
        </p>
        <p className="text-sm text-gray-500 mb-4">
          oder
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
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all duration-150 text-sm font-medium text-gray-700"
        >
          <FileText className="w-4 h-4" />
          Durchsuchen
        </label>
        
        <p className="text-xs text-gray-400 mt-4">
          Unterstützte Formate: .txt, .csv, .doc, .docx
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">oder</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Text Input */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Termine einfügen
          </label>
        </div>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={`Beispiel:
08.01.2026, 20:00 Uhr, Hamburg, Friedrich-Ebert-Halle (Konzertdirektion Landgraf)
15.01.2026, 19:30-22:00 Uhr, München, Deutsches Theater`}
          className="w-full h-40 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none resize-none"
        />
      </div>

      {/* Parse Button */}
      <button
        onClick={() => parseEvents(textInput)}
        disabled={isParsing || !textInput.trim()}
        className="w-full mt-6 py-4 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isParsing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>KI analysiert...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Mit KI analysieren</span>
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
