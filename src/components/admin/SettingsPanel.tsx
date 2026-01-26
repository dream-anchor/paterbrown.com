import { useState, useEffect } from "react";
import { Settings, Eye, EyeOff, Save, CheckCircle2, AlertCircle, Loader2, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface R2Credentials {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const SETTING_KEYS = {
  R2_ENDPOINT: "r2_endpoint",
  R2_ACCESS_KEY_ID: "r2_access_key_id",
  R2_SECRET_ACCESS_KEY: "r2_secret_access_key",
};

interface SettingsPanelProps {
  isAdmin?: boolean;
}

const SettingsPanel = ({ isAdmin = false }: SettingsPanelProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showSecrets, setShowSecrets] = useState({
    accessKeyId: false,
    secretAccessKey: false,
  });
  
  // User profile state
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [savedProfile, setSavedProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  
  // R2 credentials state (admin only)
  const [credentials, setCredentials] = useState<R2Credentials>({
    endpoint: "",
    accessKeyId: "",
    secretAccessKey: "",
  });
  const [savedCredentials, setSavedCredentials] = useState<R2Credentials>({
    endpoint: "",
    accessKeyId: "",
    secretAccessKey: "",
  });

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Load user profile from traveler_profiles
        const { data: profileData } = await supabase
          .from("traveler_profiles")
          .select("first_name, last_name, phone_number")
          .eq("user_id", user.id)
          .maybeSingle();

        const userProfile: UserProfile = {
          firstName: profileData?.first_name || "",
          lastName: profileData?.last_name || "",
          email: user.email || "",
          phone: profileData?.phone_number || "",
        };
        setProfile(userProfile);
        setSavedProfile(userProfile);

        // Load R2 settings (admin only)
        if (isAdmin) {
          const { data, error } = await supabase
            .from("admin_settings")
            .select("setting_key, setting_value")
            .in("setting_key", Object.values(SETTING_KEYS));

          if (error) throw error;

          const settings: R2Credentials = {
            endpoint: "",
            accessKeyId: "",
            secretAccessKey: "",
          };

          data?.forEach((row) => {
            if (row.setting_key === SETTING_KEYS.R2_ENDPOINT) {
              settings.endpoint = row.setting_value;
            } else if (row.setting_key === SETTING_KEYS.R2_ACCESS_KEY_ID) {
              settings.accessKeyId = row.setting_value;
            } else if (row.setting_key === SETTING_KEYS.R2_SECRET_ACCESS_KEY) {
              settings.secretAccessKey = row.setting_value;
            }
          });

          setCredentials(settings);
          setSavedCredentials(settings);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "Fehler",
          description: "Einstellungen konnten nicht geladen werden.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast, isAdmin]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

      // Upsert traveler profile
      const { error } = await supabase
        .from("traveler_profiles")
        .upsert({
          user_id: user.id,
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone_number: profile.phone || null,
        }, { onConflict: "user_id" });

      if (error) throw error;

      setSavedProfile({ ...profile });
      
      toast({
        title: "Gespeichert",
        description: "Dein Profil wurde aktualisiert.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Fehler",
        description: "Profil konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveR2 = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        { key: SETTING_KEYS.R2_ENDPOINT, value: credentials.endpoint },
        { key: SETTING_KEYS.R2_ACCESS_KEY_ID, value: credentials.accessKeyId },
        { key: SETTING_KEYS.R2_SECRET_ACCESS_KEY, value: credentials.secretAccessKey },
      ];

      for (const setting of settingsToSave) {
        if (setting.value) {
          const { error } = await supabase
            .from("admin_settings")
            .upsert(
              { setting_key: setting.key, setting_value: setting.value },
              { onConflict: "setting_key" }
            );

          if (error) throw error;
        }
      }

      setSavedCredentials({ ...credentials });
      
      toast({
        title: "Gespeichert",
        description: "R2-Zugangsdaten wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasProfileChanges = 
    profile.firstName !== savedProfile.firstName ||
    profile.lastName !== savedProfile.lastName ||
    profile.phone !== savedProfile.phone;

  const hasR2Changes = 
    credentials.endpoint !== savedCredentials.endpoint ||
    credentials.accessKeyId !== savedCredentials.accessKeyId ||
    credentials.secretAccessKey !== savedCredentials.secretAccessKey;

  const isR2Configured = 
    savedCredentials.endpoint && 
    savedCredentials.accessKeyId && 
    savedCredentials.secretAccessKey;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-amber-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Lade Einstellungen...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Einstellungen</h2>
          <p className="text-sm text-gray-500">
            {isAdmin ? "Profil und Admin-Konfiguration" : "Dein Profil bearbeiten"}
          </p>
        </div>
      </div>

      {/* User Profile Card - For all users */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Mein Profil</h3>
              <p className="text-sm text-gray-500">Deine persönlichen Daten</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5 bg-white">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                Vorname
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Max"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Nachname
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Mustermann"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              E-Mail
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400">
              E-Mail-Adresse kann nicht geändert werden
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefon
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+49 123 456789"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile || !hasProfileChanges}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Profil speichern
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* R2 Configuration Card - Admin only */}
      {isAdmin && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-600" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Cloudflare R2 Storage</h3>
                  <p className="text-sm text-gray-500">
                    Zugangsdaten für den externen Dateispeicher
                  </p>
                </div>
              </div>
              {isR2Configured ? (
                <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Konfiguriert
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Nicht konfiguriert
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-5 space-y-5 bg-white">
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">Speicherorte:</p>
              <ul className="list-disc list-inside text-xs space-y-0.5 text-blue-700">
                <li>Picks → <code className="bg-blue-100 px-1 rounded">picks/dateiname.jpg</code></li>
                <li>Dokumente → <code className="bg-blue-100 px-1 rounded">documents/dateiname.pdf</code></li>
              </ul>
              <p className="mt-2 text-xs text-blue-600">
                Public URL: <code className="bg-blue-100 px-1 rounded">https://pub-4061a33a9b314588bf9fc24f750ecf89.r2.dev</code>
              </p>
            </div>

            {/* Endpoint URL */}
            <div className="space-y-2">
              <Label htmlFor="r2-endpoint" className="text-sm font-medium text-gray-700">
                R2 Endpoint URL
              </Label>
              <Input
                id="r2-endpoint"
                type="text"
                placeholder="https://xxxxxxxx.r2.cloudflarestorage.com"
                value={credentials.endpoint}
                onChange={(e) => setCredentials({ ...credentials, endpoint: e.target.value })}
                className="font-mono text-sm bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-500">
                Die S3-kompatible Endpoint-URL deines R2-Buckets
              </p>
            </div>

            {/* Access Key ID */}
            <div className="space-y-2">
              <Label htmlFor="r2-access-key" className="text-sm font-medium text-gray-700">
                Access Key ID
              </Label>
              <div className="relative">
                <Input
                  id="r2-access-key"
                  type={showSecrets.accessKeyId ? "text" : "password"}
                  placeholder="••••••••••••••••"
                  value={credentials.accessKeyId}
                  onChange={(e) => setCredentials({ ...credentials, accessKeyId: e.target.value })}
                  className="font-mono text-sm pr-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets({ ...showSecrets, accessKeyId: !showSecrets.accessKeyId })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showSecrets.accessKeyId ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Secret Access Key */}
            <div className="space-y-2">
              <Label htmlFor="r2-secret-key" className="text-sm font-medium text-gray-700">
                Secret Access Key
              </Label>
              <div className="relative">
                <Input
                  id="r2-secret-key"
                  type={showSecrets.secretAccessKey ? "text" : "password"}
                  placeholder="••••••••••••••••••••••••••••••••"
                  value={credentials.secretAccessKey}
                  onChange={(e) => setCredentials({ ...credentials, secretAccessKey: e.target.value })}
                  className="font-mono text-sm pr-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets({ ...showSecrets, secretAccessKey: !showSecrets.secretAccessKey })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showSecrets.secretAccessKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Deine Zugangsdaten werden verschlüsselt in der Datenbank gespeichert
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <Button
                onClick={handleSaveR2}
                disabled={saving || !hasR2Changes}
                className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Zugangsdaten speichern
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
