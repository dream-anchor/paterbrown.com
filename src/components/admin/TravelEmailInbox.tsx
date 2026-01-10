import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import {
  Mail, CheckCircle2, Loader2, AlertCircle, Clock,
  RefreshCw, ChevronRight, Inbox, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface TravelEmail {
  id: string;
  from_address: string;
  subject: string | null;
  received_at: string;
  status: "pending" | "processing" | "processed" | "error";
  error_message: string | null;
  created_at: string;
}

interface Props {
  onEmailProcessed: () => void;
}

const statusConfig = {
  pending: { icon: Clock, label: "Ausstehend", color: "bg-gray-100 text-gray-600 border-gray-200" },
  processing: { icon: Loader2, label: "Wird verarbeitet", color: "bg-blue-50 text-blue-600 border-blue-100" },
  processed: { icon: CheckCircle2, label: "Verarbeitet", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  error: { icon: AlertCircle, label: "Fehler", color: "bg-red-50 text-red-600 border-red-100" },
};

export default function TravelEmailInbox({ onEmailProcessed }: Props) {
  const [emails, setEmails] = useState<TravelEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Smart refresh - no page reload!
  const handleRefresh = async (e?: React.MouseEvent) => {
    // Shift+Click = Force hard reload for edge cases
    if (e?.shiftKey) {
      window.location.reload();
      return;
    }

    setIsRefreshing(true);
    setRefreshSuccess(false);
    
    await fetchEmails();
    
    setIsRefreshing(false);
    setRefreshSuccess(true);
    
    // Reset success state after animation
    setTimeout(() => setRefreshSuccess(false), 2000);
    
    toast({
      title: "Aktualisiert",
      description: "Posteingang ist auf dem neuesten Stand",
      duration: 2000,
    });
  };

  useEffect(() => {
    fetchEmails();
    
    // Set up realtime subscription
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
        .select("id, from_address, subject, received_at, status, error_message, created_at")
        .order("received_at", { ascending: false })
        .limit(50);

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
      // Reset status to pending
      await supabase
        .from("travel_emails")
        .update({ status: "processing", error_message: null })
        .eq("id", emailId);

      // Call the analyze function
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-12 text-center">
        <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Posteingang leer
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Leite Reisebuchungs-E-Mails an die konfigurierte Adresse weiter, um sie automatisch zu verarbeiten.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          {emails.length} E-Mail{emails.length !== 1 ? "s" : ""}
        </h3>
        <Button 
          variant="apple" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="rounded-full"
          title="Shift+Klick für Hard Reload"
        >
          {refreshSuccess ? (
            <Check className="w-4 h-4 mr-2 text-emerald-600" />
          ) : (
            <RefreshCw className={`w-4 h-4 mr-2 text-gray-600 ${isRefreshing ? "animate-spin" : ""}`} />
          )}
          <span className="text-gray-700">
            {isRefreshing ? "Lädt..." : refreshSuccess ? "Aktualisiert" : "Aktualisieren"}
          </span>
        </Button>
      </div>

      {/* Email List */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden divide-y divide-gray-100">
        {emails.map((email) => {
          const status = statusConfig[email.status];
          const StatusIcon = status.icon;
          const isProcessing = email.status === "processing" || reprocessingId === email.id;

          return (
            <div
              key={email.id}
              className="p-5 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${status.color} border shadow-sm`}>
                  <StatusIcon className={`w-5 h-5 ${isProcessing ? "animate-spin" : ""}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-gray-900 truncate tracking-tight">
                        {email.subject || "(kein Betreff)"}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {email.from_address}
                      </div>
                    </div>
                    <Badge variant="outline" className={`${status.color} border`}>
                      {status.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-400">
                      {format(parseISO(email.received_at), "d. MMM yyyy, HH:mm", { locale: de })}
                    </div>

                    {email.status === "error" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reprocessEmail(email.id)}
                        disabled={isProcessing}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full font-medium"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-1.5" />
                        )}
                        Erneut verarbeiten
                      </Button>
                    )}
                  </div>

                  {email.error_message && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                      {email.error_message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}