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
        <h2 className="text-xl font-bold text-gray-900 mb-2">Kalender abonnieren</h2>
        <p className="text-gray-600 text-sm">
          Abonniere den Kalender in Google Calendar oder Apple Kalender
        </p>
      </div>

      {/* Google Calendar */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Google Calendar</h3>
            <p className="text-gray-600 text-sm">
              Automatische Synchronisierung
            </p>
          </div>
        </div>

        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          In Google Calendar öffnen
        </a>
      </div>

      {/* iCal / Apple Calendar */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Calendar className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Apple Kalender / iCal</h3>
            <p className="text-gray-600 text-sm">
              URL kopieren und in deinem Kalender abonnieren
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <input
              type="text"
              value={icalUrl}
              readOnly
              className="flex-1 bg-transparent text-gray-900 text-sm focus:outline-none truncate"
            />
            <button
              onClick={() => copyToClipboard(icalUrl, "iCal")}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {copiedUrl === icalUrl ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium">So abonnierst du:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-500">
              <li>Kopiere die URL oben</li>
              <li>Öffne Apple Kalender → Ablage → Neues Kalenderabonnement</li>
              <li>Füge die URL ein und klicke auf "Abonnieren"</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Outlook */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Outlook</h3>
            <p className="text-gray-600 text-sm">
              iCal URL verwenden
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <ol className="list-decimal list-inside space-y-1 text-xs text-gray-500">
            <li>Kopiere die iCal URL von oben</li>
            <li>Öffne Outlook → Kalender → Kalender hinzufügen → Aus dem Internet abonnieren</li>
            <li>Füge die URL ein</li>
          </ol>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-700">
          💡 Tipp: Abonnierte Kalender werden automatisch aktualisiert, wenn du neue Termine hinzufügst.
        </p>
      </div>
    </div>
  );
};

export default CalendarExport;