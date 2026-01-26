import { useState, useEffect } from "react";
import { Settings, Eye, EyeOff, Save, CheckCircle2, AlertCircle, Loader2, User, Mail, Phone, AlertTriangle, ArrowRightLeft, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { resizeImage, generateFilePaths } from "@/lib/imageResizer";
import UserManagement from "./UserManagement";
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

interface MigrationStatus {
  isRunning: boolean;
  progress: number;
  currentFile: string;
  total: number;
  migrated: number;
  skipped: number;
  errors: string[];
  completed: boolean;
}

interface RetrofitStatus {
  isRunning: boolean;
  progress: number;
  currentImage: string;
  total: number;
  thumbnailsCreated: number;
  previewsCreated: number;
  skipped: number;
  errors: string[];
  completed: boolean;
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
  
  // Migration state
  const [migration, setMigration] = useState<MigrationStatus>({
    isRunning: false,
    progress: 0,
    currentFile: "",
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: [],
    completed: false,
  });
  
  // Retrofit state
  const [retrofit, setRetrofit] = useState<RetrofitStatus>({
    isRunning: false,
    progress: 0,
    currentImage: "",
    total: 0,
    thumbnailsCreated: 0,
    previewsCreated: 0,
    skipped: 0,
    errors: [],
    completed: false,
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

  const handleMigration = async () => {
    if (!isR2Configured) {
      toast({
        title: "R2 nicht konfiguriert",
        description: "Bitte zuerst die R2-Zugangsdaten eingeben und speichern.",
        variant: "destructive",
      });
      return;
    }

    setMigration({
      isRunning: true,
      progress: 10,
      currentFile: "Starte Migration...",
      total: 0,
      migrated: 0,
      skipped: 0,
      errors: [],
      completed: false,
    });

    try {
      const { data, error } = await supabase.functions.invoke("migrate-legacy-files");

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || "Migration fehlgeschlagen");
      }

      setMigration({
        isRunning: false,
        progress: 100,
        currentFile: "",
        total: data.total || 0,
        migrated: data.migrated || 0,
        skipped: data.skipped || 0,
        errors: data.errors || [],
        completed: true,
      });

      toast({
        title: "Migration abgeschlossen",
        description: `${data.migrated} Dateien migriert, ${data.skipped} übersprungen.`,
      });
    } catch (error) {
      console.error("Migration error:", error);
      setMigration(prev => ({
        ...prev,
        isRunning: false,
        errors: [error instanceof Error ? error.message : "Unbekannter Fehler"],
      }));
      toast({
        title: "Migration fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  };

  // Retrofit: Generate missing thumbnails and previews for existing images
  const handleRetrofit = async () => {
    if (!isR2Configured) {
      toast({
        title: "R2 nicht konfiguriert",
        description: "Bitte zuerst die R2-Zugangsdaten eingeben und speichern.",
        variant: "destructive",
      });
      return;
    }

    setRetrofit({
      isRunning: true,
      progress: 0,
      currentImage: "Lade Bilder...",
      total: 0,
      thumbnailsCreated: 0,
      previewsCreated: 0,
      skipped: 0,
      errors: [],
      completed: false,
    });

    try {
      // Fetch all images - we'll regenerate ALL as WebP and clean up old formats
      const { data: images, error } = await supabase
        .from("images")
        .select("id, file_name, file_path, thumbnail_url, preview_url");

      if (error) throw error;

      // Filter: images that need processing (missing WebP versions OR have old JPEG/PNG versions)
      const imagesToProcess = (images || []).filter(img => {
        const hasNoThumbnail = !img.thumbnail_url;
        const hasNoPreview = !img.preview_url;
        const hasOldThumbnail = img.thumbnail_url && !img.thumbnail_url.endsWith('.webp');
        const hasOldPreview = img.preview_url && !img.preview_url.endsWith('.webp');
        return hasNoThumbnail || hasNoPreview || hasOldThumbnail || hasOldPreview;
      });
      
      const total = imagesToProcess.length;

      if (total === 0) {
        setRetrofit(prev => ({
          ...prev,
          isRunning: false,
          completed: true,
          currentImage: "",
        }));
        toast({
          title: "Keine Bilder zu verarbeiten",
          description: "Alle Bilder haben bereits optimierte WebP-Versionen.",
        });
        return;
      }

      setRetrofit(prev => ({ ...prev, total }));

      let thumbnailsCreated = 0;
      let previewsCreated = 0;
      let skipped = 0;
      let cleanedUp = 0;
      const errors: string[] = [];
      
      // Helper to check if URL is an old format that needs cleanup
      const isOldFormat = (url: string | null): boolean => {
        if (!url) return false;
        const lower = url.toLowerCase();
        return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png');
      };

      for (let i = 0; i < imagesToProcess.length; i++) {
        const image = imagesToProcess[i];
        
        setRetrofit(prev => ({
          ...prev,
          progress: Math.round(((i + 1) / total) * 100),
          currentImage: image.file_name,
        }));

        try {
          // Check what needs to be done for this image
          const needsNewThumbnail = !image.thumbnail_url || isOldFormat(image.thumbnail_url);
          const needsNewPreview = !image.preview_url || isOldFormat(image.preview_url);
          
          // Skip if both are already WebP
          if (!needsNewThumbnail && !needsNewPreview) {
            skipped++;
            continue;
          }

          // Fetch the original image
          const response = await fetch(image.file_path);
          if (!response.ok) {
            errors.push(`Konnte ${image.file_name} nicht laden`);
            continue;
          }

          const blob = await response.blob();
          const file = new File([blob], image.file_name, { type: blob.type || "image/jpeg" });

          const paths = generateFilePaths(image.file_name, "picks");
          const updates: { thumbnail_url?: string; preview_url?: string } = {};
          const oldFilesToDelete: string[] = [];

          // Generate thumbnail if needed (missing or old format)
          if (needsNewThumbnail) {
            // Store old URL for cleanup
            if (image.thumbnail_url && isOldFormat(image.thumbnail_url)) {
              oldFilesToDelete.push(image.thumbnail_url);
            }
            
            const thumbnailBlob = await resizeImage(file, 400, 0.75);
            
            const { data: presignedData } = await supabase.functions.invoke("get-presigned-url", {
              body: {
                files: [{ fileName: "thumbnail.webp", contentType: "image/webp", folder: "picks", customPath: paths.thumbnailPath }]
              }
            });

            if (presignedData?.success) {
              const uploadRes = await fetch(presignedData.urls[0].uploadUrl, {
                method: "PUT",
                headers: { 
                  "Content-Type": "image/webp",
                  "Cache-Control": "public, max-age=31536000, immutable"
                },
                body: thumbnailBlob,
              });

              if (uploadRes.ok) {
                updates.thumbnail_url = presignedData.urls[0].publicUrl;
                thumbnailsCreated++;
              }
            }
          }

          // Generate preview if needed (missing or old format)
          if (needsNewPreview) {
            // Store old URL for cleanup
            if (image.preview_url && isOldFormat(image.preview_url)) {
              oldFilesToDelete.push(image.preview_url);
            }
            
            const previewBlob = await resizeImage(file, 1600, 0.8);
            
            const { data: presignedData } = await supabase.functions.invoke("get-presigned-url", {
              body: {
                files: [{ fileName: "preview.webp", contentType: "image/webp", folder: "picks", customPath: paths.previewPath }]
              }
            });

            if (presignedData?.success) {
              const uploadRes = await fetch(presignedData.urls[0].uploadUrl, {
                method: "PUT",
                headers: { 
                  "Content-Type": "image/webp",
                  "Cache-Control": "public, max-age=31536000, immutable"
                },
                body: previewBlob,
              });

              if (uploadRes.ok) {
                updates.preview_url = presignedData.urls[0].publicUrl;
                previewsCreated++;
              }
            }
          }

          // Update database with new URLs FIRST (so we don't lose reference)
          if (Object.keys(updates).length > 0) {
            await supabase
              .from("images")
              .update(updates)
              .eq("id", image.id);
            
            // CLEANUP: Delete old JPEG/PNG files from R2 after successful DB update
            if (oldFilesToDelete.length > 0) {
              try {
                await supabase.functions.invoke("delete-files", {
                  body: { fileKeys: oldFilesToDelete }
                });
                cleanedUp += oldFilesToDelete.length;
                console.log(`Cleaned up ${oldFilesToDelete.length} old files for ${image.file_name}`);
              } catch (cleanupError) {
                console.warn(`Failed to cleanup old files for ${image.file_name}:`, cleanupError);
                // Don't fail the whole process for cleanup errors
              }
            }
          } else {
            skipped++;
          }

        } catch (imgError) {
          console.error(`Error processing ${image.file_name}:`, imgError);
          errors.push(`${image.file_name}: ${imgError instanceof Error ? imgError.message : "Fehler"}`);
        }

        // Update progress
        setRetrofit(prev => ({
          ...prev,
          thumbnailsCreated,
          previewsCreated,
          skipped,
          errors,
        }));
      }

      setRetrofit(prev => ({
        ...prev,
        isRunning: false,
        completed: true,
        currentImage: "",
      }));

      toast({
        title: "Retrofit abgeschlossen",
        description: `${thumbnailsCreated} Thumbnails, ${previewsCreated} Previews erstellt. ${cleanedUp > 0 ? `${cleanedUp} alte Dateien bereinigt.` : ''}`,
      });

    } catch (error) {
      console.error("Retrofit error:", error);
      setRetrofit(prev => ({
        ...prev,
        isRunning: false,
        errors: [error instanceof Error ? error.message : "Unbekannter Fehler"],
      }));
      toast({
        title: "Retrofit fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
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

      {/* User Management - Admin only */}
      {isAdmin && <UserManagement />}

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

          {/* Migration Section */}
          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <ArrowRightLeft className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Legacy-Dateien migrieren</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verschiebt alle bestehenden Dateien von Supabase Storage nach R2
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-1">Achtung!</p>
                  <p>Diese Aktion lädt alle Dateien von Supabase herunter und zu R2 hoch. Nach erfolgreicher Migration werden die alten Dateien aus Supabase gelöscht.</p>
                </div>
              </div>
            </div>

            {/* Migration Status */}
            {migration.isRunning && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{migration.currentFile}</span>
                  <span className="text-gray-500">{migration.progress}%</span>
                </div>
                <Progress value={migration.progress} className="h-2" />
              </div>
            )}

            {/* Migration Results */}
            {migration.completed && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Migration abgeschlossen</span>
                </div>
                <div className="mt-2 text-xs text-green-700 space-y-0.5">
                  <p>✓ {migration.migrated} Dateien erfolgreich migriert</p>
                  <p>○ {migration.skipped} Dateien übersprungen (bereits auf R2)</p>
                  {migration.errors.length > 0 && (
                    <p className="text-red-600">✗ {migration.errors.length} Fehler</p>
                  )}
                </div>
              </div>
            )}

            {/* Migration Errors */}
            {migration.errors.length > 0 && !migration.isRunning && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-1">Fehler:</p>
                <ul className="text-xs text-red-700 list-disc list-inside space-y-0.5">
                  {migration.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {migration.errors.length > 5 && (
                    <li>... und {migration.errors.length - 5} weitere</li>
                  )}
                </ul>
              </div>
            )}

            {/* Migration Button */}
            <Button
              onClick={handleMigration}
              disabled={migration.isRunning || !isR2Configured}
              variant="outline"
              className="w-full border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              {migration.isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Migration läuft...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Alle alten Dateien zu R2 migrieren
                </>
              )}
            </Button>

            {!isR2Configured && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                Zuerst R2-Zugangsdaten speichern
              </p>
            )}
          </div>

          {/* Retrofit Section - Generate missing thumbnails/previews */}
          <div className="px-6 py-5 border-t border-gray-100 bg-blue-50/50">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Thumbnails & Previews nachgenerieren</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Erstellt fehlende Vorschaubilder für bestehende Uploads
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Was passiert:</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                  <li>Thumbnail (400px) für schnelle Grid-Ansicht</li>
                  <li>Preview (1600px) für Lightbox</li>
                  <li>Original bleibt für Download erhalten</li>
                </ul>
              </div>
            </div>

            {/* Retrofit Status - Enhanced with x/total counter */}
            {retrofit.isRunning && (
              <div className="mb-4 space-y-3 p-4 bg-white border border-blue-200 rounded-lg">
                {/* Progress Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-sm font-medium text-gray-900">Verarbeite Bilder...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-blue-600">
                      {Math.round((retrofit.thumbnailsCreated + retrofit.previewsCreated + retrofit.skipped) / 2) || 0}
                    </span>
                    <span className="text-sm text-gray-400">/</span>
                    <span className="text-sm text-gray-600">{retrofit.total}</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <Progress value={retrofit.progress} className="h-3" />
                
                {/* Current File */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{retrofit.currentImage}</span>
                </div>
                
                {/* Live Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{retrofit.thumbnailsCreated}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Thumbnails</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{retrofit.previewsCreated}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Previews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-400">{retrofit.skipped}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Übersprungen</div>
                  </div>
                </div>

                {/* Live Errors during processing */}
                {retrofit.errors.length > 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600">
                    <span className="font-medium">{retrofit.errors.length} Fehler</span>
                  </div>
                )}
              </div>
            )}

            {/* Retrofit Results */}
            {retrofit.completed && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-semibold">Retrofit abgeschlossen</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 bg-green-100 rounded">
                    <div className="text-lg font-bold text-green-700">{retrofit.thumbnailsCreated}</div>
                    <div className="text-[10px] text-green-600 uppercase">Thumbnails</div>
                  </div>
                  <div className="text-center p-2 bg-blue-100 rounded">
                    <div className="text-lg font-bold text-blue-700">{retrofit.previewsCreated}</div>
                    <div className="text-[10px] text-blue-600 uppercase">Previews</div>
                  </div>
                  <div className="text-center p-2 bg-gray-100 rounded">
                    <div className="text-lg font-bold text-gray-600">{retrofit.skipped}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Übersprungen</div>
                  </div>
                </div>
                <div className="text-xs text-green-700">
                  Gesamt: {retrofit.total} Bilder verarbeitet
                </div>
              </div>
            )}

            {/* Retrofit Errors - Scrollable list */}
            {retrofit.errors.length > 0 && !retrofit.isRunning && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {retrofit.errors.length} Fehler aufgetreten
                  </p>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {retrofit.errors.map((err, i) => (
                    <div 
                      key={i} 
                      className="text-xs text-red-700 bg-red-100/50 px-2 py-1.5 rounded flex items-start gap-2"
                    >
                      <span className="text-red-400 font-mono flex-shrink-0">{i + 1}.</span>
                      <span className="break-all">{err}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Retrofit Button */}
            <Button
              onClick={handleRetrofit}
              disabled={retrofit.isRunning || !isR2Configured}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {retrofit.isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verarbeite {retrofit.progress}%...
                </>
              ) : retrofit.completed ? (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Erneut ausführen
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Fehlende Vorschaubilder generieren
                </>
              )}
            </Button>

            {!isR2Configured && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                Zuerst R2-Zugangsdaten speichern
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
