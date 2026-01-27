import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Copy, Share2, Trash2, Download, Mail, MessageCircle, 
  MoreHorizontal, FileText, Link, ExternalLink, 
  Image, FileSpreadsheet, FileArchive, Presentation, File,
  Eye, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  isImageFile,
  getFileTypeGroup,
  FileTypeGroup,
} from "@/lib/documentUtils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import ShareLinkDialog from "./ShareLinkDialog";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  index?: number;
}

// Premium gradient colors for file types
const FILE_TYPE_GRADIENTS: Record<FileTypeGroup, { from: string; to: string; icon: typeof FileText }> = {
  images: { from: "from-pink-500", to: "to-rose-600", icon: Image },
  pdfs: { from: "from-red-500", to: "to-red-600", icon: FileText },
  documents: { from: "from-blue-500", to: "to-indigo-600", icon: FileText },
  spreadsheets: { from: "from-green-500", to: "to-emerald-600", icon: FileSpreadsheet },
  presentations: { from: "from-orange-500", to: "to-amber-600", icon: Presentation },
  archives: { from: "from-purple-500", to: "to-violet-600", icon: FileArchive },
  other: { from: "from-gray-500", to: "to-slate-600", icon: File },
};

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
  index = 0,
}: DocumentCardProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [imageError, setImageError] = useState(false);

  const downloadPageUrl = getDownloadPageUrl(id);
  const directDownloadUrl = getPublicDownloadUrl(filePath);
  const fileExtension = getFileExtension(fileName);
  const isImage = isImageFile(contentType, fileName);
  const fileTypeGroup = getFileTypeGroup(contentType, fileName);
  const typeConfig = FILE_TYPE_GRADIENTS[fileTypeGroup];
  const IconComponent = typeConfig.icon;

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
        whileHover={{ y: -2 }}
        className="group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn(
          "relative overflow-hidden rounded-2xl bg-white",
          "border border-gray-200/60 hover:border-amber-400/40",
          "shadow-sm hover:shadow-xl hover:shadow-amber-500/10",
          "transition-all duration-300 ease-out"
        )}>
          <div className="flex items-stretch">
            {/* Premium File Icon / Thumbnail */}
            <div className={cn(
              "relative w-20 sm:w-24 flex-shrink-0 overflow-hidden",
              "bg-gradient-to-br",
              typeConfig.from, typeConfig.to
            )}>
              {isImage && !imageError ? (
                <img
                  src={directDownloadUrl}
                  alt={name}
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover",
                    "transition-transform duration-500",
                    isHovered && "scale-110"
                  )}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <motion.div
                    animate={{ 
                      scale: isHovered ? 1.1 : 1,
                      rotate: isHovered ? 5 : 0 
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconComponent className="w-8 h-8 drop-shadow-md" />
                  </motion.div>
                  <span className="text-[10px] font-bold uppercase mt-1.5 tracking-wider opacity-90">
                    {fileExtension || "FILE"}
                  </span>
                </div>
              )}
              
              {/* Glassmorphism overlay on hover */}
              <AnimatePresence>
                {isHovered && !isMobile && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="p-2 rounded-full bg-white/30 backdrop-blur-sm"
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                    {name}
                  </h3>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {fileName}
                  </p>
                </div>
                
                {/* Size badge - glassmorphism */}
                <div className={cn(
                  "flex-shrink-0 px-2.5 py-1 rounded-full",
                  "bg-gray-100/80 backdrop-blur-sm",
                  "text-xs font-medium text-gray-600"
                )}>
                  {formatFileSize(fileSize)}
                </div>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
                <span>
                  {format(new Date(createdAt), "dd. MMM yyyy", { locale: de })}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {downloadCount} Downloads
                </span>
              </div>

              {/* Actions - floating glassmorphism bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareDialog(true)}
                  className={cn(
                    "h-9 text-xs rounded-xl",
                    "bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100",
                    "border-amber-200/60 hover:border-amber-300",
                    "text-amber-700 font-medium",
                    "transition-all duration-200"
                  )}
                >
                  <Link className="w-3.5 h-3.5 mr-1.5" />
                  Link generieren
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 text-xs rounded-xl bg-white hover:bg-gray-50 text-gray-700"
                    >
                      <Share2 className="w-3.5 h-3.5 mr-1.5" />
                      Teilen
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-white rounded-xl shadow-xl border-gray-200">
                    <DropdownMenuItem onClick={handleCopyLink} className="text-gray-700 rounded-lg">
                      {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                      Permanenten Link kopieren
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShareEmail} className="text-gray-700 rounded-lg">
                      <Mail className="w-4 h-4 mr-2" />
                      Per E-Mail teilen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShareWhatsApp} className="text-gray-700 rounded-lg">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Per WhatsApp teilen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-xl border-gray-200">
                    <DropdownMenuItem onClick={handleDirectDownload} className="text-gray-700 rounded-lg">
                      <Download className="w-4 h-4 mr-2" />
                      Direkt herunterladen
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => window.open(downloadPageUrl, "_blank")}
                      className="text-gray-700 rounded-lg"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Download-Seite öffnen
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Dokument löschen?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Das Dokument "{name}" wird unwiderruflich gelöscht. Bestehende Download-Links funktionieren danach nicht mehr.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white text-gray-700 rounded-xl">Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(id)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Link Dialog */}
      <ShareLinkDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        documentId={id}
        documentName={name}
      />
    </>
  );
};

export default DocumentCard;