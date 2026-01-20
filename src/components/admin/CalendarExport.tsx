import { useState, useMemo } from "react";
import { format, parseISO, isFuture, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { de } from "date-fns/locale";
import {
  Calendar, Copy, Check, ExternalLink, Download, FileText,
  FileSpreadsheet, File, Filter, ChevronDown, MapPin, Clock,
  Sparkles, Link2, CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  generateICalString,
  generateCSVString,
  generatePDF,
  downloadFile,
  getGoogleCalendarUrl,
  type ExportEvent,
} from "@/lib/calendarExportUtils";

interface CalendarExportProps {
  events?: ExportEvent[];
  selectedEventIds?: string[];
}

type ExportScope = "all" | "upcoming" | "selected" | "range";
type ExportFormat = "ical" | "csv" | "pdf" | "google";
type ExportTemplate = "full" | "compact" | "public";

const CalendarExport = ({ events = [], selectedEventIds = [] }: CalendarExportProps) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [scope, setScope] = useState<ExportScope>("upcoming");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("ical");
  const [template, setTemplate] = useState<ExportTemplate>("full");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const { toast } = useToast();

  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const today = new Date().toISOString().split("T")[0];
  const icalUrl = `${baseUrl}/functions/v1/calendar-feed?format=ics&refresh=${today}`;
  const googleCalendarUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(icalUrl)}`;

  // Filter events based on scope
  const filteredEvents = useMemo(() => {
    let result = [...events];

    switch (scope) {
      case "upcoming":
        result = result.filter((e) => isFuture(parseISO(e.start_time)));
        break;
      case "selected":
        result = result.filter((e) => selectedEventIds.includes(e.id));
        break;
      case "range":
        if (dateRange.from && dateRange.to) {
          result = result.filter((e) => {
            const eventDate = parseISO(e.start_time);
            return isWithinInterval(eventDate, {
              start: startOfDay(dateRange.from!),
              end: endOfDay(dateRange.to!),
            });
          });
        }
        break;
      // "all" - no filtering needed
    }

    return result.sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  }, [events, scope, selectedEventIds, dateRange]);

  // Preview events (first 3)
  const previewEvents = filteredEvents.slice(0, 3);

  const copyToClipboard = async (url: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "Kopiert!",
        description: `${label} URL wurde kopiert`,
      });
      setTimeout(() => setCopiedUrl(null), 3000);
    } catch {
      toast({
        title: "Fehler",
        description: "Konnte nicht kopieren",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    if (filteredEvents.length === 0) {
      toast({
        title: "Keine Events",
        description: "Es gibt keine Events zum Exportieren",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);

    try {
      const filename = `pater-brown-kalender-${format(new Date(), "yyyy-MM-dd")}`;

      switch (exportFormat) {
        case "ical": {
          const content = generateICalString({ events: filteredEvents, template });
          downloadFile(content, `${filename}.ics`, "text/calendar");
          break;
        }
        case "csv": {
          const content = generateCSVString({ events: filteredEvents, template });
          downloadFile(content, `${filename}.csv`, "text/csv;charset=utf-8");
          break;
        }
        case "pdf": {
          await generatePDF({ events: filteredEvents, template, filename: `${filename}.pdf` });
          break;
        }
        case "google": {
          // For Google Calendar, open subscription URL
          window.open(googleCalendarUrl, "_blank");
          break;
        }
      }

      setExportSuccess(true);
      toast({
        title: "Export erfolgreich",
        description: `${filteredEvents.length} Events wurden exportiert`,
      });
      
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export fehlgeschlagen",
        description: "Bitte versuche es erneut",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    { value: "ical", label: "iCal (.ics)", icon: Calendar, description: "Apple/Google Calendar" },
    { value: "csv", label: "CSV", icon: FileSpreadsheet, description: "Excel/Sheets" },
    { value: "pdf", label: "PDF", icon: FileText, description: "Druckversion" },
    { value: "google", label: "Google Calendar", icon: ExternalLink, description: "Direkt hinzufügen" },
  ];

  const templateOptions = [
    { value: "full", label: "Vollständig", description: "Alle Details inkl. Notizen" },
    { value: "compact", label: "Kompakt", description: "Nur Datum, Zeit, Ort" },
    { value: "public", label: "Öffentlich", description: "Ohne interne Infos" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Kalender exportieren</h2>
        <p className="text-gray-500 text-sm">
          Exportiere Events als iCal, CSV oder PDF
        </p>
      </div>

      {/* Scope Selection */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Was exportieren?
        </Label>
        <RadioGroup
          value={scope}
          onValueChange={(v) => setScope(v as ExportScope)}
          className="grid grid-cols-2 gap-2"
        >
          <div className={cn(
            "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all",
            scope === "all" ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"
          )}>
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="cursor-pointer flex-1">
              <span className="block text-sm font-medium">Alle Events</span>
              <span className="block text-xs text-gray-500">{events.length} Events</span>
            </Label>
          </div>
          <div className={cn(
            "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all",
            scope === "upcoming" ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"
          )}>
            <RadioGroupItem value="upcoming" id="upcoming" />
            <Label htmlFor="upcoming" className="cursor-pointer flex-1">
              <span className="block text-sm font-medium">Nur Anstehende</span>
              <span className="block text-xs text-gray-500">
                {events.filter(e => isFuture(parseISO(e.start_time))).length} Events
              </span>
            </Label>
          </div>
          <div className={cn(
            "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all",
            scope === "selected" ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300",
            selectedEventIds.length === 0 && "opacity-50"
          )}>
            <RadioGroupItem value="selected" id="selected" disabled={selectedEventIds.length === 0} />
            <Label htmlFor="selected" className={cn("cursor-pointer flex-1", selectedEventIds.length === 0 && "cursor-not-allowed")}>
              <span className="block text-sm font-medium">Ausgewählte</span>
              <span className="block text-xs text-gray-500">{selectedEventIds.length} ausgewählt</span>
            </Label>
          </div>
          <div className={cn(
            "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all",
            scope === "range" ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"
          )}>
            <RadioGroupItem value="range" id="range" />
            <Label htmlFor="range" className="cursor-pointer flex-1">
              <span className="block text-sm font-medium">Zeitraum</span>
              <span className="block text-xs text-gray-500">
                {dateRange.from && dateRange.to 
                  ? `${format(dateRange.from, "dd.MM.")} - ${format(dateRange.to, "dd.MM.")}`
                  : "Wählen..."}
              </span>
            </Label>
          </div>
        </RadioGroup>

        {/* Date Range Picker */}
        {scope === "range" && (
          <div className="flex gap-2 mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  {dateRange.from ? format(dateRange.from, "dd.MM.yyyy") : "Von"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarPicker
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                  locale={de}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  {dateRange.to ? format(dateRange.to, "dd.MM.yyyy") : "Bis"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarPicker
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Export Format */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <File className="w-4 h-4" />
          Format
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {formatOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setExportFormat(option.value as ExportFormat)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                exportFormat === option.value
                  ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                exportFormat === option.value ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"
              )}>
                <option.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900">{option.label}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Template Selection */}
      {exportFormat !== "google" && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Template
          </Label>
          <RadioGroup
            value={template}
            onValueChange={(v) => setTemplate(v as ExportTemplate)}
            className="flex gap-2"
          >
            {templateOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex-1 flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all",
                  template === option.value
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer flex-1">
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="block text-xs text-gray-500">{option.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Preview */}
      {filteredEvents.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Vorschau ({filteredEvents.length} Events)
            </Label>
          </div>
          <div className="space-y-2">
            {previewEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-amber-700">
                    {format(parseISO(event.start_time), "dd", { locale: de })}
                  </span>
                  <span className="text-[10px] text-amber-600 uppercase">
                    {format(parseISO(event.start_time), "MMM", { locale: de })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(event.start_time), "HH:mm", { locale: de })}
                    {event.venue_name && (
                      <>
                        <span>•</span>
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.venue_name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredEvents.length > 3 && (
              <div className="text-xs text-gray-400 text-center py-1">
                + {filteredEvents.length - 3} weitere Events
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Button */}
      <Button
        onClick={handleExport}
        disabled={isExporting || filteredEvents.length === 0}
        className={cn(
          "w-full h-12 rounded-xl font-semibold text-base transition-all",
          exportSuccess
            ? "bg-emerald-500 hover:bg-emerald-600"
            : "bg-amber-500 hover:bg-amber-600"
        )}
      >
        {isExporting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Exportiere...
          </>
        ) : exportSuccess ? (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Erfolgreich exportiert!
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            {filteredEvents.length} Events exportieren
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-sm text-gray-400">oder abonnieren</span>
        </div>
      </div>

      {/* Subscribe Options */}
      <div className="space-y-3">
        {/* Google Calendar */}
        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Google Calendar</div>
            <div className="text-xs text-gray-500">Automatische Synchronisierung</div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </a>

        {/* iCal URL */}
        <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">iCal URL</div>
              <div className="text-xs text-gray-500">Apple Kalender, Outlook, etc.</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
            <input
              type="text"
              value={icalUrl}
              readOnly
              className="flex-1 bg-transparent text-gray-700 text-xs focus:outline-none truncate font-mono"
            />
            <button
              onClick={() => copyToClipboard(icalUrl, "iCal")}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
            >
              {copiedUrl === icalUrl ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-700">
          💡 Abonnierte Kalender synchronisieren automatisch alle paar Stunden.
        </p>
      </div>
    </div>
  );
};

export default CalendarExport;
