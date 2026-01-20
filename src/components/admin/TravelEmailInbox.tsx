import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isToday, isYesterday, subDays, isAfter } from "date-fns";
import { de } from "date-fns/locale";
import {
  Mail, CheckCircle2, Loader2, AlertCircle, Clock,
  RefreshCw, Inbox, Check, Paperclip, Search, X,
  Train, Hotel, Plane, Car, Filter, ChevronDown,
  MailOpen, FileText, Sparkles, ArrowRight, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TravelEmail {
  id: string;
  from_address: string;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  received_at: string;
  status: "pending" | "processing" | "processed" | "error";
  error_message: string | null;
  created_at: string;
  attachment_urls: any;
  is_read?: boolean;
}

interface Props {
  onEmailProcessed: () => void;
}

const statusConfig = {
  pending: { icon: Clock, label: "Ausstehend", color: "bg-muted text-muted-foreground border-border" },
  processing: { icon: Loader2, label: "Wird verarbeitet", color: "bg-blue-50 text-blue-600 border-blue-100" },
  processed: { icon: CheckCircle2, label: "Verarbeitet", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  error: { icon: AlertCircle, label: "Fehler", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

// Detect provider from email
const detectProvider = (email: TravelEmail): { type: string; icon: typeof Train; label: string } | null => {
  const text = `${email.from_address} ${email.subject || ""} ${email.body_text || ""}`.toLowerCase();
  
  if (text.includes("bahn") || text.includes("db ") || text.includes("deutsche bahn")) {
    return { type: "train", icon: Train, label: "Deutsche Bahn" };
  }
  if (text.includes("hotel") || text.includes("booking.com") || text.includes("hrs") || text.includes("accor")) {
    return { type: "hotel", icon: Hotel, label: "Hotel" };
  }
  if (text.includes("lufthansa") || text.includes("eurowings") || text.includes("flug") || text.includes("flight")) {
    return { type: "flight", icon: Plane, label: "Flug" };
  }
  if (text.includes("sixt") || text.includes("mietwagen") || text.includes("rental")) {
    return { type: "car", icon: Car, label: "Mietwagen" };
  }
  return null;
};

// Get sender initials
const getInitials = (email: string): string => {
  const parts = email.split("@")[0].split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
};

// Get preview text
const getPreviewText = (email: TravelEmail): string => {
  const text = email.body_text || "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.substring(0, 120) + (cleaned.length > 120 ? "..." : "");
};

// Format date smartly
const formatSmartDate = (dateStr: string): string => {
  const date = parseISO(dateStr);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Gestern";
  return format(date, "d. MMM", { locale: de });
};

// Check if email has attachments
const hasAttachments = (email: TravelEmail): boolean => {
  if (!email.attachment_urls) return false;
  if (Array.isArray(email.attachment_urls)) return email.attachment_urls.length > 0;
  if (typeof email.attachment_urls === "object") return Object.keys(email.attachment_urls).length > 0;
  return false;
};

type FilterType = "all" | "unread" | "attachments" | "train" | "hotel" | "flight" | "car";
type DateFilter = "all" | "today" | "week" | "month";

export default function TravelEmailInbox({ onEmailProcessed }: Props) {
  const [emails, setEmails] = useState<TravelEmail[]>([]);
  const [readEmails, setReadEmails] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<TravelEmail | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set(["all"]));
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { toast } = useToast();
  const listRef = useRef<HTMLDivElement>(null);

  // Filter emails
  const filteredEmails = emails.filter((email) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches = 
        email.subject?.toLowerCase().includes(query) ||
        email.from_address.toLowerCase().includes(query) ||
        email.body_text?.toLowerCase().includes(query);
      if (!matches) return false;
    }

    // Date filter
    if (dateFilter !== "all") {
      const emailDate = parseISO(email.received_at);
      const now = new Date();
      if (dateFilter === "today" && !isToday(emailDate)) return false;
      if (dateFilter === "week" && !isAfter(emailDate, subDays(now, 7))) return false;
      if (dateFilter === "month" && !isAfter(emailDate, subDays(now, 30))) return false;
    }

    // Type filters
    if (!activeFilters.has("all")) {
      if (activeFilters.has("unread") && readEmails.has(email.id)) return false;
      if (activeFilters.has("attachments") && !hasAttachments(email)) return false;
      
      const provider = detectProvider(email);
      if (activeFilters.has("train") && provider?.type !== "train") return false;
      if (activeFilters.has("hotel") && provider?.type !== "hotel") return false;
      if (activeFilters.has("flight") && provider?.type !== "flight") return false;
      if (activeFilters.has("car") && provider?.type !== "car") return false;
    }

    return true;
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredEmails.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" || e.key === "o") {
        e.preventDefault();
        if (filteredEmails[selectedIndex]) {
          handleSelectEmail(filteredEmails[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        setSelectedEmail(null);
      } else if (e.key === "r" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleRefresh();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredEmails, selectedIndex]);

  // Update selected email when index changes
  useEffect(() => {
    if (filteredEmails[selectedIndex]) {
      // Don't auto-open, just highlight
    }
  }, [selectedIndex, filteredEmails]);

  const handleSelectEmail = (email: TravelEmail) => {
    setSelectedEmail(email);
    // Mark as read
    if (!readEmails.has(email.id)) {
      setReadEmails((prev) => new Set([...prev, email.id]));
    }
  };

  const handleRefresh = async (e?: React.MouseEvent) => {
    if (e?.shiftKey) {
      window.location.reload();
      return;
    }

    setIsRefreshing(true);
    setRefreshSuccess(false);
    await fetchEmails();
    setIsRefreshing(false);
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 2000);
    
    toast({
      title: "Aktualisiert",
      description: "Posteingang ist auf dem neuesten Stand",
      duration: 2000,
    });
  };

  useEffect(() => {
    fetchEmails();
    
    const channel = supabase
      .channel("travel_emails_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "travel_emails" },
        () => {
          fetchEmails();
          onEmailProcessed();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEmails = async () => {
    try {
      const { data, error } = await supabase
        .from("travel_emails")
        .select("id, from_address, subject, body_text, body_html, received_at, status, error_message, created_at, attachment_urls")
        .order("received_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setEmails((data as TravelEmail[]) || []);
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const reprocessEmail = async (emailId: string) => {
    setReprocessingId(emailId);
    try {
      await supabase
        .from("travel_emails")
        .update({ status: "processing", error_message: null })
        .eq("id", emailId);

      const { error } = await supabase.functions.invoke("analyze-travel-booking", {
        body: { email_id: emailId }
      });

      if (error) throw error;

      toast({
        title: "Analyse gestartet",
        description: "Die E-Mail wird erneut analysiert.",
      });

      fetchEmails();
    } catch (error: any) {
      console.error("Error reprocessing:", error);
      toast({
        title: "Fehler",
        description: error.message || "E-Mail konnte nicht erneut verarbeitet werden",
        variant: "destructive",
      });
    } finally {
      setReprocessingId(null);
    }
  };

  const toggleFilter = (filter: FilterType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (filter === "all") {
        return new Set(["all"]);
      }
      next.delete("all");
      if (next.has(filter)) {
        next.delete(filter);
        if (next.size === 0) next.add("all");
      } else {
        next.add(filter);
      }
      return next;
    });
  };

  const unreadCount = emails.filter((e) => !readEmails.has(e.id)).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
          <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-foreground">
              Reisebuchungen müssen per Mail an <strong className="font-semibold">travel@paterbrown.com</strong> geschickt werden.
            </p>
          </div>
        </div>
        
        <div className="bg-card rounded-2xl shadow-lg border p-12 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">Posteingang leer</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Leite Reisebuchungs-E-Mails an travel@paterbrown.com weiter.
          </p>
        </div>
      </div>
    );
  }

  // Email List Item Component
  const EmailListItem = ({ email, index }: { email: TravelEmail; index: number }) => {
    const status = statusConfig[email.status];
    const StatusIcon = status.icon;
    const isProcessing = email.status === "processing" || reprocessingId === email.id;
    const isSelected = selectedEmail?.id === email.id;
    const isHighlighted = index === selectedIndex;
    const isUnread = !readEmails.has(email.id);
    const provider = detectProvider(email);
    const ProviderIcon = provider?.icon;

    return (
      <div
        onClick={() => handleSelectEmail(email)}
        className={`
          relative px-4 py-3 cursor-pointer transition-all duration-150
          ${isSelected ? "bg-amber-50 border-l-2 border-l-amber-500" : "border-l-2 border-l-transparent"}
          ${isHighlighted && !isSelected ? "bg-gray-50" : ""}
          ${!isSelected && !isHighlighted ? "hover:bg-gray-50" : ""}
        `}
      >
        <div className="flex items-start gap-3">
          {/* Avatar with unread indicator */}
          <div className="relative flex-shrink-0">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
              ${isUnread ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}
            `}>
              {ProviderIcon ? (
                <ProviderIcon className="w-5 h-5" />
              ) : (
                getInitials(email.from_address)
              )}
            </div>
            {isUnread && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className={`text-sm truncate ${isUnread ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                {email.from_address.split("@")[0]}
              </span>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {formatSmartDate(email.received_at)}
              </span>
            </div>
            
            <div className={`text-sm truncate mb-1 ${isUnread ? "font-medium text-gray-900" : "text-gray-700"}`}>
              {email.subject || "(kein Betreff)"}
            </div>
            
            <div className="text-xs text-gray-500 truncate">
              {getPreviewText(email)}
            </div>

            {/* Tags row */}
            <div className="flex items-center gap-2 mt-2">
              {/* Status badge */}
              <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${status.color}`}>
                <StatusIcon className={`w-3 h-3 ${isProcessing ? "animate-spin" : ""}`} />
                {status.label}
              </div>
              
              {/* Attachment indicator */}
              {hasAttachments(email) && (
                <div className="inline-flex items-center gap-1 text-gray-400">
                  <Paperclip className="w-3 h-3" />
                </div>
              )}

              {/* Provider badge */}
              {provider && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {provider.label}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Email Detail View
  const EmailDetail = ({ email }: { email: TravelEmail }) => {
    const status = statusConfig[email.status];
    const StatusIcon = status.icon;
    const isProcessing = email.status === "processing" || reprocessingId === email.id;
    const provider = detectProvider(email);

    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {email.subject || "(kein Betreff)"}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="font-medium text-gray-900">{email.from_address}</span>
                <span>•</span>
                <span>{format(parseISO(email.received_at), "d. MMMM yyyy, HH:mm 'Uhr'", { locale: de })}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedEmail(null)}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Status & Actions Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={`${status.color} border`}>
              <StatusIcon className={`w-3.5 h-3.5 mr-1.5 ${isProcessing ? "animate-spin" : ""}`} />
              {status.label}
            </Badge>

            {provider && (
              <Badge variant="outline" className="gap-1.5">
                <provider.icon className="w-3.5 h-3.5" />
                {provider.label}
              </Badge>
            )}

            {hasAttachments(email) && (
              <Badge variant="outline" className="gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                Anhänge
              </Badge>
            )}

            <div className="flex-1" />

            {email.status === "error" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => reprocessEmail(email.id)}
                disabled={isProcessing}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                Erneut verarbeiten
              </Button>
            )}

            {email.status === "processed" && (
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <Sparkles className="w-4 h-4" />
                Buchung erstellen
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Error Message */}
          {email.error_message && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {email.error_message}
            </div>
          )}
        </div>

        {/* Email Body */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {email.body_html ? (
              <div 
                className="prose prose-sm max-w-none prose-gray"
                dangerouslySetInnerHTML={{ __html: email.body_html }}
              />
            ) : email.body_text ? (
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                {email.body_text}
              </pre>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Kein E-Mail-Inhalt verfügbar</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-220px)] flex flex-col">
      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center gap-3">
        <Mail className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-gray-700 flex-1">
          E-Mails an <strong className="text-gray-900">travel@paterbrown.com</strong> weiterleiten
        </p>
        <div className="text-xs text-gray-500">
          j/k navigieren • Enter öffnen • r aktualisieren
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="E-Mails durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
              {!activeFilters.has("all") && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {activeFilters.size}
                </Badge>
              )}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={activeFilters.has("all")}
              onCheckedChange={() => toggleFilter("all")}
            >
              Alle anzeigen
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeFilters.has("unread")}
              onCheckedChange={() => toggleFilter("unread")}
            >
              <MailOpen className="w-4 h-4 mr-2" />
              Nur ungelesen ({unreadCount})
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeFilters.has("attachments")}
              onCheckedChange={() => toggleFilter("attachments")}
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Mit Anhängen
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Anbieter</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={activeFilters.has("train")}
              onCheckedChange={() => toggleFilter("train")}
            >
              <Train className="w-4 h-4 mr-2" />
              Deutsche Bahn
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeFilters.has("hotel")}
              onCheckedChange={() => toggleFilter("hotel")}
            >
              <Hotel className="w-4 h-4 mr-2" />
              Hotels
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeFilters.has("flight")}
              onCheckedChange={() => toggleFilter("flight")}
            >
              <Plane className="w-4 h-4 mr-2" />
              Flüge
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeFilters.has("car")}
              onCheckedChange={() => toggleFilter("car")}
            >
              <Car className="w-4 h-4 mr-2" />
              Mietwagen
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Zeitraum</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={dateFilter === "all"}
              onCheckedChange={() => setDateFilter("all")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Alle
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={dateFilter === "today"}
              onCheckedChange={() => setDateFilter("today")}
            >
              Heute
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={dateFilter === "week"}
              onCheckedChange={() => setDateFilter("week")}
            >
              Letzte 7 Tage
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={dateFilter === "month"}
              onCheckedChange={() => setDateFilter("month")}
            >
              Letzte 30 Tage
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Stats */}
        <div className="text-sm text-muted-foreground">
          {filteredEmails.length} von {emails.length}
        </div>

        {/* Refresh */}
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Aktualisieren (r)"
        >
          {refreshSuccess ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          )}
        </Button>
      </div>

      {/* Split View */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Email List Panel */}
          <ResizablePanel defaultSize={selectedEmail ? 40 : 100} minSize={30}>
            <ScrollArea className="h-full" ref={listRef}>
              <div className="divide-y divide-gray-100">
                {filteredEmails.map((email, index) => (
                  <EmailListItem key={email.id} email={email} index={index} />
                ))}
                {filteredEmails.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>Keine E-Mails gefunden</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </ResizablePanel>

          {/* Detail Panel - only show when email selected */}
          {selectedEmail && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={60} minSize={40}>
                <EmailDetail email={selectedEmail} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
