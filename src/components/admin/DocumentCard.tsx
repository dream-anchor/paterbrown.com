import { useState } from "react";
import { Copy, Share2, Trash2, Download, Mail, MessageCircle, MoreHorizontal, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  formatFileSize, 
  getDownloadPageUrl,
  getPublicDownloadUrl,
  getFileExtension,
} from "@/lib/documentUtils";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface DocumentCardProps {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string | null;
  downloadCount: number;
  createdAt: string;
  onDelete: (id: string) => void;
}

const DocumentCard = ({
  id,
  name,
  fileName,
  filePath,
  fileSize,
  contentType,
  downloadCount,
  createdAt,
  onDelete,
}: DocumentCardProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const downloadPageUrl = getDownloadPageUrl(id);
  const directDownloadUrl = getPublicDownloadUrl(filePath);
  const fileExtension = getFileExtension(fileName);
  const isPdf = contentType?.includes("pdf") || fileName.toLowerCase().endsWith(".pdf");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(downloadPageUrl);
      setCopied(true);
      toast({
        title: "Link kopiert",
        description: "Der Download-Link wurde in die Zwischenablage kopiert.",
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

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Pater Brown - ${name}`);
    const body = encodeURIComponent(
      `Hallo,\n\nhier ist der Download-Link für "${name}":\n\n${downloadPageUrl}\n\nViele Grüße`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Pater Brown - ${name}\n\nDownload: ${downloadPageUrl}`);
    window.open(`https://wa.me/?text=${text}`);
  };

  const handleDirectDownload = () => {
    window.open(directDownloadUrl, "_blank");
  };

  return (
    <>
      <Card className="p-4 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
        <div className="flex items-start gap-4">
          {/* Modern Document Icon */}
          <div className="flex-shrink-0 w-12 h-14 rounded-lg bg-gray-100 border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden">
            <FileText className="w-5 h-5 text-gray-400 mb-0.5" />
            <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">
              {fileExtension || "DOC"}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                <p className="text-sm text-gray-500 truncate">{fileName}</p>
              </div>
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                {formatFileSize(fileSize)}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span>
                Hochgeladen: {format(new Date(createdAt), "dd.MM.yyyy", { locale: de })}
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {downloadCount} Downloads
              </span>
            </div>

            {/* Actions */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="h-8 text-xs bg-white hover:bg-gray-50 text-gray-700"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                )}
                {copied ? "Kopiert!" : "Link kopieren"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs bg-white hover:bg-gray-50 text-gray-700">
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    Teilen
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-white">
                  <DropdownMenuItem onClick={handleCopyLink} className="text-gray-700">
                    <Copy className="w-4 h-4 mr-2" />
                    Link kopieren
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareEmail} className="text-gray-700">
                    <Mail className="w-4 h-4 mr-2" />
                    Per E-Mail teilen
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareWhatsApp} className="text-gray-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Per WhatsApp teilen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem onClick={handleDirectDownload} className="text-gray-700">
                    <Download className="w-4 h-4 mr-2" />
                    Direkt herunterladen
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Dokument löschen?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Das Dokument "{name}" wird unwiderruflich gelöscht. Bestehende Download-Links funktionieren danach nicht mehr.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white text-gray-700">Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentCard;
