import { useState } from "react";
import { Copy, Check, Link, Clock, Lock, Hash } from "lucide-react";
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

type ExpirationOption = "never" | "1day" | "7days" | "30days" | "90days";

const EXPIRATION_OPTIONS: Record<ExpirationOption, { label: string; days: number | null }> = {
  never: { label: "Niemals", days: null },
  "1day": { label: "1 Tag", days: 1 },
  "7days": { label: "7 Tage", days: 7 },
  "30days": { label: "30 Tage", days: 30 },
  "90days": { label: "90 Tage", days: 90 },
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

const ShareLinkDialog = ({
  open,
  onOpenChange,
  documentId,
  documentName,
}: ShareLinkDialogProps) => {
  const { toast } = useToast();
  const [expiration, setExpiration] = useState<ExpirationOption>("7days");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [useMaxDownloads, setUseMaxDownloads] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState("10");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

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
        password_hash: usePassword && password ? password : null, // In production, hash this!
        max_downloads: useMaxDownloads ? parseInt(maxDownloads, 10) : null,
      });

      if (error) throw error;

      const link = `${window.location.origin}/dl/${token}`;
      setGeneratedLink(link);

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

  const handleClose = () => {
    setGeneratedLink(null);
    setExpiration("7days");
    setUsePassword(false);
    setPassword("");
    setUseMaxDownloads(false);
    setMaxDownloads("10");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 flex items-center gap-2">
            <Link className="w-5 h-5" />
            Link teilen
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
                <SelectContent className="bg-white">
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
                  onCheckedChange={setUsePassword}
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
              {expiration !== "never" && (
                <p>• Gültig für {EXPIRATION_OPTIONS[expiration].label}</p>
              )}
              {usePassword && <p>• Passwortgeschützt</p>}
              {useMaxDownloads && <p>• Max. {maxDownloads} Downloads</p>}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-white text-gray-700"
              >
                Schließen
              </Button>
              <Button
                onClick={() => setGeneratedLink(null)}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
              >
                Neuen Link erstellen
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareLinkDialog;
