import { useState } from "react";
import { Link, Clock, Lock, Hash, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BulkShareLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  documentIds: string[];
  documentNames: string[];
  imageIds?: string[];
  imageNames?: string[];
  photographerName?: string;
  projectName?: string;
  contactEmail?: string;
}

type ExpirationOption = "never" | "7days" | "30days";

const EXPIRATION_OPTIONS: Record<ExpirationOption, { label: string; days: number | null }> = {
  never: { label: "Unbegrenzt", days: null },
  "7days": { label: "7 Tage", days: 7 },
  "30days": { label: "30 Tage", days: 30 },
};

function generateToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (v) => chars[v % chars.length]).join("");
}

function generateSecurePassword(length = 20): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*-_+=";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (v) => chars[v % chars.length]).join("");
}

const BulkShareLinkDialog = ({
  open,
  onOpenChange,
  onSuccess,
  documentIds,
  documentNames,
  imageIds = [],
  imageNames = [],
  photographerName = "",
  projectName = "",
  contactEmail = "",
}: BulkShareLinkDialogProps) => {
  const { toast } = useToast();
  const [expiration, setExpiration] = useState<ExpirationOption>("never");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [useMaxDownloads, setUseMaxDownloads] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState("10");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setExpiration("never");
      setUsePassword(false);
      setPassword("");
      setUseMaxDownloads(false);
      setMaxDownloads("10");
    }
    onOpenChange(isOpen);
  };

  const handlePasswordToggle = (enabled: boolean) => {
    setUsePassword(enabled);
    setPassword(enabled ? generateSecurePassword(20) : "");
  };

  const handleGenerate = async () => {
    const totalItems = documentIds.length + imageIds.length;
    if (totalItems === 0) return;
    setIsGenerating(true);
    try {
      const token = generateToken();
      const expirationDays = EXPIRATION_OPTIONS[expiration].days;
      const expiresAt = expirationDays
        ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data: { user } } = await supabase.auth.getUser();

      // 1. Bundle erstellen (mit image_ids falls vorhanden)
      const { data: bundle, error: bundleError } = await supabase
        .from("document_share_bundles")
        .insert({
          token,
          expires_at: expiresAt,
          password_hash: usePassword && password ? password : null,
          max_downloads: useMaxDownloads ? parseInt(maxDownloads, 10) : null,
          created_by: user?.id ?? null,
          image_ids: imageIds.length > 0 ? imageIds : [],
          photographer_name: photographerName || null,
          project_name: projectName || null,
          contact_email: contactEmail || null,
        })
        .select()
        .single();

      if (bundleError) throw bundleError;

      // 2. Bundle-Items für Dokumente einfügen
      if (documentIds.length > 0) {
        const items = documentIds.map((document_id) => ({
          bundle_id: bundle.id,
          document_id,
        }));
        const { error: itemsError } = await supabase
          .from("document_bundle_items")
          .insert(items);
        if (itemsError) throw itemsError;
      }

      // 3. Link kopieren
      const link = `${window.location.origin}/bundle/${token}`;
      await navigator.clipboard.writeText(link);

      const settings: string[] = [];
      if (expiration !== "never") settings.push(EXPIRATION_OPTIONS[expiration].label);
      if (usePassword) settings.push("Passwortgeschützt");
      if (useMaxDownloads) settings.push(`Max. ${maxDownloads} Downloads`);

      toast({
        title: `✓ Paket-Link erstellt & kopiert`,
        description: `${totalItems} ${totalItems === 1 ? "Datei" : "Dateien"}${settings.length ? ` · ${settings.join(", ")}` : ""}`,
      });

      onSuccess?.();
      handleOpenChange(false);
    } catch (error) {
      console.error("Error creating bundle:", error);
      toast({
        title: "Fehler",
        description: "Paket-Link konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Paket-Link generieren
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {documentIds.length + imageIds.length} {(documentIds.length + imageIds.length) === 1 ? "Datei" : "Dateien"} als Paket teilen
          </DialogDescription>
        </DialogHeader>

        {/* Datei-Liste */}
        <div className="max-h-32 overflow-y-auto rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 space-y-1">
          {imageNames.map((name, i) => (
            <p key={`img-${i}`} className="text-xs text-gray-600 truncate">
              📷 {name}
            </p>
          ))}
          {documentNames.map((name, i) => (
            <p key={`doc-${i}`} className="text-xs text-gray-600 truncate">
              {name}
            </p>
          ))}
        </div>

        <div className="space-y-5 py-1">
          {/* Gültigkeit */}
          <div className="space-y-2">
            <Label className="text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Gültigkeit
            </Label>
            <Select value={expiration} onValueChange={(v) => setExpiration(v as ExpirationOption)}>
              <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white z-[10001]">
                {Object.entries(EXPIRATION_OPTIONS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key} className="text-gray-700">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Passwortschutz */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-400" />
                Passwortschutz
              </Label>
              <Switch checked={usePassword} onCheckedChange={handlePasswordToggle} />
            </div>
            {usePassword && (
              <Input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-gray-200 text-gray-900"
              />
            )}
          </div>

          {/* Download-Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-400" />
                Download-Limit
              </Label>
              <Switch checked={useMaxDownloads} onCheckedChange={setUseMaxDownloads} />
            </div>
            {useMaxDownloads && (
              <Input
                type="number"
                min="1"
                value={maxDownloads}
                onChange={(e) => setMaxDownloads(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 w-32"
              />
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (usePassword && !password)}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generiere...
              </>
            ) : (
              <>
                <Link className="w-4 h-4 mr-2" />
                Paket-Link generieren & kopieren
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkShareLinkDialog;
