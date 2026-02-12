import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket, ExternalLink, Sparkles, Loader2, Check, X,
  ChevronDown, ChevronUp, AlertTriangle, Search, Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface KlEvent {
  id: string;
  location: string;
  venue_name: string | null;
  venue_url: string | null;
  ticket_url: string | null;
  ticket_url_approved: boolean;
  start_time: string;
  source: string;
}

interface VvkApprovalPanelProps {
  onApprovalChanged?: () => void;
}

type FilterMode = "pending" | "missing" | "approved" | "all";

const VvkApprovalPanel = ({ onApprovalChanged }: VvkApprovalPanelProps) => {
  const [events, setEvents] = useState<KlEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("pending");
  const [researchingIds, setResearchingIds] = useState<Set<string>>(new Set());
  const [editingUrlId, setEditingUrlId] = useState<string | null>(null);
  const [editUrlValue, setEditUrlValue] = useState("");
  const { toast } = useToast();

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("admin_events")
      .select("id, location, venue_name, venue_url, ticket_url, ticket_url_approved, start_time, source")
      .eq("source", "KL")
      .is("deleted_at", null)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("VVK fetch error:", error);
      return;
    }
    setEvents(data || []);
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

    try {
      const { data, error } = await supabase.functions.invoke("research-ticket-url", {
        body: {
          event_id: event.id,
          venue_name: event.venue_name || "",
          city: event.location,
          venue_url: event.venue_url || "",
        },
      });

      if (error) throw error;

      if (data?.ticket_url) {
        setEvents(prev => prev.map(e =>
          e.id === event.id ? { ...e, ticket_url: data.ticket_url, ticket_url_approved: false } : e
        ));
        toast({
          title: "Ticket-Link gefunden",
          description: `${data.source_description} (${data.confidence})`,
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

  const handleSaveUrl = async (eventId: string) => {
    const url = editUrlValue.trim() || null;
    const { error } = await supabase
      .from("admin_events")
      .update({ ticket_url: url, ticket_url_approved: false })
      .eq("id", eventId);

    if (error) {
      toast({ title: "Fehler beim Speichern", variant: "destructive" });
      return;
    }

    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, ticket_url: url, ticket_url_approved: false } : e
    ));
    setEditingUrlId(null);
    toast({ title: "URL gespeichert" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  if (isLoading) return null;

  // Nur anzeigen wenn KL-Events existieren
  if (events.length === 0) return null;

  return (
    <div className="mb-4">
      {/* Header / Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all",
          "bg-white border shadow-sm hover:shadow-md",
          pendingCount > 0 ? "border-amber-200" : "border-gray-200/60"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            pendingCount > 0 ? "bg-amber-100" : "bg-emerald-100"
          )}>
            <Ticket className={cn("w-4 h-4", pendingCount > 0 ? "text-amber-600" : "text-emerald-600")} />
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-gray-800">VVK-Freigabe</span>
            <div className="flex items-center gap-2 mt-0.5">
              {pendingCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                  {pendingCount} zur Freigabe
                </span>
              )}
              {missingCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
                  {missingCount} fehlen
                </span>
              )}
              {approvedCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                  {approvedCount} live
                </span>
              )}
            </div>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 bg-white border border-gray-200/60 rounded-xl shadow-sm">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-2 border-b border-gray-100">
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

                {/* Alle recherchieren Button */}
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

              {/* Event List */}
              <div className="max-h-[400px] overflow-y-auto">
                {filteredEvents.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-sm">
                    {filter === "pending" ? "Keine Links zur Freigabe" :
                     filter === "missing" ? "Alle KL-Events haben einen VVK-Link" :
                     filter === "approved" ? "Noch keine Links freigegeben" :
                     "Keine KL-Events"}
                  </div>
                ) : (
                  filteredEvents.map((event, idx) => (
                    <div
                      key={event.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50/50",
                        idx < filteredEvents.length - 1 && "border-b border-gray-100"
                      )}
                    >
                      {/* Status Indicator */}
                      <div className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        event.ticket_url && event.ticket_url_approved ? "bg-emerald-500" :
                        event.ticket_url ? "bg-amber-400" :
                        "bg-red-300"
                      )} />

                      {/* Event Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800 truncate">
                            {event.venue_name || event.location}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {event.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">
                            {formatDate(event.start_time)}
                          </span>
                          {editingUrlId === event.id ? (
                            <div className="flex items-center gap-1 flex-1">
                              <input
                                type="url"
                                value={editUrlValue}
                                onChange={e => setEditUrlValue(e.target.value)}
                                placeholder="https://..."
                                className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-300"
                                autoFocus
                                onKeyDown={e => {
                                  if (e.key === "Enter") handleSaveUrl(event.id);
                                  if (e.key === "Escape") setEditingUrlId(null);
                                }}
                              />
                              <button
                                onClick={() => handleSaveUrl(event.id)}
                                className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingUrlId(null)}
                                className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : event.ticket_url ? (
                            <button
                              onClick={() => { setEditingUrlId(event.id); setEditUrlValue(event.ticket_url || ""); }}
                              className="text-xs text-blue-500 hover:text-blue-700 truncate max-w-[200px] flex items-center gap-0.5"
                              title={event.ticket_url}
                            >
                              <Globe className="w-3 h-3 flex-shrink-0" />
                              {new URL(event.ticket_url).hostname}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Recherche Button */}
                        {!event.ticket_url && (
                          <button
                            onClick={() => handleResearch(event)}
                            disabled={researchingIds.has(event.id)}
                            className={cn(
                              "flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all",
                              "bg-amber-50 text-amber-600 hover:bg-amber-100",
                              researchingIds.has(event.id) && "opacity-50"
                            )}
                          >
                            {researchingIds.has(event.id) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Search className="w-3 h-3" />
                            )}
                            Suchen
                          </button>
                        )}

                        {/* URL manuell setzen */}
                        {!event.ticket_url && editingUrlId !== event.id && (
                          <button
                            onClick={() => { setEditingUrlId(event.id); setEditUrlValue(""); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            title="URL manuell eingeben"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Freigeben / Zurückziehen */}
                        {event.ticket_url && !event.ticket_url_approved && (
                          <button
                            onClick={() => handleApprove(event.id)}
                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"
                          >
                            <Check className="w-3 h-3" />
                            Freigeben
                          </button>
                        )}
                        {event.ticket_url && event.ticket_url_approved && (
                          <button
                            onClick={() => handleReject(event.id)}
                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
                          >
                            <X className="w-3 h-3" />
                            Zurückziehen
                          </button>
                        )}

                        {/* Extern öffnen */}
                        {event.ticket_url && (
                          <a
                            href={event.ticket_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-blue-500 transition-colors"
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VvkApprovalPanel;
