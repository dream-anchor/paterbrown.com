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
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

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
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
      if (files.length === 0) {
        toast({
          title: "Keine Bilder",
          description: "Bitte nur Bilddateien ablegen.",
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

        const [imagesRes, albumsRes, votesRes, rolesRes, profilesRes] = await Promise.all([
          supabase.from("images").select("*").order("created_at", { ascending: false }),
          supabase.from("picks_folders").select("*").order("name"),
          supabase.from("image_votes").select("*"),
          supabase.from("user_roles").select("user_id").eq("role", "admin"),
          supabase.from("traveler_profiles").select("user_id, first_name, last_name"),
        ]);

        if (imagesRes.error) throw imagesRes.error;
        if (albumsRes.error) throw albumsRes.error;
        // votes table might not exist yet, so we handle that gracefully
        if (votesRes.error && !votesRes.error.message.includes("does not exist")) throw votesRes.error;
        if (rolesRes.error) throw rolesRes.error;
        // profiles might not have entries for all users
        const profiles = profilesRes.data || [];

        setImages((imagesRes.data || []) as ImageData[]);
        setAlbums((albumsRes.data || []) as AlbumData[]);
        
        // Enrich votes with user display names from traveler_profiles
        const enrichedVotes: ImageVote[] = (votesRes.data || []).map((vote: any) => {
          const profile = profiles.find((p: any) => p.user_id === vote.user_id);
          return {
            ...vote,
            user_first_name: profile?.first_name || null,
            user_last_name: profile?.last_name || null,
            user_display_name: profile 
              ? `${profile.first_name} ${profile.last_name}`.trim() 
              : null,
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

        // Build user profiles with real names from traveler_profiles
        const userProfiles: UserProfile[] = (rolesRes.data || []).map((role) => {
          const profile = profiles.find((p: any) => p.user_id === role.user_id);
          const displayName = profile 
            ? `${profile.first_name} ${profile.last_name}`.trim()
            : role.user_id.slice(0, 8) + "...";
          return {
            id: role.user_id,
            email: role.user_id,
            displayName: displayName,
          };
        });
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

  // Filter images based on selected users (vote-based)
  const filteredImages = useMemo(() => {
    if (selectedUserIds.length === 0) return currentImages;

    return currentImages.filter((image) => {
      return selectedUserIds.every((userId) =>
        votes.some((v) => v.image_id === image.id && v.user_id === userId && v.vote_status === 'approved')
      );
    });
  }, [currentImages, votes, selectedUserIds]);

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
        })
        .select()
        .single();

      if (error) throw error;
      
      setAlbums((prev) => [...prev, data as AlbumData]);
      setNewAlbumName("");
      setNewAlbumPhotographerName("");
      setNewAlbumPhotographerEmail("");
      setNewAlbumPhotographerPhone("");
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

  // Delete album (with R2 cleanup)
  const handleDeleteAlbum = async (album: AlbumData) => {
    try {
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
      
      // 2. Delete files from R2 if there are any
      if (imagesToDelete.length > 0) {
        const r2FilePaths = imagesToDelete
          .filter((img) => img.file_path.includes("r2.dev"))
          .map((img) => img.file_path);

        if (r2FilePaths.length > 0) {
          console.log(`Deleting ${r2FilePaths.length} files from R2...`);
          
          const { error: deleteError } = await supabase.functions.invoke("delete-files", {
            body: { fileKeys: r2FilePaths },
          });

          if (deleteError) {
            console.error("R2 deletion error:", deleteError);
          }
        }

        // 3. Delete image records from database
        const imageIds = imagesToDelete.map((img) => img.id);
        await supabase.from("image_votes").delete().in("image_id", imageIds);
        await supabase.from("images").delete().in("id", imageIds);
        
        setImages((prev) => prev.filter((img) => !imageIds.includes(img.id)));
        setVotes((prev) => prev.filter((v) => !imageIds.includes(v.image_id)));
      }

      // 4. Delete subalbums recursively
      const deleteSubalbums = async (albumId: string) => {
        const subalbums = albums.filter((a) => a.parent_id === albumId);
        for (const subalbum of subalbums) {
          await deleteSubalbums(subalbum.id);
          await supabase.from("picks_folders").delete().eq("id", subalbum.id);
        }
      };
      await deleteSubalbums(album.id);

      // 5. Delete the album itself
      const { error } = await supabase.from("picks_folders").delete().eq("id", album.id);
      if (error) throw error;

      setAlbums((prev) => prev.filter((a) => a.id !== album.id && a.parent_id !== album.id));
      toast({ 
        title: "Album gelöscht",
        description: imagesToDelete.length > 0 
          ? `${imagesToDelete.length} Bild(er) wurden ebenfalls entfernt`
          : undefined,
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
    
    toast({
      title: "Upload gestartet",
      description: `${files.length} Bild${files.length > 1 ? "er" : ""} werden hochgeladen...`,
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
          setVotes((prev) => prev.map((v) => v.id === existingVote.id ? (data as ImageVote) : v));
        }
      } else {
        // Create new vote
        const { data, error } = await supabase
          .from("image_votes")
          .insert({ user_id: currentUserId, image_id: imageId, vote_status: status })
          .select()
          .single();
        if (error) throw error;
        setVotes((prev) => [...prev, data as ImageVote]);
      }
    } catch (error) {
      console.error("Vote error:", error);
      toast({ title: "Fehler", description: "Bewertung fehlgeschlagen", variant: "destructive" });
    }
  };

  // Delete single image
  const handleDeleteImage = async (image: ImageData) => {
    try {
      if (image.file_path.includes("r2.dev")) {
        await supabase.functions.invoke("delete-files", {
          body: { fileKeys: [image.file_path] },
        });
      } else {
        await supabase.storage.from("picks-images").remove([image.file_path]);
      }

      await supabase.from("image_votes").delete().eq("image_id", image.id);
      const { error } = await supabase.from("images").delete().eq("id", image.id);
      if (error) throw error;

      setImages((prev) => prev.filter((i) => i.id !== image.id));
      setVotes((prev) => prev.filter((v) => v.image_id !== image.id));
      setLightboxImage(null);
      toast({ title: "Gelöscht" });
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Fehler", description: "Löschen fehlgeschlagen", variant: "destructive" });
    }
  };

  // Batch delete selected images
  const handleBatchDelete = async () => {
    const imagesToDelete = images.filter(img => selectedImageIds.has(img.id));
    
    try {
      const r2Paths = imagesToDelete
        .filter(img => img.file_path.includes("r2.dev"))
        .map(img => img.file_path);

      if (r2Paths.length > 0) {
        await supabase.functions.invoke("delete-files", {
          body: { fileKeys: r2Paths },
        });
      }

      const imageIds = imagesToDelete.map(img => img.id);
      await supabase.from("image_votes").delete().in("image_id", imageIds);
      await supabase.from("images").delete().in("id", imageIds);

      setImages(prev => prev.filter(img => !selectedImageIds.has(img.id)));
      setVotes(prev => prev.filter(v => !selectedImageIds.has(v.image_id)));
      setSelectedImageIds(new Set());
      
      toast({ title: `${imageIds.length} Bilder gelöscht` });
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

          <div className="flex items-center gap-2">
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
              accept="image/*"
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
            
            {/* Photographer Info Banner */}
            {(() => {
              const currentAlbum = albums.find((a) => a.id === currentAlbumId);
              if (!currentAlbum?.photographer_name && !currentAlbum?.photographer_email && !currentAlbum?.photographer_phone) return null;
              
              return (
                <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2 text-amber-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                      <circle cx="12" cy="13" r="3"/>
                    </svg>
                    <span className="font-medium">{currentAlbum.photographer_name || 'Fotograf'}</span>
                  </div>
                  {currentAlbum.photographer_email && (
                    <a 
                      href={`mailto:${currentAlbum.photographer_email}`}
                      className="flex items-center gap-1 text-gray-600 hover:text-amber-600 transition-colors"
                      title={currentAlbum.photographer_email}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                      <span className="hidden sm:inline">{currentAlbum.photographer_email}</span>
                    </a>
                  )}
                  {currentAlbum.photographer_phone && (
                    <a 
                      href={`tel:${currentAlbum.photographer_phone}`}
                      className="flex items-center gap-1 text-gray-600 hover:text-amber-600 transition-colors"
                      title={currentAlbum.photographer_phone}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span className="hidden sm:inline">{currentAlbum.photographer_phone}</span>
                    </a>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Filter Info */}
        {selectedUserIds.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Filter className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              Zeige {filteredImages.length} Bild{filteredImages.length !== 1 ? "er" : ""} mit Freigabe von {selectedUserIds.length} Nutzer(n)
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
          <DialogContent className="bg-white sm:max-w-md">
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
                  <div className="grid grid-cols-2 gap-3">
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
      />
    </>
  );
};

export default PicksPanel;
