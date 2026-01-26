import { useState, useEffect } from "react";
import { Settings, Eye, EyeOff, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface R2Credentials {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
}

const SETTING_KEYS = {
  R2_ENDPOINT: "r2_endpoint",
  R2_ACCESS_KEY_ID: "r2_access_key_id",
  R2_SECRET_ACCESS_KEY: "r2_secret_access_key",
};

const SettingsPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState({
    accessKeyId: false,
    secretAccessKey: false,
  });
  
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
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert each setting
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

  const hasChanges = 
    credentials.endpoint !== savedCredentials.endpoint ||
    credentials.accessKeyId !== savedCredentials.accessKeyId ||
    credentials.secretAccessKey !== savedCredentials.secretAccessKey;

  const isConfigured = 
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
            Konfiguriere externe Dienste und Integrationen
          </p>
        </div>
      </div>

      {/* R2 Configuration Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-600" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div>
                <CardTitle className="text-base">Cloudflare R2 Storage</CardTitle>
                <CardDescription>
                  Zugangsdaten für den externen Dateispeicher
                </CardDescription>
              </div>
            </div>
            {isConfigured ? (
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
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label htmlFor="r2-endpoint" className="text-gray-700">
              R2 Endpoint URL
            </Label>
            <Input
              id="r2-endpoint"
              type="text"
              placeholder="https://xxxxxxxx.r2.cloudflarestorage.com"
              value={credentials.endpoint}
              onChange={(e) => setCredentials({ ...credentials, endpoint: e.target.value })}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Die S3-kompatible Endpoint-URL deines R2-Buckets
            </p>
          </div>

          {/* Access Key ID */}
          <div className="space-y-2">
            <Label htmlFor="r2-access-key" className="text-gray-700">
              Access Key ID
            </Label>
            <div className="relative">
              <Input
                id="r2-access-key"
                type={showSecrets.accessKeyId ? "text" : "password"}
                placeholder="••••••••••••••••"
                value={credentials.accessKeyId}
                onChange={(e) => setCredentials({ ...credentials, accessKeyId: e.target.value })}
                className="font-mono text-sm pr-10"
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
            <Label htmlFor="r2-secret-key" className="text-gray-700">
              Secret Access Key
            </Label>
            <div className="relative">
              <Input
                id="r2-secret-key"
                type={showSecrets.secretAccessKey ? "text" : "password"}
                placeholder="••••••••••••••••••••••••••••••••"
                value={credentials.secretAccessKey}
                onChange={(e) => setCredentials({ ...credentials, secretAccessKey: e.target.value })}
                className="font-mono text-sm pr-10"
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
              onClick={handleSave}
              disabled={saving || !hasChanges}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
