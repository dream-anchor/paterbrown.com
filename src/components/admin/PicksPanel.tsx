import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/contexts/UploadContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  Users, 
  Image as ImageIcon, 
  Filter,
  Loader2,
  FolderPlus,
  ChevronRight,
  Home,
  ArrowLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { getImageOriginalUrl } from "@/lib/documentUtils";

// Import new components
import { ImageData, AlbumData, VoteStatus, ImageVote, UserProfile } from "./picks/types";
import MasonryImageCard from "./picks/MasonryImageCard";
import AlbumCard from "./picks/AlbumCard";
import ImageLightbox from "./picks/ImageLightbox";
import FloatingActionBar from "./picks/FloatingActionBar";
import MoveToAlbumDialog from "./picks/MoveToAlbumDialog";
import JustifiedGallery from "./picks/JustifiedGallery";

const PicksPanel = () => {
  const { toast } = useToast();
  const { addFiles, files: uploadingFiles, isUploading: globalIsUploading } = useUpload();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get album ID from URL
  const urlAlbumId = searchParams.get("album");
  
  // Data state
  const [images, setImages] = useState<ImageData[]>([]);
  const [albums, setAlbums] = useState<AlbumData[]>([]);
  const [votes, setVotes] = useState<ImageVote[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [minApprovals, setMinApprovals] = useState<number>(0);
  
  // Current album from URL (null = root)
  const currentAlbumId = urlAlbumId || null;
  
  // Update URL when navigating albums
  const setCurrentAlbumId = useCallback((albumId: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (albumId) {
      newParams.set("album", albumId);
    } else {
      newParams.delete("album");
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);
  
  // Selection state
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  // New album dialog
  const [showNewAlbumDialog, setShowNewAlbumDialog] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumPhotographerName, setNewAlbumPhotographerName] = useState("");
  const [newAlbumPhotographerEmail, setNewAlbumPhotographerEmail] = useState("");
  const [newAlbumPhotographerPhone, setNewAlbumPhotographerPhone] = useState("");
  const [newAlbumProjectName, setNewAlbumProjectName] = useState("Pater Brown – Das Live-Hörspiel");
  const [newAlbumContactEmail, setNewAlbumContactEmail] = useState("info@pater-brown.live");
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

  // Edit album dialog
  const [showEditAlbumDialog, setShowEditAlbumDialog] = useState(false);
  const [editAlbumName, setEditAlbumName] = useState("");
  const [editPhotographerName, setEditPhotographerName] = useState("");
  const [editPhotographerEmail, setEditPhotographerEmail] = useState("");
  const [editPhotographerPhone, setEditPhotographerPhone] = useState("");
  const [editProjectName, setEditProjectName] = useState("");
  const [editContactEmail, setEditContactEmail] = useState("");
  const [isSavingAlbum, setIsSavingAlbum] = useState(false);

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState<ImageData | null>(null);

  // Move dialog state
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  
  // Delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: 'image' | 'album' | 'batch'; item?: ImageData | AlbumData } | null>(null);

  // Page-level drag-and-drop
  const [pageDragActive, setPageDragActive] = useState(false);

  // Refresh images when uploads complete
  const completedUploadsCount = uploadingFiles.filter(
    f => f.status === "success" && f.folder === "picks"
  ).length;
  
  useEffect(() => {
    if (completedUploadsCount > 0) {
      const refreshImages = async () => {
        const { data } = await supabase
          .from("images")
          .select("*")
          .is("deleted_at", null)  // Exclude soft-deleted items
          .order("created_at", { ascending: false });
        if (data) setImages(data as ImageData[]);
      };
      refreshImages();
    }
  }, [completedUploadsCount]);

  // Handle page-level drag events
  const handlePageDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types.includes("Files")) {
      setPageDragActive(true);
    }
  }, []);

  const handlePageDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handlePageDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.relatedTarget === null || !(e.relatedTarget as Node).ownerDocument) {
      setPageDragActive(false);
    }
  }, []);

  const handlePageDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPageDragActive(false);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"));
      if (files.length === 0) {
        toast({
          title: "Keine Medien",
          description: "Bitte nur Bild- oder Videodateien ablegen.",
          variant: "destructive",
        });
        return;
      }
      await uploadFiles(files);
    }
  }, [currentAlbumId, currentUserId, toast]);

  // Add global drag listeners
  useEffect(() => {
    document.addEventListener("dragenter", handlePageDragEnter);
    document.addEventListener("dragover", handlePageDragOver);
    document.addEventListener("dragleave", handlePageDragLeave);
    document.addEventListener("drop", handlePageDrop);

    return () => {
      document.removeEventListener("dragenter", handlePageDragEnter);
      document.removeEventListener("dragover", handlePageDragOver);
      document.removeEventListener("dragleave", handlePageDragLeave);
      document.removeEventListener("drop", handlePageDrop);
    };
  }, [handlePageDragEnter, handlePageDragOver, handlePageDragLeave, handlePageDrop]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUserId(session.user.id);
        }

        const [imagesRes, albumsRes, votesRes, adminNamesRes] = await Promise.all([
          supabase.from("images").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
          supabase.from("picks_folders").select("*").is("deleted_at", null).order("name"),
          supabase.from("image_votes").select("*"),
          supabase.rpc("get_admin_user_names"),
        ]);

        if (imagesRes.error) throw imagesRes.error;
        if (albumsRes.error) throw albumsRes.error;
        // votes table might not exist yet, so we handle that gracefully
        if (votesRes.error && !votesRes.error.message.includes("does not exist")) throw votesRes.error;

        // Build name map from RPC result
        const adminNameMap = new Map<string, string>();
        (adminNamesRes.data || []).forEach((row: any) => {
          adminNameMap.set(row.user_id, row.display_name || row.email || "Unbekannt");
        });

        setImages((imagesRes.data || []) as ImageData[]);
        setAlbums((albumsRes.data || []) as AlbumData[]);

        // Enrich votes with user display names from admin name map
        const enrichedVotes: ImageVote[] = (votesRes.data || []).map((vote: any) => {
          const displayName = adminNameMap.get(vote.user_id) || null;
          return {
            ...vote,
            user_first_name: null,
            user_last_name: null,
            user_display_name: displayName,
          };
        });
        setVotes(enrichedVotes as ImageVote[]);

        // Preload first 6 thumbnails for instant display
        const firstImages = (imagesRes.data || []).slice(0, 6) as ImageData[];
        firstImages.forEach((img) => {
          if (img.thumbnail_url) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = img.thumbnail_url;
            link.fetchPriority = 'high';
            document.head.appendChild(link);
          }
        });

        // Build user list from admin names (unique users who appear in votes OR in admin role)
        const userProfiles: UserProfile[] = Array.from(adminNameMap.entries()).map(([userId, displayName]) => ({
          id: userId,
          email: userId,
          displayName,
        }));
        setUsers(userProfiles);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Fehler",
          description: "Daten konnten nicht geladen werden",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Get breadcrumb path
  const breadcrumbPath = useMemo(() => {
    const path: AlbumData[] = [];
    let currentId = currentAlbumId;
    
    while (currentId) {
      const album = albums.find((a) => a.id === currentId);
      if (album) {
        path.unshift(album);
        currentId = album.parent_id;
      } else {
        break;
      }
    }
    
    return path;
  }, [currentAlbumId, albums]);

  // Get current album's subalbums
  const currentSubalbums = useMemo(() => {
    return albums.filter((a) => a.parent_id === currentAlbumId);
  }, [albums, currentAlbumId]);

  // Get current album's images
  const currentImages = useMemo(() => {
    return images.filter((img) => img.folder_id === currentAlbumId);
  }, [images, currentAlbumId]);

  // Filter images based on selected users and/or minimum approval count
  const filteredImages = useMemo(() => {
    let result = currentImages;

    // Per-user intersection filter (all selected users must have approved)
    if (selectedUserIds.length > 0) {
      result = result.filter((image) =>
        selectedUserIds.every((userId) =>
          votes.some((v) => v.image_id === image.id && v.user_id === userId && v.vote_status === 'approved')
        )
      );
    }

    // Minimum approvals threshold (count across ALL admin users)
    if (minApprovals > 0) {
      result = result.filter((image) => {
        const approvalCount = votes.filter(
          (v) => v.image_id === image.id && v.vote_status === 'approved'
        ).length;
        return approvalCount >= minApprovals;
      });
    }

    return result;
  }, [currentImages, votes, selectedUserIds, minApprovals]);

  // Check if current user can delete an item
  const canDeleteItem = useCallback((item: ImageData | AlbumData) => {
    if (!currentUserId) return false;
    if ('uploaded_by' in item) {
      return item.uploaded_by === currentUserId;
    }
    if ('created_by' in item) {
      return item.created_by === currentUserId;
    }
    return false;
  }, [currentUserId]);

  // Create new album
  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;
    
    setIsCreatingAlbum(true);
    try {
      const { data, error } = await supabase
        .from("picks_folders")
        .insert({
          name: newAlbumName.trim(),
          parent_id: currentAlbumId,
          created_by: currentUserId,
          photographer_name: newAlbumPhotographerName.trim() || null,
          photographer_email: newAlbumPhotographerEmail.trim() || null,
          photographer_phone: newAlbumPhotographerPhone.trim() || null,
          project_name: newAlbumProjectName.trim() || null,
          contact_email: newAlbumContactEmail.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setAlbums((prev) => [...prev, data as AlbumData]);
      setNewAlbumName("");
      setNewAlbumPhotographerName("");
      setNewAlbumPhotographerEmail("");
      setNewAlbumPhotographerPhone("");
      setNewAlbumProjectName("Pater Brown – Das Live-Hörspiel");
      setNewAlbumContactEmail("info@pater-brown.live");
      setShowNewAlbumDialog(false);
      
      toast({
        title: "Album erstellt",
        description: `"${data.name}" wurde erstellt`,
      });
    } catch (error) {
      console.error("Error creating album:", error);
      toast({
        title: "Fehler",
        description: "Album konnte nicht erstellt werden",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  // Open edit album dialog
  const openEditAlbumDialog = () => {
    const currentAlbum = albums.find((a) => a.id === currentAlbumId);
    if (currentAlbum) {
      setEditAlbumName(currentAlbum.name);
      setEditPhotographerName(currentAlbum.photographer_name || "");
      setEditPhotographerEmail(currentAlbum.photographer_email || "");
      setEditPhotographerPhone(currentAlbum.photographer_phone || "");
      setEditProjectName(currentAlbum.project_name || "Pater Brown – Das Live-Hörspiel");
      setEditContactEmail(currentAlbum.contact_email || "info@pater-brown.live");
      setShowEditAlbumDialog(true);
    }
  };

  // Save album info
  const handleSaveAlbum = async () => {
    if (!currentAlbumId || !editAlbumName.trim()) return;
    
    setIsSavingAlbum(true);
    try {
      const { data, error } = await supabase
        .from("picks_folders")
        .update({
          name: editAlbumName.trim(),
          photographer_name: editPhotographerName.trim() || null,
          photographer_email: editPhotographerEmail.trim() || null,
          photographer_phone: editPhotographerPhone.trim() || null,
          project_name: editProjectName.trim() || null,
          contact_email: editContactEmail.trim() || null,
        })
        .eq("id", currentAlbumId)
        .select()
        .single();

      if (error) throw error;
      
      setAlbums((prev) => prev.map((a) => a.id === currentAlbumId ? (data as AlbumData) : a));
      setShowEditAlbumDialog(false);
      
      toast({
        title: "Gespeichert",
        description: "Album wurde aktualisiert",
      });
    } catch (error) {
      console.error("Error updating album:", error);
      toast({
        title: "Fehler",
        description: "Speichern fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setIsSavingAlbum(false);
    }
  };

  // Soft delete album (move to trash with all images)
  const handleDeleteAlbum = async (album: AlbumData) => {
    try {
      const now = new Date().toISOString();
      
      // 1. Get all images in this album (and recursively in subalbums)
      const getAllImagesInAlbum = async (albumId: string): Promise<ImageData[]> => {
        const albumImages = images.filter((img) => img.folder_id === albumId);
        const subalbums = albums.filter((a) => a.parent_id === albumId);
        
        let allImages = [...albumImages];
        for (const subalbum of subalbums) {
          const subImages = await getAllImagesInAlbum(subalbum.id);
          allImages = [...allImages, ...subImages];
        }
        return allImages;
      };

      const imagesToDelete = await getAllImagesInAlbum(album.id);
      
      // 2. Soft delete all images in this album
      if (imagesToDelete.length > 0) {
        const imageIds = imagesToDelete.map((img) => img.id);
        await supabase
          .from("images")
          .update({ deleted_at: now, deleted_by: currentUserId })
          .in("id", imageIds);
        
        setImages((prev) => prev.filter((img) => !imageIds.includes(img.id)));
        setVotes((prev) => prev.filter((v) => !imageIds.includes(v.image_id)));
      }

      // 3. Soft delete subalbums recursively
      const softDeleteSubalbums = async (albumId: string) => {
        const subalbums = albums.filter((a) => a.parent_id === albumId);
        for (const subalbum of subalbums) {
          await softDeleteSubalbums(subalbum.id);
          await supabase
            .from("picks_folders")
            .update({ deleted_at: now, deleted_by: currentUserId })
            .eq("id", subalbum.id);
        }
      };
      await softDeleteSubalbums(album.id);

      // 4. Soft delete the album itself
      const { error } = await supabase
        .from("picks_folders")
        .update({ deleted_at: now, deleted_by: currentUserId })
        .eq("id", album.id);
        
      if (error) throw error;

      // Remove from local state
      const deletedAlbumIds = new Set<string>();
      const collectDeletedAlbumIds = (parentId: string) => {
        deletedAlbumIds.add(parentId);
        albums.filter(a => a.parent_id === parentId).forEach(a => collectDeletedAlbumIds(a.id));
      };
      collectDeletedAlbumIds(album.id);

      setAlbums((prev) => prev.filter((a) => !deletedAlbumIds.has(a.id)));
      
      toast({ 
        title: "In Papierkorb verschoben",
        description: imagesToDelete.length > 0 
          ? `Album mit ${imagesToDelete.length} Bild(ern) kann 90 Tage wiederhergestellt werden`
          : "Kann 90 Tage lang wiederhergestellt werden",
      });
    } catch (error) {
      console.error("Error deleting album:", error);
      toast({
        title: "Fehler",
        description: "Album konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  // Upload files helper
  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    
    addFiles(files, "picks", { folderId: currentAlbumId });
    
    const videoCount = files.filter(f => f.type.startsWith("video/")).length;
    const imageCount = files.length - videoCount;
    const parts: string[] = [];
    if (imageCount > 0) parts.push(`${imageCount} Bild${imageCount > 1 ? "er" : ""}`);
    if (videoCount > 0) parts.push(`${videoCount} Video${videoCount > 1 ? "s" : ""}`);
    toast({
      title: "Upload gestartet",
      description: `${parts.join(" und ")} ${files.length > 1 ? "werden" : "wird"} hochgeladen...`,
    });
  };

  // Handle file upload from input
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
    e.target.value = "";
  };

  // Vote on an image
  const handleVote = async (imageId: string, status: VoteStatus) => {
    if (!currentUserId) return;

    const existingVote = votes.find(
      (v) => v.image_id === imageId && v.user_id === currentUserId
    );

    try {
      if (existingVote) {
        if (existingVote.vote_status === status) {
          // Remove vote if clicking same status
          const { error } = await supabase.from("image_votes").delete().eq("id", existingVote.id);
          if (error) throw error;
          setVotes((prev) => prev.filter((v) => v.id !== existingVote.id));
        } else {
          // Update vote status
          const { data, error } = await supabase
            .from("image_votes")
            .update({ vote_status: status })
            .eq("id", existingVote.id)
            .select()
            .single();
          if (error) throw error;
          // Preserve enriched fields (user_display_name etc.) from existing vote
          setVotes((prev) => prev.map((v) => v.id === existingVote.id ? { ...existingVote, vote_status: status } : v));
        }
      } else {
        // Create new vote
        const { data, error } = await supabase
          .from("image_votes")
          .insert({ user_id: currentUserId, image_id: imageId, vote_status: status })
          .select()
          .single();
        if (error) throw error;
        // Enrich with display name so vote list shows real name instead of UUID
        const myProfile = users.find(u => u.id === currentUserId);
        setVotes((prev) => [...prev, { ...(data as ImageVote), user_display_name: myProfile?.displayName || null }]);
      }
    } catch (error) {
      console.error("Vote error:", error);
      toast({ title: "Fehler", description: "Bewertung fehlgeschlagen", variant: "destructive" });
    }
  };

  // Soft delete single image (move to trash)
  const handleDeleteImage = async (image: ImageData) => {
    try {
      // Soft delete: set deleted_at instead of hard delete
      const { error } = await supabase
        .from("images")
        .update({ 
          deleted_at: new Date().toISOString(),
          deleted_by: currentUserId
        })
        .eq("id", image.id);

      if (error) throw error;

      // Remove from local state (it's now in trash)
      setImages((prev) => prev.filter((i) => i.id !== image.id));
      setVotes((prev) => prev.filter((v) => v.image_id !== image.id));
      setLightboxImage(null);
      toast({ 
        title: "In Papierkorb", 
        description: "Kann 90 Tage lang wiederhergestellt werden"
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Fehler", description: "Löschen fehlgeschlagen", variant: "destructive" });
    }
  };

  // Batch soft delete selected images
  const handleBatchDelete = async () => {
    const imagesToDelete = images.filter(img => selectedImageIds.has(img.id));
    
    try {
      const imageIds = imagesToDelete.map(img => img.id);
      
      // Soft delete: set deleted_at for all selected images
      const { error } = await supabase
        .from("images")
        .update({ 
          deleted_at: new Date().toISOString(),
          deleted_by: currentUserId
        })
        .in("id", imageIds);

      if (error) throw error;

      setImages(prev => prev.filter(img => !selectedImageIds.has(img.id)));
      setVotes(prev => prev.filter(v => !selectedImageIds.has(v.image_id)));
      setSelectedImageIds(new Set());
      
      toast({ 
        title: `${imageIds.length} Bilder in Papierkorb`,
        description: "Können 90 Tage lang wiederhergestellt werden"
      });
    } catch (error) {
      console.error("Batch delete error:", error);
      toast({ title: "Fehler", description: "Batch-Löschen fehlgeschlagen", variant: "destructive" });
    }
  };

  // Batch vote
  const handleBatchVote = async (status: VoteStatus) => {
    if (!currentUserId) return;
    
    try {
      for (const imageId of selectedImageIds) {
        const existingVote = votes.find(
          v => v.image_id === imageId && v.user_id === currentUserId
        );

        if (existingVote) {
          await supabase
            .from("image_votes")
            .update({ vote_status: status })
            .eq("id", existingVote.id);
        } else {
          await supabase
            .from("image_votes")
            .insert({ user_id: currentUserId, image_id: imageId, vote_status: status });
        }
      }

      // Refresh votes
      const { data } = await supabase.from("image_votes").select("*");
      if (data) setVotes(data as ImageVote[]);
      
      setSelectedImageIds(new Set());
      toast({ title: `${selectedImageIds.size} Bilder bewertet` });
    } catch (error) {
      console.error("Batch vote error:", error);
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  // Move images to album
  const handleMoveImages = async (targetAlbumId: string | null) => {
    try {
      await supabase
        .from("images")
        .update({ folder_id: targetAlbumId })
        .in("id", Array.from(selectedImageIds));

      setImages(prev => prev.map(img => 
        selectedImageIds.has(img.id) 
          ? { ...img, folder_id: targetAlbumId }
          : img
      ));
      
      setSelectedImageIds(new Set());
      toast({ title: "Bilder verschoben" });
    } catch (error) {
      console.error("Move error:", error);
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  // Create album and move images
  const handleCreateAlbumAndMove = async (albumName: string) => {
    try {
      const { data: newAlbum, error } = await supabase
        .from("picks_folders")
        .insert({
          name: albumName,
          parent_id: currentAlbumId,
          created_by: currentUserId,
        })
        .select()
        .single();

      if (error) throw error;
      
      setAlbums(prev => [...prev, newAlbum as AlbumData]);
      await handleMoveImages(newAlbum.id);
    } catch (error) {
      console.error("Create and move error:", error);
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  // Selection handling
  const handleSelectImage = (imageId: string, addToSelection: boolean) => {
    setSelectedImageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        if (!addToSelection) {
          newSet.clear();
        }
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  // Lightbox navigation
  const handleLightboxNavigate = (direction: 'prev' | 'next') => {
    if (!lightboxImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === lightboxImage.id);
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < filteredImages.length) {
      setLightboxImage(filteredImages[newIndex]);
    }
  };

  // Download image
  const handleDownloadImage = (image: ImageData) => {
    const url = getImageOriginalUrl("picks-images", image.file_path);
    const link = document.createElement("a");
    link.href = url;
    link.download = image.file_name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleUserFilter = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Check if all selected images are owned by current user
  const canDeleteSelected = useMemo(() => {
    if (selectedImageIds.size === 0 || !currentUserId) return false;
    return Array.from(selectedImageIds).every(id => {
      const img = images.find(i => i.id === id);
      return img?.uploaded_by === currentUserId;
    });
  }, [selectedImageIds, images, currentUserId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      {/* Page-level drop overlay */}
      {pageDragActive && (
        <div className="fixed inset-0 z-50 bg-amber-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-dashed border-amber-500 p-12 text-center">
            <Upload className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-900">Bilder hier ablegen</p>
            <p className="text-gray-500 mt-1">zum Hochladen in dieses Album</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Picks</h2>
            <p className="text-sm text-gray-500">
              Bilder in Alben organisieren und mit Ampel-System bewerten
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Schnittmenge Threshold Buttons */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
              <button
                onClick={() => setMinApprovals(0)}
                className={cn(
                  "px-3 py-1.5 transition-colors min-h-[44px]",
                  minApprovals === 0 ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                Alle
              </button>
              <button
                onClick={() => setMinApprovals(2)}
                className={cn(
                  "px-3 py-1.5 border-l border-gray-200 transition-colors min-h-[44px]",
                  minApprovals === 2 ? "bg-amber-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                2+ ✓
              </button>
              <button
                onClick={() => setMinApprovals(users.length || 3)}
                className={cn(
                  "px-3 py-1.5 border-l border-gray-200 transition-colors min-h-[44px]",
                  minApprovals > 2 ? "bg-green-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                Alle ✓
              </button>
            </div>

            {/* User Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white text-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {selectedUserIds.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700">
                      {selectedUserIds.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white min-w-[200px]">
                <div className="px-2 py-1.5 text-xs font-medium text-gray-500">
                  Nur Freigaben von:
                </div>
                {users.map((user) => (
                  <DropdownMenuCheckboxItem
                    key={user.id}
                    checked={selectedUserIds.includes(user.id)}
                    onCheckedChange={() => toggleUserFilter(user.id)}
                    className="text-gray-700"
                  >
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    {user.displayName}
                  </DropdownMenuCheckboxItem>
                ))}
                {selectedUserIds.length > 0 && (
                  <button
                    onClick={() => setSelectedUserIds([])}
                    className="w-full px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 text-left border-t border-gray-100 mt-1"
                  >
                    Filter zurücksetzen
                  </button>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* New Album Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewAlbumDialog(true)}
              className="bg-white text-gray-700"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Album
            </Button>

            {/* Upload Button */}
            <Label
              htmlFor="image-upload"
              className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                "bg-gray-900 text-white hover:bg-gray-800",
                globalIsUploading && "opacity-50 pointer-events-none"
              )}
            >
              {globalIsUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Hochladen
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*,video/mp4,video/quicktime,video/webm,video/x-m4v"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={globalIsUploading}
            />
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1 text-sm">
          <button
            onClick={() => setCurrentAlbumId(null)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors",
              currentAlbumId === null ? "text-gray-900 font-medium" : "text-gray-500"
            )}
          >
            <Home className="w-4 h-4" />
            <span>Picks</span>
          </button>
          
          {breadcrumbPath.map((album) => (
            <div key={album.id} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => setCurrentAlbumId(album.id)}
                className={cn(
                  "px-2 py-1 rounded hover:bg-gray-100 transition-colors",
                  currentAlbumId === album.id ? "text-gray-900 font-medium" : "text-gray-500"
                )}
              >
                {album.name}
              </button>
            </div>
          ))}
        </div>

        {/* Back Button + Photographer Info */}
        {currentAlbumId && (
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const currentAlbum = albums.find((a) => a.id === currentAlbumId);
                setCurrentAlbumId(currentAlbum?.parent_id || null);
              }}
              className="text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            
            {/* Album Edit Button - Neutral style like Drops */}
            {(() => {
              const currentAlbum = albums.find((a) => a.id === currentAlbumId);
              const hasPhotographer = currentAlbum?.photographer_name;
              
              return (
                <button
                  onClick={openEditAlbumDialog}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                  title="Album bearbeiten"
                >
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      <path d="m15 5 4 4"/>
                    </svg>
                    <span className="font-medium">Bearbeiten</span>
                  </div>
                  {hasPhotographer && (
                    <span className="text-slate-400 hidden sm:inline text-xs">
                      📷 {currentAlbum.photographer_name}
                    </span>
                  )}
                </button>
              );
            })()}
          </div>
        )}

        {/* Filter Info */}
        {selectedUserIds.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Filter className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              Schnittmenge:{" "}
              <strong>
                {users
                  .filter((u) => selectedUserIds.includes(u.id))
                  .map((u) => u.displayName)
                  .join(" & ")}
              </strong>
              {" — "}
              {filteredImages.length} {filteredImages.length !== 1 ? "Fotos" : "Foto"}
            </span>
          </div>
        )}

        {/* Albums Grid - Modern card layout */}
        {currentSubalbums.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Alben
              </h3>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {currentSubalbums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  imageCount={images.filter(i => i.folder_id === album.id).length}
                  previewImages={images.filter(i => i.folder_id === album.id).slice(0, 4)}
                  currentUserId={currentUserId}
                  onOpen={(a) => setCurrentAlbumId(a.id)}
                  onDelete={(a) => setDeleteConfirmation({ type: 'album', item: a })}
                  canDelete={canDeleteItem(album)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Masonry Image Grid */}
        {filteredImages.length === 0 && currentSubalbums.length === 0 ? (
          <Card className="p-12 text-center bg-white border-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-1">
              {currentImages.length === 0 ? "Album ist leer" : "Keine Treffer"}
            </h3>
            <p className="text-sm text-gray-500">
              {currentImages.length === 0
                ? "Lade Bilder hoch oder erstelle Unteralben"
                : "Passe die Filter an"}
            </p>
          </Card>
        ) : filteredImages.length > 0 && (
          <JustifiedGallery
            images={filteredImages}
            votes={votes}
            currentUserId={currentUserId}
            selectedImageIds={selectedImageIds}
            onSelect={handleSelectImage}
            onOpen={setLightboxImage}
            onVote={handleVote}
            targetRowHeight={220}
            gap={4}
          />
        )}

        {/* New Album Dialog */}
        <Dialog open={showNewAlbumDialog} onOpenChange={setShowNewAlbumDialog}>
          <DialogContent className="bg-white sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Neues Album</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="album-name" className="text-gray-700">
                  Albumname *
                </Label>
                <Input
                  id="album-name"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="z.B. Probefotos"
                  className="mt-2 bg-white border-gray-200 text-gray-900"
                />
              </div>
              
              {/* Photographer Info Section */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3">Fotograf (optional)</p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="photographer-name" className="text-gray-600 text-sm">
                      Name
                    </Label>
                    <Input
                      id="photographer-name"
                      value={newAlbumPhotographerName}
                      onChange={(e) => setNewAlbumPhotographerName(e.target.value)}
                      placeholder="z.B. Max Mustermann"
                      className="mt-1 bg-white border-gray-200 text-gray-900"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="photographer-email" className="text-gray-600 text-sm">
                        E-Mail
                      </Label>
                      <Input
                        id="photographer-email"
                        type="email"
                        value={newAlbumPhotographerEmail}
                        onChange={(e) => setNewAlbumPhotographerEmail(e.target.value)}
                        placeholder="foto@example.de"
                        className="mt-1 bg-white border-gray-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <Label htmlFor="photographer-phone" className="text-gray-600 text-sm">
                        Telefon
                      </Label>
                      <Input
                        id="photographer-phone"
                        type="tel"
                        value={newAlbumPhotographerPhone}
                        onChange={(e) => setNewAlbumPhotographerPhone(e.target.value)}
                        placeholder="+49 123 456789"
                        className="mt-1 bg-white border-gray-200 text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="project-name" className="text-gray-600 text-sm">
                      Projekt
                    </Label>
                    <Input
                      id="project-name"
                      value={newAlbumProjectName}
                      onChange={(e) => setNewAlbumProjectName(e.target.value)}
                      placeholder="Pater Brown – Das Live-Hörspiel"
                      className="mt-1 bg-white border-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email" className="text-gray-600 text-sm">
                      Kontakt-E-Mail (Bildrechte)
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={newAlbumContactEmail}
                      onChange={(e) => setNewAlbumContactEmail(e.target.value)}
                      placeholder="info@pater-brown.live"
                      className="mt-1 bg-white border-gray-200 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNewAlbumDialog(false)}
                className="bg-white text-gray-700"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleCreateAlbum}
                disabled={!newAlbumName.trim() || isCreatingAlbum}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                {isCreatingAlbum ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <FolderPlus className="w-4 h-4 mr-2" />
                )}
                Erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Album Dialog */}
        <Dialog open={showEditAlbumDialog} onOpenChange={setShowEditAlbumDialog}>
          <DialogContent className="bg-white sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Album bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {/* Album Name */}
              <div>
                <Label htmlFor="edit-album-name" className="text-gray-700">
                  Albumname *
                </Label>
                <Input
                  id="edit-album-name"
                  value={editAlbumName}
                  onChange={(e) => setEditAlbumName(e.target.value)}
                  placeholder="z.B. Probefotos"
                  className="mt-2 bg-white border-gray-200 text-gray-900"
                />
              </div>
              
              {/* Photographer Section */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3">Fotograf (optional)</p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="edit-photographer-name" className="text-gray-600 text-sm">
                      Name
                    </Label>
                    <Input
                      id="edit-photographer-name"
                      value={editPhotographerName}
                      onChange={(e) => setEditPhotographerName(e.target.value)}
                      placeholder="z.B. Max Mustermann"
                      className="mt-1 bg-white border-gray-200 text-gray-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="edit-photographer-email" className="text-gray-600 text-sm">
                        E-Mail
                      </Label>
                      <Input
                        id="edit-photographer-email"
                        type="email"
                        value={editPhotographerEmail}
                        onChange={(e) => setEditPhotographerEmail(e.target.value)}
                        placeholder="foto@example.de"
                        className="mt-1 bg-white border-gray-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-photographer-phone" className="text-gray-600 text-sm">
                        Telefon
                      </Label>
                      <Input
                        id="edit-photographer-phone"
                        type="tel"
                        value={editPhotographerPhone}
                        onChange={(e) => setEditPhotographerPhone(e.target.value)}
                        placeholder="+49 123 456789"
                        className="mt-1 bg-white border-gray-200 text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-project-name" className="text-gray-600 text-sm">
                      Projekt
                    </Label>
                    <Input
                      id="edit-project-name"
                      value={editProjectName}
                      onChange={(e) => setEditProjectName(e.target.value)}
                      placeholder="Pater Brown – Das Live-Hörspiel"
                      className="mt-1 bg-white border-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-contact-email" className="text-gray-600 text-sm">
                      Kontakt-E-Mail (Bildrechte)
                    </Label>
                    <Input
                      id="edit-contact-email"
                      type="email"
                      value={editContactEmail}
                      onChange={(e) => setEditContactEmail(e.target.value)}
                      placeholder="info@pater-brown.live"
                      className="mt-1 bg-white border-gray-200 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditAlbumDialog(false)}
                className="bg-white text-gray-700"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSaveAlbum}
                disabled={!editAlbumName.trim() || isSavingAlbum}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                {isSavingAlbum ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog 
          open={deleteConfirmation !== null} 
          onOpenChange={(open) => !open && setDeleteConfirmation(null)}
        >
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900">
                {deleteConfirmation?.type === 'album' 
                  ? 'Album löschen?' 
                  : deleteConfirmation?.type === 'batch'
                    ? `${selectedImageIds.size} Bilder löschen?`
                    : 'Bild löschen?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deleteConfirmation?.type === 'album' 
                  ? 'Alle Bilder in diesem Album werden ebenfalls unwiderruflich gelöscht.'
                  : 'Diese Aktion kann nicht rückgängig gemacht werden.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white text-gray-700">
                Abbrechen
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteConfirmation?.type === 'album' && deleteConfirmation.item) {
                    handleDeleteAlbum(deleteConfirmation.item as AlbumData);
                  } else if (deleteConfirmation?.type === 'image' && deleteConfirmation.item) {
                    handleDeleteImage(deleteConfirmation.item as ImageData);
                  } else if (deleteConfirmation?.type === 'batch') {
                    handleBatchDelete();
                  }
                  setDeleteConfirmation(null);
                }}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Move to Album Dialog */}
        <MoveToAlbumDialog
          open={showMoveDialog}
          onOpenChange={setShowMoveDialog}
          albums={albums}
          currentAlbumId={currentAlbumId}
          selectedCount={selectedImageIds.size}
          onMove={handleMoveImages}
          onCreateAndMove={handleCreateAlbumAndMove}
        />
      </div>

      {/* Floating Action Bar */}
      <FloatingActionBar
        selectedCount={selectedImageIds.size}
        onBatchVote={handleBatchVote}
        onBatchDelete={() => setDeleteConfirmation({ type: 'batch' })}
        onBatchMove={() => setShowMoveDialog(true)}
        onClearSelection={() => setSelectedImageIds(new Set())}
        canDelete={canDeleteSelected}
        onSendViaDrops={selectedImageIds.size > 0 ? async () => {
          const ids = Array.from(selectedImageIds);
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Credits: alle Fotografen aller beteiligten Alben aggregieren
          const selectedImageList = images.filter(img => selectedImageIds.has(img.id));
          const uniqueAlbumIds = [...new Set(
            selectedImageList.map(img => img.folder_id).filter((id): id is string => !!id)
          )];
          const photographerName = [...new Set(
            uniqueAlbumIds
              .map(id => albums.find(a => a.id === id)?.photographer_name)
              .filter((name): name is string => !!name)
          )].join(", ");
          const firstAlbum = uniqueAlbumIds.length > 0 ? albums.find(a => a.id === uniqueAlbumIds[0]) : null;
          const projectName = firstAlbum?.project_name || "Pater Brown – Das Live-Hörspiel";
          const contactEmail = firstAlbum?.contact_email || "info@pater-brown.live";

          await supabase
            .from("pending_drops")
            .delete()
            .eq("created_by", user.id)
            .eq("status", "pending");

          const { error } = await supabase
            .from("pending_drops")
            .insert({
              created_by: user.id,
              image_ids: ids,
              label: `${ids.length} Medien aus Picks`,
              photographer_name: photographerName,
              project_name: projectName,
              contact_email: contactEmail,
            });

          if (error) {
            toast({ title: "Fehler", description: "Paket konnte nicht erstellt werden.", variant: "destructive" });
            return;
          }

          toast({ title: `✓ ${ids.length} Medien als Paket vorbereitet`, description: "Wechsle zu Drops…" });
          setSearchParams({ tab: "documents" });
        } : undefined}
      />

      {/* Lightbox */}
      <ImageLightbox
        image={lightboxImage}
        images={filteredImages}
        votes={votes}
        currentUserId={currentUserId}
        onClose={() => setLightboxImage(null)}
        onNavigate={handleLightboxNavigate}
        onVote={handleVote}
        onDownload={handleDownloadImage}
        onDelete={(img) => setDeleteConfirmation({ type: 'image', item: img })}
        canDelete={lightboxImage ? canDeleteItem(lightboxImage) : false}
        selectedImageIds={selectedImageIds}
        onToggleDrops={(id) => setSelectedImageIds(prev => {
          const next = new Set(prev);
          if (next.has(id)) { next.delete(id); } else { next.add(id); }
          return next;
        })}
      />

    </>
  );
};

export default PicksPanel;
