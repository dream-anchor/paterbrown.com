import { useState } from "react";
import { Calendar, Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CalendarExport = () => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const icalUrl = `${baseUrl}/functions/v1/calendar-feed?format=ics`;
  const googleCalendarUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(icalUrl)}`;

  const copyToClipboard = async (url: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "Kopiert!",
        description: `${label} URL wurde kopiert`,
      });
      setTimeout(() => setCopiedUrl(null), 3000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Konnte nicht kopieren",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-foreground mb-2">Kalender abonnieren</h2>
        <p className="text-muted-foreground text-sm">
          Abonniere den Kalender in Google Calendar oder Apple Kalender
        </p>
      </div>

      {/* Google Calendar */}
      <div className="p-6 bg-card/50 border border-border rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Google Calendar</h3>
            <p className="text-muted-foreground text-sm">
              Automatische Synchronisierung
            </p>
          </div>
        </div>

        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-gold text-primary-foreground font-bold rounded-lg hover:bg-gold/90 transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          In Google Calendar öffnen
        </a>
      </div>

      {/* iCal / Apple Calendar */}
      <div className="p-6 bg-card/50 border border-border rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gray-500/20 rounded-lg">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Apple Kalender / iCal</h3>
            <p className="text-muted-foreground text-sm">
              URL kopieren und in deinem Kalender abonnieren
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-background/50 border border-border rounded-lg">
            <input
              type="text"
              value={icalUrl}
              readOnly
              className="flex-1 bg-transparent text-foreground text-sm focus:outline-none truncate"
            />
            <button
              onClick={() => copyToClipboard(icalUrl, "iCal")}
              className="p-2 hover:bg-card rounded-lg transition-colors"
            >
              {copiedUrl === icalUrl ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">So abonnierst du:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Kopiere die URL oben</li>
              <li>Öffne Apple Kalender → Ablage → Neues Kalenderabonnement</li>
              <li>Füge die URL ein und klicke auf "Abonnieren"</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Outlook */}
      <div className="p-6 bg-card/50 border border-border rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-600/20 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Outlook</h3>
            <p className="text-muted-foreground text-sm">
              iCal URL verwenden
            </p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Kopiere die iCal URL von oben</li>
            <li>Öffne Outlook → Kalender → Kalender hinzufügen → Aus dem Internet abonnieren</li>
            <li>Füge die URL ein</li>
          </ol>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg">
        <p className="text-sm text-gold">
          💡 Tipp: Abonnierte Kalender werden automatisch aktualisiert, wenn du neue Termine hinzufügst.
        </p>
      </div>
    </div>
  );
};

export default CalendarExport;
