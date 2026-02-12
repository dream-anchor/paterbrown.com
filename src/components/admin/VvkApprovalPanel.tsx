import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket, ExternalLink, Sparkles, Loader2, Check, X,
  AlertTriangle, Search, Globe, Link2, MapPin, Phone, Store, Mail, Info, Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type TicketType = "online" | "telefon" | "vor_ort" | "abendkasse" | "email" | "gemischt" | "pending" | "unbekannt";

interface KlEvent {
  id: string;
  location: string;
  venue_name: string | null;
  venue_url: string | null;
  venue_address: string | null;
  ticket_url: string | null;
  ticket_url_approved: boolean;
  ticket_info: string | null;
  ticket_type: TicketType | null;
  start_time: string;
  source: string;
}

const TICKET_TYPE_CONFIG: Record<TicketType, { label: string; icon: typeof Globe; color: string }> = {
  online: { label: "Online", icon: Globe, color: "text-blue-500 bg-blue-50" },
  telefon: { label: "Telefon", icon: Phone, color: "text-purple-500 bg-purple-50" },
  vor_ort: { label: "Vor Ort", icon: Store, color: "text-orange-500 bg-orange-50" },
  abendkasse: { label: "Abendkasse", icon: Ticket, color: "text-gray-500 bg-gray-50" },
  email: { label: "E-Mail", icon: Mail, color: "text-teal-500 bg-teal-50" },
  gemischt: { label: "Gemischt", icon: Info, color: "text-amber-500 bg-amber-50" },
  pending: { label: "VVK noch nicht online", icon: Clock, color: "text-yellow-600 bg-yellow-50" },
  unbekannt: { label: "Unbekannt", icon: Search, color: "text-gray-400 bg-gray-50" },
};

interface VvkApprovalPanelProps {
  onApprovalChanged?: () => void;
  standalone?: boolean;
}

type FilterMode = "pending" | "missing" | "approved" | "all";

/** Extract PLZ from venue_address (German format: "Straße 1, 65824 Stadt") */
const extractPlz = (address: string | null): string | null => {
  if (!address) return null;
  const match = address.match(/\b(\d{5})\b/);
  return match ? match[1] : null;
};

const VvkApprovalPanel = ({ onApprovalChanged, standalone = false }: VvkApprovalPanelProps) => {
  const [events, setEvents] = useState<KlEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>("pending");
  const [researchingIds, setResearchingIds] = useState<Set<string>>(new Set());
  const [editingUrlId, setEditingUrlId] = useState<string | null>(null);
  const [editUrlValue, setEditUrlValue] = useState("");
  const [manualInputId, setManualInputId] = useState<string | null>(null);
  const [manualUrlValue, setManualUrlValue] = useState("");
  const [researchNotes, setResearchNotes] = useState<Map<string, string>>(new Map());
  const { toast } = useToast();

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("admin_events")
      .select("id, location, venue_name, venue_url, venue_address, ticket_url, ticket_url_approved, ticket_info, ticket_type, start_time, source")
      .eq("source", "KL")
      .is("deleted_at", null)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("VVK fetch error:", error);
      return;
    }
    setEvents((data as KlEvent[]) || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const pendingCount = events.filter(e => e.ticket_url && !e.ticket_url_approved).length;
  const missingCount = events.filter(e => !e.ticket_url).length;
  const approvedCount = events.filter(e => e.ticket_url && e.ticket_url_approved).length;

  const filteredEvents = events.filter(e => {
    switch (filter) {
      case "pending": return e.ticket_url && !e.ticket_url_approved;
      case "missing": return !e.ticket_url;
      case "approved": return e.ticket_url && e.ticket_url_approved;
      case "all": return true;
    }
  });

  const handleApprove = async (eventId: string) => {
    const { error } = await supabase
      .from("admin_events")
      .update({ ticket_url_approved: true })
      .eq("id", eventId);

    if (error) {
      toast({ title: "Fehler beim Freigeben", variant: "destructive" });
      return;
    }

    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ticket_url_approved: true } : e));
    toast({ title: "VVK-Link freigegeben" });
    onApprovalChanged?.();
  };

  const handleReject = async (eventId: string) => {
    const { error } = await supabase
      .from("admin_events")
      .update({ ticket_url_approved: false })
      .eq("id", eventId);

    if (error) {
      toast({ title: "Fehler", variant: "destructive" });
      return;
    }

    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ticket_url_approved: false } : e));
    onApprovalChanged?.();
  };

  const handleResearch = async (event: KlEvent) => {
    setResearchingIds(prev => new Set(prev).add(event.id));
    const plz = extractPlz(event.venue_address);

    try {
      const { data, error } = await supabase.functions.invoke("research-ticket-url", {
        body: {
          event_id: event.id,
          venue_name: event.venue_name || "",
          city: plz ? `${plz} ${event.location}` : event.location,
          venue_url: event.venue_url || "",
        },
      });

      if (error) throw error;

      if (data?.ticket_url || data?.ticket_info) {
        setEvents(prev => prev.map(e =>
          e.id === event.id ? {
            ...e,
            ticket_url: data.ticket_url || e.ticket_url,
            ticket_url_approved: false,
            ticket_info: data.ticket_info || e.ticket_info,
            ticket_type: data.ticket_type || e.ticket_type,
          } : e
        ));
        if (data.source_description) {
          setResearchNotes(prev => new Map(prev).set(event.id, data.source_description));
        }
        const isPending = data.ticket_type === "pending";
        toast({
          title: isPending ? "Kontaktdaten gefunden" : "Ticket-Link gefunden",
          description: isPending
            ? `${data.ticket_info?.substring(0, 100)}...`
            : `${data.ticket_info || data.source_description} (${data.confidence})`,
        });
      } else {
        toast({ title: "Kein Link gefunden", description: event.venue_name || event.location, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Recherche fehlgeschlagen", description: err.message, variant: "destructive" });
    } finally {
      setResearchingIds(prev => {
        const next = new Set(prev);
        next.delete(event.id);
        return next;
      });
    }
  };

  const handleResearchAll = async () => {
    const missing = events.filter(e => !e.ticket_url);
    for (const event of missing) {
      await handleResearch(event);
    }
  };

  const handleSaveUrl = async (eventId: string, url: string) => {
    const trimmed = url.trim() || null;
    const { error } = await supabase
      .from("admin_events")
      .update({ ticket_url: trimmed, ticket_url_approved: false })
      .eq("id", eventId);

    if (error) {
      toast({ title: "Fehler beim Speichern", variant: "destructive" });
      return;
    }

    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, ticket_url: trimmed, ticket_url_approved: false } : e
    ));
    setEditingUrlId(null);
    setManualInputId(null);
    toast({ title: "URL gespeichert" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Ticket className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Keine KL-Events vorhanden</p>
      </div>
    );
  }

  // ── Standalone full-page layout ──
  if (standalone) {
    return (
      <div className="h-[calc(100vh-12rem)] flex flex-col bg-gray-50">
        {/* Header with stats */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">VVK-Freigabe (Landgraf)</h2>
              <p className="text-sm text-gray-500 mt-0.5">{events.length} KL-Events</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Stats badges */}
              {pendingCount > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  {pendingCount} zur Freigabe
                </span>
              )}
              {missingCount > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-300" />
                  {missingCount} fehlen
                </span>
              )}
              {approvedCount > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {approvedCount} live
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filter tabs + batch actions */}
        <div className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-white border-b border-gray-100">
          {([
            { key: "pending" as FilterMode, label: "Zur Freigabe", count: pendingCount, color: "amber" },
            { key: "missing" as FilterMode, label: "Fehlt", count: missingCount, color: "red" },
            { key: "approved" as FilterMode, label: "Live", count: approvedCount, color: "emerald" },
            { key: "all" as FilterMode, label: "Alle", count: events.length, color: "gray" },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                filter === tab.key
                  ? tab.color === "amber" ? "bg-amber-100 text-amber-700"
                    : tab.color === "red" ? "bg-red-50 text-red-600"
                    : tab.color === "emerald" ? "bg-emerald-50 text-emerald-600"
                    : "bg-gray-100 text-gray-700"
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}

          {filter === "missing" && missingCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto text-xs h-7 hover:border-amber-300 hover:bg-amber-50"
              onClick={handleResearchAll}
              disabled={researchingIds.size > 0}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Alle recherchieren
            </Button>
          )}
        </div>

        {/* Event list - full height scrollable */}
        <div className="flex-1 overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              {filter === "pending" ? "Keine Links zur Freigabe" :
               filter === "missing" ? "Alle KL-Events haben einen VVK-Link" :
               filter === "approved" ? "Noch keine Links freigegeben" :
               "Keine KL-Events"}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredEvents.map((event) => {
                const plz = extractPlz(event.venue_address);
                const isEditing = editingUrlId === event.id;
                const isManualInput = manualInputId === event.id;

                return (
                  <div
                    key={event.id}
                    className="px-6 py-4 hover:bg-white transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Status */}
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5",
                        event.ticket_url && event.ticket_url_approved ? "bg-emerald-500" :
                        event.ticket_url ? "bg-amber-400" :
                        "bg-red-300"
                      )} />

                      {/* Event details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {event.venue_name || event.location}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="w-3 h-3" />
                            {plz && <span className="font-mono text-gray-500">{plz}</span>}
                            {event.location}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {formatDate(event.start_time)}
                          {event.venue_url && (
                            <>
                              {" · "}
                              <a href={event.venue_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                                {new URL(event.venue_url).hostname}
                              </a>
                            </>
                          )}
                        </div>

                        {/* Current URL display / inline edit */}
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="url"
                              value={editUrlValue}
                              onChange={e => setEditUrlValue(e.target.value)}
                              placeholder="https://..."
                              className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === "Enter") handleSaveUrl(event.id, editUrlValue);
                                if (e.key === "Escape") setEditingUrlId(null);
                              }}
                            />
                            <button onClick={() => handleSaveUrl(event.id, editUrlValue)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingUrlId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : event.ticket_url ? (
                          <button
                            onClick={() => { setEditingUrlId(event.id); setEditUrlValue(event.ticket_url || ""); }}
                            className="mt-1.5 text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 truncate max-w-md"
                            title={event.ticket_url}
                          >
                            <Globe className="w-3 h-3 flex-shrink-0" />
                            {event.ticket_url}
                          </button>
                        ) : null}

                        {/* Ticket info — shows HOW tickets are sold */}
                        {(event.ticket_info || researchNotes.get(event.id)) && (() => {
                          const infoText = event.ticket_info || researchNotes.get(event.id) || "";
                          const isPending = event.ticket_type === "pending";
                          const bgColor = isPending ? "text-yellow-800 bg-yellow-50 border border-yellow-200" : "text-amber-700 bg-amber-50";

                          return (
                            <div className="mt-1.5 flex items-start gap-2">
                              {event.ticket_type && event.ticket_type !== "unbekannt" && (() => {
                                const cfg = TICKET_TYPE_CONFIG[event.ticket_type as TicketType];
                                if (!cfg) return null;
                                const TypeIcon = cfg.icon;
                                return (
                                  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0", cfg.color)}
                                    title={isPending ? "Pater Brown noch nicht im Programm – allgemeine VVK-Kontaktdaten" : undefined}
                                  >
                                    <TypeIcon className="w-3 h-3" />
                                    {cfg.label}
                                  </span>
                                );
                              })()}
                              <p className={cn("text-xs px-2 py-1 rounded-md max-w-md leading-relaxed", bgColor)}
                                dangerouslySetInnerHTML={{
                                  __html: infoText
                                    // Make phone numbers clickable
                                    .replace(/((?:\+49|0)\s*[\d\s/\-().]{6,20}\d)/g, '<a href="tel:$1" class="underline text-purple-600 hover:text-purple-800">$1</a>')
                                    // Make email addresses clickable
                                    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" class="underline text-teal-600 hover:text-teal-800">$1</a>')
                                }}
                              />
                            </div>
                          );
                        })()}

                        {/* Manual URL input (prominent, for missing events) */}
                        {isManualInput && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 relative">
                              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                              <input
                                type="url"
                                value={manualUrlValue}
                                onChange={e => setManualUrlValue(e.target.value)}
                                placeholder="Ticket-URL manuell eingeben..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 bg-white"
                                autoFocus
                                onKeyDown={e => {
                                  if (e.key === "Enter") handleSaveUrl(event.id, manualUrlValue);
                                  if (e.key === "Escape") setManualInputId(null);
                                }}
                              />
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSaveUrl(event.id, manualUrlValue)}
                              disabled={!manualUrlValue.trim()}
                              className="bg-amber-500 hover:bg-amber-600 text-white"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Speichern
                            </Button>
                            <button onClick={() => setManualInputId(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* AI Research */}
                        {!event.ticket_url && (
                          <button
                            onClick={() => handleResearch(event)}
                            disabled={researchingIds.has(event.id)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                              "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200/50",
                              researchingIds.has(event.id) && "opacity-50"
                            )}
                          >
                            {researchingIds.has(event.id) ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Search className="w-3.5 h-3.5" />
                            )}
                            KI-Suche
                          </button>
                        )}

                        {/* Manual URL entry */}
                        {!event.ticket_url && manualInputId !== event.id && (
                          <button
                            onClick={() => { setManualInputId(event.id); setManualUrlValue(""); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 border border-gray-200/50 transition-all"
                            title="URL manuell eingeben"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            Manuell
                          </button>
                        )}

                        {/* Approve */}
                        {event.ticket_url && !event.ticket_url_approved && (
                          <button
                            onClick={() => handleApprove(event.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/50 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Freigeben
                          </button>
                        )}

                        {/* Revoke */}
                        {event.ticket_url && event.ticket_url_approved && (
                          <button
                            onClick={() => handleReject(event.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-200/50 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                            Zurückziehen
                          </button>
                        )}

                        {/* Open external */}
                        {event.ticket_url && (
                          <a
                            href={event.ticket_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-blue-500 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Compact collapsible layout (legacy, if needed elsewhere) ──
  return null;
};

export default VvkApprovalPanel;
