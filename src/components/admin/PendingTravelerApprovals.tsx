import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveDialog,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogBody,
} from "@/components/ui/responsive-dialog";
import {
  UserPlus, UserCheck, X, Loader2, AlertTriangle,
  FileText, Clock, Users, ChevronRight
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

interface PendingApproval {
  id: string;
  extracted_name: string;
  extracted_first_name: string | null;
  extracted_last_name: string | null;
  best_match_name: string | null;
  best_match_score: number;
  best_match_profile_id: string | null;
  source_email_id: string | null;
  source_attachment_id: string | null;
  status: string;
  created_at: string;
}

interface TravelerProfile {
  id: string;
  first_name: string;
  last_name: string;
}

interface PendingTravelerApprovalsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved?: () => void;
}

export default function PendingTravelerApprovals({
  open,
  onOpenChange,
  onResolved,
}: PendingTravelerApprovalsProps) {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [profiles, setProfiles] = useState<TravelerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [linkProfileId, setLinkProfileId] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [approvalsRes, profilesRes] = await Promise.all([
        supabase
          .from("pending_traveler_approvals" as any)
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
        supabase
          .from("traveler_profiles")
          .select("id, first_name, last_name")
          .order("last_name", { ascending: true }),
      ]);

      if (approvalsRes.error) throw approvalsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setApprovals((approvalsRes.data as any[]) || []);
      setProfiles((profilesRes.data as TravelerProfile[]) || []);
    } catch (error: any) {
      console.error("Error fetching pending approvals:", error);
      toast({
        title: "Fehler",
        description: "Ausstehende Genehmigungen konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProfile = async (approval: PendingApproval) => {
    setProcessingId(approval.id);
    try {
      const firstName = approval.extracted_first_name || approval.extracted_name.split(" ")[0] || "";
      const nameParts = approval.extracted_name.trim().split(/\s+/);
      const lastName = approval.extracted_last_name || (nameParts.length > 1 ? nameParts.pop() : "") || "";

      // Create profile
      const { data: newProfile, error: profileError } = await supabase
        .from("traveler_profiles")
        .insert({
          first_name: firstName,
          last_name: lastName,
          auto_created: false,
        })
        .select("id")
        .single();

      if (profileError) throw profileError;

      // Update approval status
      const { error: updateError } = await supabase
        .from("pending_traveler_approvals" as any)
        .update({
          status: "approved",
          resolved_profile_id: newProfile.id,
          resolved_at: new Date().toISOString(),
        } as any)
        .eq("id", approval.id);

      if (updateError) throw updateError;

      setApprovals((prev) => prev.filter((a) => a.id !== approval.id));
      toast({
        title: "Profil erstellt",
        description: `${firstName} ${lastName} wurde als neues Profil angelegt`,
      });
      onResolved?.();
    } catch (error: any) {
      console.error("Error creating profile:", error);
      toast({
        title: "Fehler",
        description: "Profil konnte nicht erstellt werden",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleLinkProfile = async (approval: PendingApproval) => {
    const profileId = linkProfileId[approval.id];
    if (!profileId) return;

    setProcessingId(approval.id);
    try {
      const profile = profiles.find((p) => p.id === profileId);
      if (!profile) throw new Error("Profil nicht gefunden");

      const canonicalName = `${profile.first_name} ${profile.last_name}`;

      // Replace name in booking arrays
      const { error: rpcError } = await supabase.rpc(
        "replace_traveler_name_in_arrays",
        {
          old_name: approval.extracted_name,
          new_name: canonicalName,
        }
      );

      if (rpcError) {
        console.error("RPC error (non-critical):", rpcError);
      }

      // Update approval status
      const { error: updateError } = await supabase
        .from("pending_traveler_approvals" as any)
        .update({
          status: "linked",
          resolved_profile_id: profileId,
          resolved_at: new Date().toISOString(),
        } as any)
        .eq("id", approval.id);

      if (updateError) throw updateError;

      // Also update attachments with the provisional name
      await supabase
        .from("travel_attachments")
        .update({ traveler_name: canonicalName })
        .eq("traveler_name", approval.extracted_name);

      setApprovals((prev) => prev.filter((a) => a.id !== approval.id));
      toast({
        title: "Zugeordnet",
        description: `"${approval.extracted_name}" → ${canonicalName}`,
      });
      onResolved?.();
    } catch (error: any) {
      console.error("Error linking profile:", error);
      toast({
        title: "Fehler",
        description: "Zuordnung fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (approval: PendingApproval) => {
    setProcessingId(approval.id);
    try {
      const { error } = await supabase
        .from("pending_traveler_approvals" as any)
        .update({
          status: "dismissed",
          resolved_at: new Date().toISOString(),
        } as any)
        .eq("id", approval.id);

      if (error) throw error;

      setApprovals((prev) => prev.filter((a) => a.id !== approval.id));
      toast({
        title: "Verworfen",
        description: `"${approval.extracted_name}" wurde verworfen`,
      });
      onResolved?.();
    } catch (error: any) {
      console.error("Error dismissing approval:", error);
      toast({
        title: "Fehler",
        description: "Verwerfen fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return "text-amber-600";
    if (score >= 40) return "text-orange-500";
    return "text-gray-400";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 60) return "bg-amber-500";
    if (score >= 40) return "bg-orange-400";
    return "bg-gray-300";
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} className="sm:max-w-2xl">
      <ResponsiveDialogHeader className="px-6 pt-6 pb-2">
        <ResponsiveDialogTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-500" />
          Unbekannte Reisende
        </ResponsiveDialogTitle>
        <ResponsiveDialogDescription className="text-gray-500">
          Diese Namen wurden aus Dokumenten extrahiert, konnten aber keinem Profil zugeordnet werden.
        </ResponsiveDialogDescription>
      </ResponsiveDialogHeader>

      <ResponsiveDialogBody className="px-6 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : approvals.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Keine ausstehenden Genehmigungen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {approvals.map((approval) => {
              const isProcessing = processingId === approval.id;

              return (
                <div
                  key={approval.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {approval.extracted_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {format(parseISO(approval.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDismiss(approval)}
                      disabled={isProcessing}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      title="Verwerfen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Best Match Info */}
                  {approval.best_match_name && approval.best_match_score > 0 && (
                    <div className="bg-amber-50/50 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Bester Treffer</span>
                        <span className={`text-xs font-bold ${getScoreColor(approval.best_match_score)}`}>
                          {approval.best_match_score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {approval.best_match_name}
                        </span>
                        <ChevronRight className="w-3 h-3 text-gray-300" />
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getScoreBarColor(approval.best_match_score)}`}
                          style={{ width: `${approval.best_match_score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Create New Profile */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateProfile(approval)}
                      disabled={isProcessing}
                      className="gap-1.5 text-xs flex-1"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5" />
                      )}
                      Neues Profil
                    </Button>

                    {/* Link to Existing Profile */}
                    <div className="flex items-center gap-1.5 flex-[2]">
                      <Select
                        value={linkProfileId[approval.id] || ""}
                        onValueChange={(value) =>
                          setLinkProfileId((prev) => ({ ...prev, [approval.id]: value }))
                        }
                      >
                        <SelectTrigger className="h-9 text-xs flex-1 bg-gray-50/50 border-gray-200">
                          <SelectValue placeholder="Profil zuordnen..." />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.first_name} {profile.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleLinkProfile(approval)}
                        disabled={isProcessing || !linkProfileId[approval.id]}
                        className="gap-1.5 text-xs whitespace-nowrap"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Zuordnen
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ResponsiveDialogBody>
    </ResponsiveDialog>
  );
}
