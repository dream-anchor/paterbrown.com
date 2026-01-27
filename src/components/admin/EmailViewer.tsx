import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { 
  User, 
  Calendar, 
  Paperclip, 
  ExternalLink, 
  FileText, 
  Image as ImageIcon,
  File,
  ChevronDown,
  ChevronUp,
  Plus,
  Mail
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getContentTypeIcon } from "@/lib/documentUtils";

export interface EmailAttachment {
  id: string;
  file_name: string;
  content_type: string | null;
  file_size?: number;
}

export interface EmailViewerProps {
  email: {
    subject: string | null;
    sender: {
      name: string;
      email: string;
    };
    date: string;
    contentHtml: string | null;
    contentText?: string | null;
    attachments?: EmailAttachment[];
    tags?: string[];
  };
  onCreateBooking?: () => void;
  onViewAttachment?: (attachment: EmailAttachment) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAttachmentIcon(contentType: string | null) {
  if (!contentType) return <File className="w-4 h-4" />;
  if (contentType.includes("pdf")) return <FileText className="w-4 h-4 text-red-500" />;
  if (contentType.startsWith("image/")) return <ImageIcon className="w-4 h-4 text-blue-500" />;
  return <File className="w-4 h-4 text-gray-500" />;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EmailViewer({ 
  email, 
  onCreateBooking,
  onViewAttachment 
}: EmailViewerProps) {
  const [showFullEmail, setShowFullEmail] = useState(true);
  
  // Sanitize HTML content
  const sanitizedHtml = email.contentHtml 
    ? DOMPurify.sanitize(email.contentHtml, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
          'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'hr', 'span', 'div'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'width', 'height'],
        ALLOW_DATA_ATTR: false,
      })
    : null;

  const formattedDate = format(new Date(email.date), "d. MMM yyyy, HH:mm", { locale: de });

  const hasAttachments = email.attachments && email.attachments.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col h-full bg-white"
    >
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-gray-100">
        {/* Subject */}
        <h1 className="text-xl font-semibold text-gray-900 mb-4 leading-tight">
          {email.subject || "(Kein Betreff)"}
        </h1>
        
        {/* Sender & Date Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 shrink-0 bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200/50">
              <AvatarFallback className="text-amber-700 font-medium text-sm bg-transparent">
                {getInitials(email.sender.name || email.sender.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {email.sender.name || "Unbekannt"}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {email.sender.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Tags & Actions Row */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
        <div className="flex items-center gap-2 flex-wrap">
          {email.tags && email.tags.length > 0 ? (
            email.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className={cn(
                  "text-xs font-medium",
                  tag.toLowerCase() === "verarbeitet" && "bg-green-100 text-green-700 border-green-200",
                  tag.toLowerCase() === "rechnung" && "bg-blue-100 text-blue-700 border-blue-200",
                  tag.toLowerCase() === "buchung" && "bg-amber-100 text-amber-700 border-amber-200"
                )}
              >
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-400">Keine Tags</span>
          )}
        </div>
        
        {onCreateBooking && (
          <Button 
            onClick={onCreateBooking}
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Buchung erstellen
          </Button>
        )}
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Toggle for long emails */}
          {sanitizedHtml && sanitizedHtml.length > 5000 && (
            <button
              onClick={() => setShowFullEmail(!showFullEmail)}
              className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 mb-4 font-medium"
            >
              {showFullEmail ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  E-Mail einklappen
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Vollständige E-Mail anzeigen
                </>
              )}
            </button>
          )}
          
          {/* Email Content Container */}
          <motion.div 
            className={cn(
              "rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden",
              !showFullEmail && "max-h-96 overflow-hidden relative"
            )}
            layout
          >
            {sanitizedHtml ? (
              <div 
                className={cn(
                  "p-5 prose prose-sm max-w-none",
                  "prose-headings:text-gray-900 prose-headings:font-semibold",
                  "prose-p:text-gray-700 prose-p:leading-relaxed",
                  "prose-a:text-blue-600 prose-a:underline prose-a:break-words",
                  "prose-strong:text-gray-900",
                  "prose-ul:text-gray-700 prose-ol:text-gray-700",
                  "prose-blockquote:border-l-amber-400 prose-blockquote:text-gray-600",
                  "prose-img:rounded-lg prose-img:max-w-full",
                  "prose-table:text-sm prose-th:bg-gray-50 prose-td:border-gray-200"
                )}
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            ) : email.contentText ? (
              <div className="p-5">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                  {email.contentText}
                </pre>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Kein E-Mail-Inhalt verfügbar</p>
              </div>
            )}
            
            {/* Fade overlay for collapsed state */}
            {!showFullEmail && sanitizedHtml && sanitizedHtml.length > 5000 && (
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            )}
          </motion.div>
        </div>
      </div>

      {/* Attachments Section */}
      <AnimatePresence>
        {hasAttachments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100 bg-gray-50/50"
          >
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {email.attachments!.length} Anhang{email.attachments!.length !== 1 ? "e" : ""}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {email.attachments!.map((attachment) => (
                  <motion.button
                    key={attachment.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onViewAttachment?.(attachment)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg",
                      "bg-white border border-gray-200 hover:border-amber-300",
                      "hover:bg-amber-50/50 transition-all duration-200",
                      "group cursor-pointer"
                    )}
                  >
                    {getAttachmentIcon(attachment.content_type)}
                    <div className="text-left min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate max-w-[180px] group-hover:text-amber-700">
                        {attachment.file_name}
                      </p>
                      {attachment.file_size && (
                        <p className="text-xs text-gray-400">
                          {formatFileSize(attachment.file_size)}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
