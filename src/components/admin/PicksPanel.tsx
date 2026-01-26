import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  Check, 
  Users, 
  Image as ImageIcon, 
  Trash2,
  Filter,
  Loader2,
  FolderPlus,
  Folder,
  ChevronRight,
  Home,
  ArrowLeft
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
import { cn } from "@/lib/utils";

interface ImageData {
  id: string;
  file_name: string;
  file_path: string;
  title: string | null;
  folder_id: string | null;
  created_at: string;
}

interface FolderData {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

interface ApprovalData {
  id: string;
  user_id: string;
  image_id: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
}

const PicksPanel = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageData[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [approvals, setApprovals] = useState<ApprovalData[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // New folder dialog
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUserId(session.user.id);
        }

        const [imagesRes, foldersRes, approvalsRes, rolesRes] = await Promise.all([
          supabase.from("images").select("*").order("created_at", { ascending: false }),
          supabase.from("picks_folders").select("*").order("name"),
          supabase.from("approvals").select("*"),
          supabase.from("user_roles").select("user_id").eq("role", "admin"),
        ]);

        if (imagesRes.error) throw imagesRes.error;
        if (foldersRes.error) throw foldersRes.error;
        if (approvalsRes.error) throw approvalsRes.error;
        if (rolesRes.error) throw rolesRes.error;

        setImages(imagesRes.data || []);
        setFolders(foldersRes.data || []);
        setApprovals(approvalsRes.data || []);

        const userProfiles: UserProfile[] = (rolesRes.data || []).map((role) => ({
          id: role.user_id,
          email: role.user_id,
          displayName: role.user_id.slice(0, 8) + "...",
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
    const path: FolderData[] = [];
    let currentId = currentFolderId;
    
    while (currentId) {
      const folder = folders.find((f) => f.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parent_id;
      } else {
        break;
      }
    }
    
    return path;
  }, [currentFolderId, folders]);

  // Get current folder's subfolders
  const currentSubfolders = useMemo(() => {
    return folders.filter((f) => f.parent_id === currentFolderId);
  }, [folders, currentFolderId]);

  // Get current folder's images
  const currentImages = useMemo(() => {
    return images.filter((img) => img.folder_id === currentFolderId);
  }, [images, currentFolderId]);

  // Filter images based on selected users (intersection logic)
  const filteredImages = useMemo(() => {
    if (selectedUserIds.length === 0) return currentImages;

    return currentImages.filter((image) => {
      return selectedUserIds.every((userId) =>
        approvals.some((a) => a.image_id === image.id && a.user_id === userId)
      );
    });
  }, [currentImages, approvals, selectedUserIds]);

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    setIsCreatingFolder(true);
    try {
      const { data, error } = await supabase
        .from("picks_folders")
        .insert({
          name: newFolderName.trim(),
          parent_id: currentFolderId,
          created_by: currentUserId,
        })
        .select()
        .single();

      if (error) throw error;
      
      setFolders((prev) => [...prev, data]);
      setNewFolderName("");
      setShowNewFolderDialog(false);
      
      toast({
        title: "Ordner erstellt",
        description: `"${data.name}" wurde erstellt`,
      });
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Fehler",
        description: "Ordner konnte nicht erstellt werden",
        variant: "destructive",
      });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folder: FolderData) => {
    try {
      const { error } = await supabase.from("picks_folders").delete().eq("id", folder.id);
      if (error) throw error;

      setFolders((prev) => prev.filter((f) => f.id !== folder.id));
      toast({ title: "Ordner gelöscht" });
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Fehler",
        description: "Ordner konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("picks-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase.from("images").insert({
          file_name: file.name,
          file_path: filePath,
          title: file.name.replace(/\.[^/.]+$/, ""),
          uploaded_by: currentUserId,
          folder_id: currentFolderId,
        });

        if (insertError) throw insertError;
      }

      const { data: imagesData } = await supabase
        .from("images")
        .select("*")
        .order("created_at", { ascending: false });
      
      setImages(imagesData || []);

      toast({
        title: "Erfolg",
        description: `${files.length} Bild${files.length > 1 ? "er" : ""} hochgeladen`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Fehler",
        description: "Upload fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // Toggle approval
  const toggleApproval = async (imageId: string) => {
    if (!currentUserId) return;

    const existingApproval = approvals.find(
      (a) => a.image_id === imageId && a.user_id === currentUserId
    );

    try {
      if (existingApproval) {
        const { error } = await supabase.from("approvals").delete().eq("id", existingApproval.id);
        if (error) throw error;
        setApprovals((prev) => prev.filter((a) => a.id !== existingApproval.id));
      } else {
        const { data, error } = await supabase
          .from("approvals")
          .insert({ user_id: currentUserId, image_id: imageId })
          .select()
          .single();
        if (error) throw error;
        setApprovals((prev) => [...prev, data]);
      }
    } catch (error) {
      console.error("Approval toggle error:", error);
      toast({ title: "Fehler", description: "Aktion fehlgeschlagen", variant: "destructive" });
    }
  };

  // Delete image
  const handleDeleteImage = async (image: ImageData) => {
    try {
      await supabase.storage.from("picks-images").remove([image.file_path]);
      const { error } = await supabase.from("images").delete().eq("id", image.id);
      if (error) throw error;

      setImages((prev) => prev.filter((i) => i.id !== image.id));
      setApprovals((prev) => prev.filter((a) => a.image_id !== image.id));
      toast({ title: "Gelöscht" });
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Fehler", description: "Löschen fehlgeschlagen", variant: "destructive" });
    }
  };

  const getImageApprovers = (imageId: string): string[] => {
    return approvals.filter((a) => a.image_id === imageId).map((a) => a.user_id);
  };

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage.from("picks-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const toggleUserFilter = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Picks</h2>
          <p className="text-sm text-gray-500">
            Bilder in Ordnern organisieren und Favoriten markieren
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
                Schnittmenge (alle ausgewählten):
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

          {/* New Folder Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewFolderDialog(true)}
            className="bg-white text-gray-700"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Ordner
          </Button>

          {/* Upload Button */}
          <Label
            htmlFor="image-upload"
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
              "bg-gray-900 text-white hover:bg-gray-800",
              isUploading && "opacity-50 pointer-events-none"
            )}
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Hochladen
          </Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1 text-sm">
        <button
          onClick={() => setCurrentFolderId(null)}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors",
            currentFolderId === null ? "text-gray-900 font-medium" : "text-gray-500"
          )}
        >
          <Home className="w-4 h-4" />
          <span>Picks</span>
        </button>
        
        {breadcrumbPath.map((folder) => (
          <div key={folder.id} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => setCurrentFolderId(folder.id)}
              className={cn(
                "px-2 py-1 rounded hover:bg-gray-100 transition-colors",
                currentFolderId === folder.id ? "text-gray-900 font-medium" : "text-gray-500"
              )}
            >
              {folder.name}
            </button>
          </div>
        ))}
      </div>

      {/* Back Button (when in subfolder) */}
      {currentFolderId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const currentFolder = folders.find((f) => f.id === currentFolderId);
            setCurrentFolderId(currentFolder?.parent_id || null);
          }}
          className="text-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>
      )}

      {/* Filter Info */}
      {selectedUserIds.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <Filter className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-800">
            Zeige {filteredImages.length} Bild{filteredImages.length !== 1 ? "er" : ""} (Schnittmenge von {selectedUserIds.length} Nutzern)
          </span>
        </div>
      )}

      {/* Folders Grid */}
      {currentSubfolders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {currentSubfolders.map((folder) => (
            <Card
              key={folder.id}
              className="group relative p-4 bg-white border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => setCurrentFolderId(folder.id)}
            >
              <div className="flex flex-col items-center gap-2">
                <Folder className="w-10 h-10 text-amber-500" />
                <span className="text-sm font-medium text-gray-900 text-center truncate w-full">
                  {folder.name}
                </span>
                <span className="text-xs text-gray-400">
                  {images.filter((i) => i.folder_id === folder.id).length} Bilder
                </span>
              </div>
              
              {/* Delete folder button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder);
                }}
                className="absolute top-2 right-2 p-1 rounded bg-white/80 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Images Grid */}
      {filteredImages.length === 0 && currentSubfolders.length === 0 ? (
        <Card className="p-12 text-center bg-white border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-1">
            {currentImages.length === 0 ? "Ordner ist leer" : "Keine Treffer"}
          </h3>
          <p className="text-sm text-gray-500">
            {currentImages.length === 0
              ? "Lade Bilder hoch oder erstelle Unterordner"
              : "Passe die Filter an"}
          </p>
        </Card>
      ) : filteredImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredImages.map((image) => {
            const approvers = getImageApprovers(image.id);
            const isApprovedByMe = currentUserId && approvers.includes(currentUserId);

            return (
              <Card
                key={image.id}
                className={cn(
                  "group relative overflow-hidden bg-white border transition-all duration-200",
                  isApprovedByMe
                    ? "border-green-300 ring-2 ring-green-100"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="aspect-square relative">
                  <img
                    src={getImageUrl(image.file_path)}
                    alt={image.title || image.file_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => toggleApproval(image.id)}
                      className={cn(
                        "p-3 rounded-full transition-all",
                        isApprovedByMe
                          ? "bg-green-500 text-white"
                          : "bg-white text-gray-700 hover:bg-green-500 hover:text-white"
                      )}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image)}
                      className="p-3 rounded-full bg-white text-red-600 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {isApprovedByMe && (
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-green-500 text-white shadow-lg">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="p-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 truncate flex-1">
                      {image.title || image.file_name}
                    </span>
                    {approvers.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-600 text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {approvers.length}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Neuer Ordner</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="folder-name" className="text-gray-700">
              Ordnername
            </Label>
            <Input
              id="folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="z.B. Probefotos"
              className="mt-2 bg-white border-gray-200 text-gray-900"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewFolderDialog(false)}
              className="bg-white text-gray-700"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || isCreatingFolder}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              {isCreatingFolder ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <FolderPlus className="w-4 h-4 mr-2" />
              )}
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PicksPanel;
