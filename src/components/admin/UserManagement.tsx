import { useState, useEffect } from "react";
import { Users, RefreshCw, Key, CheckCircle2, AlertCircle, Loader2, Shield, UserCheck, UserX, Link2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveDialog,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface ProfileWithUser {
  id: string;
  first_name: string;
  last_name: string;
  user_id: string | null;
  phone_number: string | null;
  matchedEmail?: string;
}

interface SyncResults {
  synced: { profileId: string; name: string; userId: string; email: string }[];
  alreadyLinked: { profileId: string; name: string; userId: string }[];
  noMatch: { profileId: string; name: string }[];
  errors: string[];
}

const UserManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [profiles, setProfiles] = useState<ProfileWithUser[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<SyncResults | null>(null);
  
  // Password reset modal state
  const [passwordModal, setPasswordModal] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  }>({ open: false, userId: "", userName: "" });
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      // Load profiles
      const { data: profileData, error: profileError } = await supabase
        .from("traveler_profiles")
        .select("id, first_name, last_name, user_id, phone_number")
        .order("last_name");

      if (profileError) throw profileError;
      setProfiles(profileData || []);

    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("admin-sync-profiles");

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Sync fehlgeschlagen");
      }

      setSyncResults(data.results);
      setAuthUsers(data.allUsers || []);

      // Reload profiles to show updated links
      await loadData();

      toast({
        title: "Sync abgeschlossen",
        description: `${data.results.synced.length} Profile verknüpft, ${data.results.alreadyLinked.length} bereits verbunden.`,
      });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const openPasswordModal = (userId: string, userName: string) => {
    setPasswordModal({ open: true, userId, userName });
    setNewPassword("");
    setShowPassword(false);
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Ungültiges Passwort",
        description: "Das Passwort muss mindestens 6 Zeichen lang sein.",
        variant: "destructive",
      });
      return;
    }

    setResettingPassword(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-update-password", {
        body: { userId: passwordModal.userId, newPassword },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Passwort konnte nicht geändert werden");
      }

      toast({
        title: "Passwort geändert",
        description: `Das Passwort für ${passwordModal.userName} wurde erfolgreich geändert.`,
      });

      setPasswordModal({ open: false, userId: "", userName: "" });
      setNewPassword("");
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Passwort konnte nicht geändert werden",
        variant: "destructive",
      });
    } finally {
      setResettingPassword(false);
    }
  };

  // Get user email for a profile
  const getUserEmail = (userId: string | null): string | null => {
    if (!userId) return null;
    const user = authUsers.find(u => u.id === userId);
    return user?.email || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Lade Benutzer...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Benutzerverwaltung</h3>
              <p className="text-sm text-gray-500">Auth-Accounts mit Profilen synchronisieren</p>
            </div>
          </div>
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Sync starten
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <div className="px-6 py-4 bg-purple-50/50 border-b border-gray-100">
        <div className="text-sm text-purple-800">
          <p className="font-medium mb-1">Was passiert beim Sync:</p>
          <ul className="list-disc list-inside text-xs space-y-0.5 text-purple-700">
            <li>Profile werden mit Auth-Accounts anhand der E-Mail/Namen verknüpft</li>
            <li>Bereits verknüpfte Profile bleiben unverändert</li>
            <li>Avatare und Namen werden dann beim Voting korrekt angezeigt</li>
          </ul>
        </div>
      </div>

      {/* Sync Results */}
      {syncResults && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Sync-Ergebnis:</h4>
          
          {syncResults.synced.length > 0 && (
            <div className="flex items-start gap-2 text-green-700 text-sm">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">{syncResults.synced.length} Profile verknüpft:</span>
                <ul className="mt-1 text-xs space-y-0.5">
                  {syncResults.synced.map(s => (
                    <li key={s.profileId}>
                      {s.name} → {s.email}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {syncResults.alreadyLinked.length > 0 && (
            <div className="flex items-start gap-2 text-blue-700 text-sm">
              <UserCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{syncResults.alreadyLinked.length} Profile bereits verknüpft</span>
            </div>
          )}

          {syncResults.noMatch.length > 0 && (
            <div className="flex items-start gap-2 text-amber-700 text-sm">
              <UserX className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">{syncResults.noMatch.length} ohne Match:</span>
                <ul className="mt-1 text-xs space-y-0.5">
                  {syncResults.noMatch.map(n => (
                    <li key={n.profileId}>{n.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {syncResults.errors.length > 0 && (
            <div className="flex items-start gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">{syncResults.errors.length} Fehler</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User List */}
      <div className="divide-y divide-gray-100">
        {profiles.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500 text-sm">
            Keine Profile vorhanden
          </div>
        ) : (
          profiles.map((profile) => {
            const isCurrentUser = profile.user_id === currentUserId;
            const isLinked = !!profile.user_id;
            const email = getUserEmail(profile.user_id);
            const fullName = `${profile.first_name} ${profile.last_name}`;

            return (
              <div
                key={profile.id}
                className={`px-6 py-4 flex items-center justify-between ${
                  isCurrentUser ? "bg-amber-50/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isLinked 
                      ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white" 
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </div>
                  
                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{fullName}</span>
                      {isCurrentUser && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                          Du
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {isLinked ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          {email || "Verknüpft"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Nicht verknüpft</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isLinked && !isCurrentUser && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPasswordModal(profile.user_id!, fullName)}
                      className="gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Passwort</span>
                    </Button>
                  )}
                  {isCurrentUser && (
                    <div className="flex items-center gap-1.5 text-amber-600 text-xs">
                      <Shield className="w-3.5 h-3.5" />
                      Admin
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Password Reset Modal */}
      <ResponsiveDialog
        open={passwordModal.open}
        onOpenChange={(open) => setPasswordModal({ ...passwordModal, open })}
      >
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Passwort zurücksetzen</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Neues Passwort für <strong>{passwordModal.userName}</strong> vergeben
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-gray-700">Neues Passwort</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mindestens 6 Zeichen"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Das neue Passwort wird sofort aktiv. Der Benutzer muss sich neu anmelden.
              </p>
            </div>
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setPasswordModal({ open: false, userId: "", userName: "" })}
            disabled={resettingPassword}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handlePasswordReset}
            disabled={resettingPassword || newPassword.length < 6}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {resettingPassword ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Passwort setzen
              </>
            )}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialog>
    </div>
  );
};

export default UserManagement;
