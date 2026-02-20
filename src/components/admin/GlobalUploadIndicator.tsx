import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Check,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Trash2,
  RotateCcw,
  Loader2,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useUpload, UploadFile } from "@/contexts/UploadContext";
import { useNotifications } from "@/contexts/NotificationContext";

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatTimeRemaining = (seconds: number | null): string => {
  if (seconds === null) return "";
  if (seconds < 60) return `${seconds}s übrig`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s übrig`;
};

const FileIcon = ({ file }: { file: UploadFile }) => {
  const isImage = file.file.type.startsWith("image/");
  return isImage 
    ? <ImageIcon className="w-4 h-4 text-gray-500" />
    : <FileText className="w-4 h-4 text-gray-500" />;
};

const StatusIcon = ({ status }: { status: UploadFile["status"] }) => {
  switch (status) {
    case "pending":
      return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    case "uploading":
      return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
    case "success":
      return <Check className="w-4 h-4 text-green-500" />;
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
  }
};

const GlobalUploadIndicator = () => {
  const {
    files,
    isUploading,
    totalProgress,
    estimatedTimeRemaining,
    cancelUpload,
    cancelAllUploads,
    retryUpload,
    clearCompleted,
    isIndicatorExpanded,
    setIndicatorExpanded,
  } = useUpload();
  const { addNotification } = useNotifications();

  const [dismissIn, setDismissIn] = useState<number | null>(null);
  const prevCompleteRef = useRef(false);

  const successCount = files.filter(f => f.status === "success").length;
  const errorCount = files.filter(f => f.status === "error").length;
  const pendingCount = files.filter(f => f.status === "pending" || f.status === "uploading").length;

  const allComplete = !isUploading && files.length > 0;
  const hasErrors = errorCount > 0;

  // Detect batch completion: add notification + start 10s auto-dismiss
  useEffect(() => {
    if (allComplete && !prevCompleteRef.current) {
      addNotification({
        type: hasErrors ? "error" : "success",
        title: hasErrors
          ? `Upload: ${errorCount} Fehler`
          : `${successCount} Datei${successCount !== 1 ? "en" : ""} hochgeladen`,
        detail: hasErrors
          ? `${successCount} erfolgreich, ${errorCount} fehlgeschlagen`
          : undefined,
      });
      if (!hasErrors) setDismissIn(10);
    }
    if (!allComplete) setDismissIn(null);
    prevCompleteRef.current = allComplete;
  }, [allComplete, hasErrors, successCount, errorCount, addNotification]);

  // Countdown tick → auto-dismiss
  useEffect(() => {
    if (dismissIn === null) return;
    if (dismissIn <= 0) {
      clearCompleted();
      setDismissIn(null);
      return;
    }
    const t = setTimeout(() => setDismissIn(prev => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [dismissIn, clearCompleted]);

  // Don't render if no files
  if (files.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className="fixed bottom-4 right-4 z-50 w-80 sm:w-96"
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header - Always visible */}
          <button
            onClick={() => setIndicatorExpanded(!isIndicatorExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              {isUploading ? (
                <div className="relative">
                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                </div>
              ) : allComplete && !hasErrors ? (
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
              ) : hasErrors ? (
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                </div>
              ) : (
                <Upload className="w-5 h-5 text-gray-400" />
              )}

              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {isUploading 
                    ? `Hochladen... ${Math.round(totalProgress)}%`
                    : allComplete 
                      ? hasErrors 
                        ? `${errorCount} Fehler`
                        : `${successCount} Dateien hochgeladen`
                      : "Upload"
                  }
                </p>
                {isUploading && estimatedTimeRemaining && (
                  <p className="text-xs text-gray-500">
                    {formatTimeRemaining(estimatedTimeRemaining)}
                  </p>
                )}
                {!isUploading && (
                  <p className="text-xs text-gray-500">
                    {successCount} erfolgreich
                    {errorCount > 0 && `, ${errorCount} fehlgeschlagen`}
                    {dismissIn !== null && ` · wird in ${dismissIn}s ausgeblendet`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isIndicatorExpanded 
                ? <ChevronDown className="w-4 h-4 text-gray-400" />
                : <ChevronUp className="w-4 h-4 text-gray-400" />
              }
            </div>
          </button>

          {/* Progress bar */}
          {isUploading && (
            <div className="px-4 pb-2 bg-gray-50">
              <Progress value={totalProgress} className="h-1.5" />
            </div>
          )}

          {/* Expanded content */}
          <AnimatePresence>
            {isIndicatorExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ScrollArea className="h-64 overflow-y-auto">
                  <div className="p-2 space-y-1">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg transition-colors",
                          file.status === "error" ? "bg-red-50" : "hover:bg-gray-50"
                        )}
                      >
                        <FileIcon file={file} />
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.displayName || file.file.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{formatFileSize(file.file.size)}</span>
                            {file.status === "uploading" && (
                              <span className="text-amber-600">{file.progress}%</span>
                            )}
                            {file.status === "error" && (
                              <span className="text-red-600 truncate">{file.error}</span>
                            )}
                          </div>
                          
                          {file.status === "uploading" && (
                            <Progress value={file.progress} className="h-1 mt-1" />
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <StatusIcon status={file.status} />
                          
                          {file.status === "error" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => retryUpload(file.id)}
                              className="h-6 w-6 p-0"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {(file.status === "pending" || file.status === "uploading") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelUpload(file.id)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Footer actions */}
                <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                  {allComplete ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCompleted}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Schließen
                      </Button>
                      {hasErrors && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            files.filter(f => f.status === "error").forEach(f => retryUpload(f.id));
                          }}
                          className="text-xs text-amber-600 hover:text-amber-700"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Alle wiederholen
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-gray-500">
                        {pendingCount} ausstehend
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelAllUploads}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Alle abbrechen
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalUploadIndicator;
