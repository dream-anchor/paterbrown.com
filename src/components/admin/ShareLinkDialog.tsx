import { useState } from "react";
import { Copy, Check, Link, Clock, Lock, Hash, Trash2 } from "lucide-react";
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

interface ShareLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentName: string;
}

type ExpirationOption = "never" | "7days" | "30days";

const EXPIRATION_OPTIONS: Record<ExpirationOption, { label: string; days: number | null }> = {
  never: { label: "Unbegrenzt", days: null },
  "7days": { label: "7 Tage", days: 7 },
  "30days": { label: "30 Tage", days: 30 },
};

function generateToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

function generateSecurePassword(length = 20): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*-_+=";
  let result = "";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

const ShareLinkDialog = ({
  open,
  onOpenChange,
  documentId,
  documentName,
}: ShareLinkDialogProps) => {
  const { toast } = useToast();
  const [expiration, setExpiration] = useState<ExpirationOption>("never");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [useMaxDownloads, setUseMaxDownloads] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState("10");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeLinksCount, setActiveLinksCount] = useState<number | null>(null);

  // Fetch active links count when dialog opens
  const fetchActiveLinksCount = async () => {
    const { count } = await supabase
      .from("document_share_links")
      .select("*", { count: "exact", head: true })
      .eq("document_id", documentId)
      .eq("is_active", true);
    setActiveLinksCount(count || 0);
  };

  // Reset state when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      fetchActiveLinksCount();
    } else {
      setGeneratedLink(null);
      setExpiration("never");
      setUsePassword(false);
      setPassword("");
      setUseMaxDownloads(false);
      setMaxDownloads("10");
    }
    onOpenChange(isOpen);
  };

  // Auto-generate password when password protection is enabled
  const handlePasswordToggle = (enabled: boolean) => {
    setUsePassword(enabled);
    if (enabled) {
      setPassword(generateSecurePassword(20));
    } else {
      setPassword("");
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const token = generateToken();
      const expirationDays = EXPIRATION_OPTIONS[expiration].days;
      const expiresAt = expirationDays
        ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase.from("document_share_links").insert({
        document_id: documentId,
        token,
        expires_at: expiresAt,
        password_hash: usePassword && password ? password : null,
        max_downloads: useMaxDownloads ? parseInt(maxDownloads, 10) : null,
      });

      if (error) throw error;

      const link = `${window.location.origin}/dl/${token}`;
      setGeneratedLink(link);
      setActiveLinksCount((prev) => (prev ?? 0) + 1);

      toast({
        title: "Link erstellt",
        description: "Der Download-Link wurde erfolgreich generiert.",
      });
    } catch (error) {
      console.error("Error creating share link:", error);
      toast({
        title: "Fehler",
        description: "Link konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeactivateAll = async () => {
    setIsDeactivating(true);
    try {
      const { data, error } = await supabase.rpc("deactivate_document_share_links", {
        p_document_id: documentId,
      });

      if (error) throw error;

      const count = data as number;
      setActiveLinksCount(0);

      toast({
        title: "Links deaktiviert",
        description: `${count} ${count === 1 ? "Link wurde" : "Links wurden"} deaktiviert.`,
      });
    } catch (error) {
      console.error("Error deactivating links:", error);
      toast({
        title: "Fehler",
        description: "Links konnten nicht deaktiviert werden.",
        variant: "destructive",
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast({
        title: "Kopiert!",
        description: "Der Link wurde in die Zwischenablage kopiert.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Fehler",
        description: "Link konnte nicht kopiert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 flex items-center gap-2">
            <Link className="w-5 h-5" />
            Link generieren
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Erstelle einen Download-Link für "{documentName}"
          </DialogDescription>
        </DialogHeader>

        {!generatedLink ? (
          <div className="space-y-5 py-2">
            {/* Expiration */}
            <div className="space-y-2">
              <Label className="text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Gültigkeit
              </Label>
              <Select
                value={expiration}
                onValueChange={(v) => setExpiration(v as ExpirationOption)}
              >
                <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                {/* Ensure dropdown renders above the Dialog overlay */}
                <SelectContent className="bg-white z-[100]">
                  {Object.entries(EXPIRATION_OPTIONS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key} className="text-gray-700">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Password Protection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Passwortschutz
                </Label>
                <Switch
                  checked={usePassword}
                  onCheckedChange={handlePasswordToggle}
                />
              </div>
              {usePassword && (
                <Input
                  type="text"
                  placeholder="Passwort eingeben"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-gray-200 text-gray-900"
                />
              )}
            </div>

            {/* Max Downloads */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  Download-Limit
                </Label>
                <Switch
                  checked={useMaxDownloads}
                  onCheckedChange={setUseMaxDownloads}
                />
              </div>
              {useMaxDownloads && (
                <Input
                  type="number"
                  min="1"
                  placeholder="Max. Downloads"
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
                  Link generieren
                </>
              )}
            </Button>

            {/* Deactivate All Links */}
            {activeLinksCount !== null && activeLinksCount > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={handleDeactivateAll}
                  disabled={isDeactivating}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  {isDeactivating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                      Deaktiviere...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Alle Links deaktivieren ({activeLinksCount})
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Deaktivierte Links funktionieren nicht mehr
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Dein Download-Link:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-white p-2 rounded border border-gray-200 text-gray-900 truncate">
                  {generatedLink}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0 bg-white text-gray-700"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              {expiration === "never" ? (
                <p>• Unbegrenzt gültig</p>
              ) : (
                <p>• Gültig für {EXPIRATION_OPTIONS[expiration].label}</p>
              )}
              {usePassword && <p>• Passwortgeschützt</p>}
              {useMaxDownloads && <p>• Max. {maxDownloads} Downloads</p>}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="flex-1 bg-white text-gray-700"
              >
                Schließen
              </Button>
              <Button
                onClick={() => setGeneratedLink(null)}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
              >
                Weiteren Link erstellen
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareLinkDialog;
