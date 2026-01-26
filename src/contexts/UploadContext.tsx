import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateImageVersions, generateFilePaths } from "@/lib/imageResizer";

// ============ TYPES ============

export type UploadStatus = "pending" | "uploading" | "success" | "error";

export interface UploadFile {
  id: string;
  file: File;
  folder: "documents" | "picks";
  folderId?: string | null;
  displayName?: string;
  status: UploadStatus;
  progress: number;
  publicUrl?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  r2Key?: string;
  error?: string;
  startedAt?: number;
  savedToDb?: boolean;
}

export interface UploadContextType {
  files: UploadFile[];
  isUploading: boolean;
  totalProgress: number;
  estimatedTimeRemaining: number | null;
  
  addFiles: (files: File[], folder: "documents" | "picks", options?: { displayNames?: string[]; folderId?: string | null }) => void;
  cancelUpload: (id: string) => void;
  cancelAllUploads: () => void;
  retryUpload: (id: string) => void;
  clearCompleted: () => void;
  
  isIndicatorExpanded: boolean;
  setIndicatorExpanded: (expanded: boolean) => void;
}

const UploadContext = createContext<UploadContextType | null>(null);

const MAX_CONCURRENT_UPLOADS = 5;
const R2_PUBLIC_BASE = "https://pub-4061a33a9b314588bf9fc24f750ecf89.r2.dev";

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isIndicatorExpanded, setIndicatorExpanded] = useState(false);
  
  // Use ref to always have access to latest files
  const filesRef = useRef<UploadFile[]>([]);
  filesRef.current = files;
  
  const activeUploads = useRef<Set<string>>(new Set());
  const uploadQueue = useRef<string[]>([]);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());
  const isProcessing = useRef(false);
  
  const speedTracking = useRef<{ bytesUploaded: number; startTime: number }>({
    bytesUploaded: 0,
    startTime: Date.now(),
  });

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

  const generateId = () => `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Upload with XMLHttpRequest for progress
  const uploadWithProgress = (
    url: string,
    data: Blob | File,
    contentType: string,
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
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.send(data);
    });
  };

  // Upload single file with 3-tier logic for picks
  const uploadSingleFile = async (uploadFile: UploadFile) => {
    const fileId = uploadFile.id;
    
    const abortController = new AbortController();
    abortControllers.current.set(fileId, abortController);

    // Update status to uploading
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: "uploading" as UploadStatus, startedAt: Date.now() }
        : f
    ));

    try {
      console.log(`[Upload] Starting upload for ${uploadFile.file.name}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (uploadFile.folder === "picks" && uploadFile.file.type.startsWith("image/")) {
        // === 3-TIER IMAGE UPLOAD ===
        console.log(`[Upload] Generating thumbnail and preview for ${uploadFile.file.name}...`);
        
        // Generate all 3 versions
        const versions = await generateImageVersions(uploadFile.file);
        const paths = generateFilePaths(uploadFile.file.name, "picks");
        
        // Get presigned URLs for all 3 versions
        const { data: presignedData, error: presignedError } = await supabase.functions.invoke(
          "get-presigned-url",
          {
            body: {
              files: [
                { fileName: "thumbnail.jpg", contentType: "image/jpeg", folder: "picks", customPath: paths.thumbnailPath },
                { fileName: "preview.jpg", contentType: "image/jpeg", folder: "picks", customPath: paths.previewPath },
                { fileName: uploadFile.file.name, contentType: uploadFile.file.type || "image/jpeg", folder: "picks", customPath: paths.originalPath },
              ]
            },
          }
        );

        if (presignedError || !presignedData?.success) {
          throw new Error(presignedData?.error || presignedError?.message || "Failed to get presigned URLs");
        }

        const [thumbnailUrl, previewUrl, originalUrl] = presignedData.urls;

        // Upload all 3 in parallel with combined progress
        let thumbnailProgress = 0;
        let previewProgress = 0;
        let originalProgress = 0;

        const updateCombinedProgress = () => {
          // Weight: thumbnail 10%, preview 30%, original 60%
          const combined = (thumbnailProgress * 0.1) + (previewProgress * 0.3) + (originalProgress * 0.6);
          setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, progress: Math.round(combined) } : f
          ));
        };

        await Promise.all([
          uploadWithProgress(
            thumbnailUrl.uploadUrl,
            versions.thumbnail,
            "image/jpeg",
            abortController.signal,
            (p) => { thumbnailProgress = p; updateCombinedProgress(); }
          ),
          uploadWithProgress(
            previewUrl.uploadUrl,
            versions.preview,
            "image/jpeg",
            abortController.signal,
            (p) => { previewProgress = p; updateCombinedProgress(); }
          ),
          uploadWithProgress(
            originalUrl.uploadUrl,
            versions.original,
            uploadFile.file.type || "image/jpeg",
            abortController.signal,
            (p) => { originalProgress = p; updateCombinedProgress(); }
          ),
        ]);

        console.log(`[Upload] All 3 versions uploaded, saving to database...`);

        // Save to database with all URLs
        const { error: dbError } = await supabase
          .from("images")
          .insert({
            file_name: uploadFile.file.name,
            file_path: originalUrl.publicUrl,
            thumbnail_url: thumbnailUrl.publicUrl,
            preview_url: previewUrl.publicUrl,
            title: uploadFile.displayName || uploadFile.file.name.replace(/\.[^/.]+$/, ""),
            uploaded_by: user?.id || null,
            folder_id: uploadFile.folderId || null,
          });
        
        if (dbError) {
          console.error("DB insert error for image:", dbError);
        }

        // Success
        setFiles(prev => prev.map(f =>
          f.id === fileId
            ? { 
                ...f, 
                status: "success" as UploadStatus, 
                progress: 100, 
                publicUrl: originalUrl.publicUrl,
                thumbnailUrl: thumbnailUrl.publicUrl,
                previewUrl: previewUrl.publicUrl,
                r2Key: originalUrl.r2Key,
                savedToDb: true,
              }
            : f
        ));

      } else {
        // === SINGLE FILE UPLOAD (documents or non-image) ===
        const { data: presignedData, error: presignedError } = await supabase.functions.invoke(
          "get-presigned-url",
          {
            body: {
              files: [{
                fileName: uploadFile.file.name,
                contentType: uploadFile.file.type || "application/octet-stream",
                folder: uploadFile.folder,
              }]
            },
          }
        );

        if (presignedError || !presignedData?.success) {
          throw new Error(presignedData?.error || presignedError?.message || "Failed to get presigned URL");
        }

        const urlInfo = presignedData.urls[0];

        const response = await uploadWithProgress(
          urlInfo.uploadUrl,
          uploadFile.file,
          uploadFile.file.type || "application/octet-stream",
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

        // Save to database
        if (uploadFile.folder === "documents") {
          const { error: dbError } = await supabase
            .from("internal_documents")
            .insert({
              name: uploadFile.displayName || uploadFile.file.name.replace(/\.[^/.]+$/, ""),
              category: "other",
              file_path: urlInfo.publicUrl,
              file_name: uploadFile.file.name,
              file_size: uploadFile.file.size,
              content_type: uploadFile.file.type || null,
              uploaded_by: user?.id || null,
            });
          
          if (dbError) {
            console.error("DB insert error for document:", dbError);
          }
        } else if (uploadFile.folder === "picks") {
          // Non-image file in picks (rare case)
          const { error: dbError } = await supabase
            .from("images")
            .insert({
              file_name: uploadFile.file.name,
              file_path: urlInfo.publicUrl,
              title: uploadFile.displayName || uploadFile.file.name.replace(/\.[^/.]+$/, ""),
              uploaded_by: user?.id || null,
              folder_id: uploadFile.folderId || null,
            });
          
          if (dbError) {
            console.error("DB insert error for image:", dbError);
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
      }

      console.log(`[Upload] Success: ${uploadFile.file.name}`);

    } catch (error: any) {
      if (error.name === "AbortError") {
        setFiles(prev => prev.filter(f => f.id !== fileId));
      } else {
        console.error(`[Upload] Error for ${fileId}:`, error);
        setFiles(prev => prev.map(f =>
          f.id === fileId
            ? { ...f, status: "error" as UploadStatus, error: error.message }
            : f
        ));
      }
    } finally {
      abortControllers.current.delete(fileId);
      activeUploads.current.delete(fileId);
    }
  };

  // Process upload queue
  const processQueue = useCallback(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const process = async () => {
      while (
        uploadQueue.current.length > 0 &&
        activeUploads.current.size < MAX_CONCURRENT_UPLOADS
      ) {
        const fileId = uploadQueue.current.shift();
        if (!fileId) break;
        
        // Get file from ref (always has latest state)
        const file = filesRef.current.find(f => f.id === fileId);
        if (!file) {
          console.log(`[Upload] File ${fileId} not found in state, skipping`);
          continue;
        }
        
        activeUploads.current.add(fileId);
        
        // Start upload without awaiting (parallel)
        uploadSingleFile(file).finally(() => {
          // Check if more files to process
          if (uploadQueue.current.length > 0) {
            process();
          }
        });
      }
      
      isProcessing.current = false;
    };

    process();
  }, []);

  // Add files to queue
  const addFiles = useCallback((newFiles: File[], folder: "documents" | "picks", options?: { displayNames?: string[]; folderId?: string | null }) => {
    const uploadFiles: UploadFile[] = newFiles.map((file, i) => ({
      id: generateId(),
      file,
      folder,
      folderId: options?.folderId,
      displayName: options?.displayNames?.[i] || file.name.replace(/\.[^/.]+$/, ""),
      status: "pending" as UploadStatus,
      progress: 0,
    }));

    console.log(`[Upload] Adding ${uploadFiles.length} files to queue`);

    // Update state and ref synchronously
    setFiles(prev => {
      const newState = [...prev, ...uploadFiles];
      filesRef.current = newState;
      return newState;
    });
    
    // Add to queue
    uploadFiles.forEach(f => uploadQueue.current.push(f.id));
    
    // Reset speed tracking
    speedTracking.current = { bytesUploaded: 0, startTime: Date.now() };
    
    // Start processing after a micro-task to ensure state is updated
    setTimeout(() => processQueue(), 0);
  }, [processQueue]);

  // Cancel single upload
  const cancelUpload = useCallback((id: string) => {
    const controller = abortControllers.current.get(id);
    if (controller) {
      controller.abort();
    }
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
    setFiles(prev => {
      const newState = prev.map(f =>
        f.id === id ? { ...f, status: "pending" as UploadStatus, progress: 0, error: undefined } : f
      );
      filesRef.current = newState;
      return newState;
    });
    uploadQueue.current.push(id);
    setTimeout(() => processQueue(), 0);
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

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
};
