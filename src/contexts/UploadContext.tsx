import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ============ TYPES ============

export type UploadStatus = "pending" | "uploading" | "success" | "error";

export interface UploadFile {
  id: string;
  file: File;
  folder: "documents" | "picks";
  displayName?: string;
  status: UploadStatus;
  progress: number;
  publicUrl?: string;
  r2Key?: string;
  error?: string;
  startedAt?: number;
  // Track if this upload has been saved to DB
  savedToDb?: boolean;
}

export interface UploadContextType {
  // State
  files: UploadFile[];
  isUploading: boolean;
  totalProgress: number;
  estimatedTimeRemaining: number | null;
  
  // Actions
  addFiles: (files: File[], folder: "documents" | "picks", displayNames?: string[]) => void;
  cancelUpload: (id: string) => void;
  cancelAllUploads: () => void;
  retryUpload: (id: string) => void;
  clearCompleted: () => void;
  
  // UI State
  isIndicatorExpanded: boolean;
  setIndicatorExpanded: (expanded: boolean) => void;
}

const UploadContext = createContext<UploadContextType | null>(null);

// ============ CONFIG ============

const MAX_CONCURRENT_UPLOADS = 5;
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB for progress tracking

// ============ PROVIDER ============

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isIndicatorExpanded, setIndicatorExpanded] = useState(false);
  
  // Track active uploads
  const activeUploads = useRef<Set<string>>(new Set());
  const uploadQueue = useRef<string[]>([]);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());
  
  // Speed tracking for ETA
  const speedTracking = useRef<{ bytesUploaded: number; startTime: number }>({
    bytesUploaded: 0,
    startTime: Date.now(),
  });

  // Calculate derived state
  const isUploading = files.some(f => f.status === "uploading" || f.status === "pending");
  
  const totalProgress = files.length > 0
    ? files.reduce((sum, f) => sum + f.progress, 0) / files.length
    : 0;

  const estimatedTimeRemaining = (() => {
    if (!isUploading) return null;
    const elapsed = (Date.now() - speedTracking.current.startTime) / 1000;
    if (elapsed < 2 || totalProgress < 5) return null;
    const rate = totalProgress / elapsed;
    if (rate <= 0) return null;
    return Math.ceil((100 - totalProgress) / rate);
  })();

  // Generate unique ID
  const generateId = () => `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Add files to queue
  const addFiles = useCallback((newFiles: File[], folder: "documents" | "picks", displayNames?: string[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file, i) => ({
      id: generateId(),
      file,
      folder,
      displayName: displayNames?.[i] || file.name.replace(/\.[^/.]+$/, ""),
      status: "pending" as UploadStatus,
      progress: 0,
    }));

    setFiles(prev => [...prev, ...uploadFiles]);
    
    // Add to queue
    uploadFiles.forEach(f => uploadQueue.current.push(f.id));
    
    // Reset speed tracking for new batch
    speedTracking.current = { bytesUploaded: 0, startTime: Date.now() };
    
    // Start processing
    processQueue();
  }, []);

  // Process upload queue
  const processQueue = useCallback(async () => {
    while (
      uploadQueue.current.length > 0 &&
      activeUploads.current.size < MAX_CONCURRENT_UPLOADS
    ) {
      const fileId = uploadQueue.current.shift();
      if (!fileId) break;
      
      activeUploads.current.add(fileId);
      uploadFile(fileId);
    }
  }, []);

  // Upload single file
  const uploadFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) {
      activeUploads.current.delete(fileId);
      processQueue();
      return;
    }

    // Create abort controller
    const abortController = new AbortController();
    abortControllers.current.set(fileId, abortController);

    // Update status
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: "uploading" as UploadStatus, startedAt: Date.now() }
        : f
    ));

    try {
      // Step 1: Get presigned URL
      const { data: presignedData, error: presignedError } = await supabase.functions.invoke(
        "get-presigned-url",
        {
          body: {
            files: [{
              fileName: file.file.name,
              contentType: file.file.type || "application/octet-stream",
              folder: file.folder,
            }]
          },
        }
      );

      if (presignedError || !presignedData?.success) {
        throw new Error(presignedData?.error || presignedError?.message || "Failed to get presigned URL");
      }

      const urlInfo = presignedData.urls[0];

      // Step 2: Direct upload to R2
      const response = await uploadWithProgress(
        urlInfo.uploadUrl,
        file.file,
        abortController.signal,
        (progress) => {
          setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, progress } : f
          ));
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      // Step 3: Save to database based on folder type
      const { data: { user } } = await supabase.auth.getUser();
      
      if (file.folder === "documents") {
        const { error: dbError } = await supabase
          .from("internal_documents")
          .insert({
            name: file.displayName || file.file.name.replace(/\.[^/.]+$/, ""),
            category: "other",
            file_path: urlInfo.publicUrl,
            file_name: file.file.name,
            file_size: file.file.size,
            content_type: file.file.type || null,
            uploaded_by: user?.id || null,
          });
        
        if (dbError) {
          console.error("DB insert error for document:", dbError);
          // Don't throw - file was uploaded, just DB entry failed
        }
      } else if (file.folder === "picks") {
        const { error: dbError } = await supabase
          .from("images")
          .insert({
            file_name: file.file.name,
            file_path: urlInfo.publicUrl,
            title: file.displayName || file.file.name.replace(/\.[^/.]+$/, ""),
            uploaded_by: user?.id || null,
            folder_id: null, // Will be updated by PicksPanel if needed
          });
        
        if (dbError) {
          console.error("DB insert error for image:", dbError);
          // Don't throw - file was uploaded, just DB entry failed
        }
      }

      // Success
      setFiles(prev => prev.map(f =>
        f.id === fileId
          ? { 
              ...f, 
              status: "success" as UploadStatus, 
              progress: 100, 
              publicUrl: urlInfo.publicUrl,
              r2Key: urlInfo.r2Key,
              savedToDb: true,
            }
          : f
      ));

    } catch (error: any) {
      if (error.name === "AbortError") {
        // Upload was cancelled
        setFiles(prev => prev.filter(f => f.id !== fileId));
      } else {
        console.error(`Upload error for ${fileId}:`, error);
        setFiles(prev => prev.map(f =>
          f.id === fileId
            ? { ...f, status: "error" as UploadStatus, error: error.message }
            : f
        ));
      }
    } finally {
      abortControllers.current.delete(fileId);
      activeUploads.current.delete(fileId);
      processQueue();
    }
  };

  // Upload with XMLHttpRequest for progress
  const uploadWithProgress = (
    url: string,
    file: File,
    signal: AbortSignal,
    onProgress: (progress: number) => void
  ): Promise<Response> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new DOMException("Upload aborted", "AbortError"));
      });

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        resolve(new Response(xhr.response, {
          status: xhr.status,
          statusText: xhr.statusText,
        }));
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new DOMException("Upload aborted", "AbortError"));
      });

      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.send(file);
    });
  };

  // Cancel single upload
  const cancelUpload = useCallback((id: string) => {
    const controller = abortControllers.current.get(id);
    if (controller) {
      controller.abort();
    }
    // Remove from queue if pending
    uploadQueue.current = uploadQueue.current.filter(qId => qId !== id);
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  // Cancel all uploads
  const cancelAllUploads = useCallback(() => {
    abortControllers.current.forEach(controller => controller.abort());
    abortControllers.current.clear();
    uploadQueue.current = [];
    activeUploads.current.clear();
    setFiles([]);
  }, []);

  // Retry failed upload
  const retryUpload = useCallback((id: string) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, status: "pending" as UploadStatus, progress: 0, error: undefined } : f
    ));
    uploadQueue.current.push(id);
    processQueue();
  }, [processQueue]);

  // Clear completed uploads
  const clearCompleted = useCallback(() => {
    setFiles(prev => prev.filter(f => f.status !== "success"));
  }, []);

  // Auto-expand indicator when uploads start
  useEffect(() => {
    if (files.length > 0 && files.some(f => f.status === "pending" || f.status === "uploading")) {
      setIndicatorExpanded(true);
    }
  }, [files]);

  // Process queue when files change
  useEffect(() => {
    if (files.some(f => f.status === "pending")) {
      processQueue();
    }
  }, [files, processQueue]);

  const value: UploadContextType = {
    files,
    isUploading,
    totalProgress,
    estimatedTimeRemaining,
    addFiles,
    cancelUpload,
    cancelAllUploads,
    retryUpload,
    clearCompleted,
    isIndicatorExpanded,
    setIndicatorExpanded,
  };

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  );
};

// ============ HOOK ============

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
};
