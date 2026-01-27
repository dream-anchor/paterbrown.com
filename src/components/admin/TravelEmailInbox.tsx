import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isToday, isYesterday, subDays, isAfter } from "date-fns";
import { de } from "date-fns/locale";
import {
  Mail, CheckCircle2, Loader2, AlertCircle, Clock,
  RefreshCw, Inbox, Check, Paperclip, Search, X,
  Train, Hotel, Plane, Car, Filter, ChevronDown,
  MailOpen, FileText, Sparkles, ArrowRight, Calendar,
  ChevronLeft
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
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import EmailViewer, { EmailAttachment } from "./EmailViewer";

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
  pending: { icon: Clock, label: "Ausstehend", color: "bg-gray-50 text-gray-600 border-gray-200" },
  processing: { icon: Loader2, label: "Wird verarbeitet", color: "bg-blue-50 text-blue-600 border-blue-200" },
  processed: { icon: CheckCircle2, label: "Verarbeitet", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  error: { icon: AlertCircle, label: "Fehler", color: "bg-red-50 text-red-600 border-red-200" },
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

// Get sender name from email
const getSenderName = (email: string): string => {
  const parts = email.split("@")[0].split(/[._-]/);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
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
  return cleaned.substring(0, 100) + (cleaned.length > 100 ? "..." : "");
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

// Staggered animation variants
const listItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(index * 0.03, 0.3),
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1] as const
    }
  })
};

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
  const isMobile = useIsMobile();

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

  const handleSelectEmail = (email: TravelEmail) => {
    setSelectedEmail(email);
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

  // Convert TravelEmail to EmailViewer format
  const convertToEmailViewerFormat = (email: TravelEmail) => {
    const attachments: EmailAttachment[] = [];
    if (email.attachment_urls) {
      if (Array.isArray(email.attachment_urls)) {
        email.attachment_urls.forEach((url: string, index: number) => {
          attachments.push({
            id: `${email.id}-${index}`,
            file_name: url.split('/').pop() || `Anhang ${index + 1}`,
            content_type: null,
          });
        });
      }
    }

    const tags: string[] = [];
    if (email.status === "processed") tags.push("Verarbeitet");
    if (email.status === "error") tags.push("Fehler");
    const provider = detectProvider(email);
    if (provider) tags.push(provider.label);

    return {
      subject: email.subject,
      sender: {
        name: getSenderName(email.from_address),
        email: email.from_address,
      },
      date: email.received_at,
      contentHtml: email.body_html,
      contentText: email.body_text,
      attachments,
      tags,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-amber-500" />
        </motion.div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Glassmorphism Info Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-700 font-medium">
              E-Mails weiterleiten an:
            </p>
            <p className="text-amber-700 font-semibold">
              travel@paterbrown.com
            </p>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-16 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-6">
            <Inbox className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Posteingang leer</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Leite Reisebuchungs-E-Mails an travel@paterbrown.com weiter, um sie hier zu verarbeiten.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // Email List Item Component - Premium Design
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
      <motion.div
        variants={listItemVariants}
        initial="hidden"
        animate="visible"
        custom={index}
        whileHover={{ backgroundColor: "rgba(251, 191, 36, 0.04)" }}
        whileTap={{ scale: 0.995 }}
        onClick={() => handleSelectEmail(email)}
        className={cn(
          "relative px-4 py-4 cursor-pointer transition-all duration-200",
          "border-l-2",
          isSelected 
            ? "bg-gradient-to-r from-amber-50 to-transparent border-l-amber-500" 
            : "border-l-transparent hover:border-l-amber-200",
          isHighlighted && !isSelected && "bg-gray-50/80",
        )}
      >
        <div className="flex items-start gap-3">
          {/* Avatar with gradient and unread indicator */}
          <div className="relative flex-shrink-0">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold shadow-sm",
                isUnread 
                  ? "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 border border-amber-200/50" 
                  : "bg-gradient-to-br from-gray-100 to-gray-50 text-gray-500 border border-gray-200/50"
              )}
            >
              {ProviderIcon ? (
                <ProviderIcon className="w-5 h-5" />
              ) : (
                getInitials(email.from_address)
              )}
            </motion.div>
            {isUnread && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full border-2 border-white shadow-sm"
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={cn(
                "text-sm truncate",
                isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-600"
              )}>
                {getSenderName(email.from_address)}
              </span>
              <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">
                {formatSmartDate(email.received_at)}
              </span>
            </div>
            
            <div className={cn(
              "text-sm truncate mb-1.5",
              isUnread ? "font-medium text-gray-900" : "text-gray-700"
            )}>
              {email.subject || "(kein Betreff)"}
            </div>
            
            <div className="text-xs text-gray-400 truncate leading-relaxed">
              {getPreviewText(email)}
            </div>

            {/* Tags row - Premium badges */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {/* Status badge with glassmorphism */}
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border backdrop-blur-sm",
                status.color
              )}>
                <StatusIcon className={cn("w-3 h-3", isProcessing && "animate-spin")} />
                {status.label}
              </div>
              
              {/* Attachment indicator */}
              {hasAttachments(email) && (
                <div className="inline-flex items-center gap-1 text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                  <Paperclip className="w-3 h-3" />
                  <span className="text-[10px]">Anhang</span>
                </div>
              )}

              {/* Provider badge */}
              {provider && (
                <Badge variant="outline" className="text-[10px] px-2 py-0 border-gray-200 bg-white">
                  {provider.label}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <motion.div 
            layoutId="selection"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"
          />
        )}
      </motion.div>
    );
  };

  // Mobile: Full-screen detail view
  if (isMobile && selectedEmail) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed inset-0 z-50 bg-white"
      >
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedEmail(null)}
            className="rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-medium text-gray-900 truncate flex-1">
            {selectedEmail.subject || "(kein Betreff)"}
          </span>
          {selectedEmail.status === "error" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => reprocessEmail(selectedEmail.id)}
              disabled={reprocessingId === selectedEmail.id}
            >
              <RefreshCw className={cn("w-4 h-4", reprocessingId === selectedEmail.id && "animate-spin")} />
            </Button>
          )}
        </div>
        
        {/* Email Content */}
        <div className="h-[calc(100vh-60px)] overflow-auto">
          <EmailViewer
            email={convertToEmailViewerFormat(selectedEmail)}
            onCreateBooking={() => {
              toast({ title: "Coming soon", description: "Buchungserstellung folgt" });
            }}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="h-[calc(100vh-220px)] flex flex-col">
      {/* Premium Glassmorphism Info Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/50 rounded-2xl p-3.5 mb-4 flex items-center gap-3 backdrop-blur-sm shadow-sm"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0">
          <Mail className="w-4 h-4 text-white" />
        </div>
        <p className="text-sm text-gray-700 flex-1">
          E-Mails an <strong className="text-gray-900 font-semibold">travel@paterbrown.com</strong> weiterleiten
        </p>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-white/60 px-2.5 py-1 rounded-full backdrop-blur-sm border border-gray-200/50">
          <span className="font-mono">j/k</span> <span>navigieren</span>
          <span className="mx-1">•</span>
          <span className="font-mono">Enter</span> <span>öffnen</span>
        </div>
      </motion.div>

      {/* Premium Toolbar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-3 mb-4 flex-wrap"
      >
        {/* Search with glassmorphism */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="E-Mails durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl h-10 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filters Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-xl bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
              {!activeFilters.has("all") && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs bg-amber-100 text-amber-700">
                  {activeFilters.size}
                </Badge>
              )}
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200">
            <DropdownMenuLabel className="text-gray-500 text-xs uppercase tracking-wide">Status</DropdownMenuLabel>
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
              <MailOpen className="w-4 h-4 mr-2 text-gray-400" />
              Nur ungelesen ({unreadCount})
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeFilters.has("attachments")}
              onCheckedChange={() => toggleFilter("attachments")}
            >
              <Paperclip className="w-4 h-4 mr-2 text-gray-400" />
              Mit Anhängen
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-gray-500 text-xs uppercase tracking-wide">Anbieter</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={activeFilters.has("train")}
              onCheckedChange={() => toggleFilter("train")}
            >
              <Train className="w-4 h-4 mr-2 text-emerald-500" />
              Deutsche Bahn
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeFilters.has("hotel")}
              onCheckedChange={() => toggleFilter("hotel")}
            >
              <Hotel className="w-4 h-4 mr-2 text-blue-500" />
              Hotels
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeFilters.has("flight")}
              onCheckedChange={() => toggleFilter("flight")}
            >
              <Plane className="w-4 h-4 mr-2 text-purple-500" />
              Flüge
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeFilters.has("car")}
              onCheckedChange={() => toggleFilter("car")}
            >
              <Car className="w-4 h-4 mr-2 text-orange-500" />
              Mietwagen
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-gray-500 text-xs uppercase tracking-wide">Zeitraum</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={dateFilter === "all"}
              onCheckedChange={() => setDateFilter("all")}
            >
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

        {/* Stats badge */}
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
          <span className="font-medium text-gray-700">{filteredEmails.length}</span>
          <span className="text-gray-400"> / {emails.length}</span>
        </div>

        {/* Refresh with animation */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300"
            title="Aktualisieren (r)"
          >
            {refreshSuccess ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Check className="w-4 h-4 text-emerald-600" />
              </motion.div>
            ) : (
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            )}
          </Button>
        </motion.div>
      </motion.div>

      {/* Premium Split View Container */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 bg-white rounded-2xl border border-gray-200/80 shadow-xl overflow-hidden"
      >
        <ResizablePanelGroup direction="horizontal">
          {/* Email List Panel */}
          <ResizablePanel defaultSize={selectedEmail ? 40 : 100} minSize={30}>
            <ScrollArea className="h-full" ref={listRef}>
              <div className="divide-y divide-gray-100/80">
                <AnimatePresence mode="popLayout">
                  {filteredEmails.map((email, index) => (
                    <EmailListItem key={email.id} email={email} index={index} />
                  ))}
                </AnimatePresence>
                {filteredEmails.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-16 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Keine E-Mails gefunden</p>
                    <p className="text-gray-400 text-sm mt-1">Versuche andere Suchbegriffe</p>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </ResizablePanel>

          {/* Detail Panel - Premium EmailViewer */}
          <AnimatePresence>
            {selectedEmail && !isMobile && (
              <>
                <ResizableHandle withHandle className="bg-gray-100 hover:bg-amber-100 transition-colors" />
                <ResizablePanel defaultSize={60} minSize={40}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="h-full"
                  >
                    <EmailViewer
                      email={convertToEmailViewerFormat(selectedEmail)}
                      onCreateBooking={() => {
                        toast({ title: "Coming soon", description: "Buchungserstellung folgt" });
                      }}
                    />
                  </motion.div>
                </ResizablePanel>
              </>
            )}
          </AnimatePresence>
        </ResizablePanelGroup>
      </motion.div>
    </div>
  );
}
