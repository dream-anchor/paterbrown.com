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
  X, 
  Users, 
  Image as ImageIcon, 
  Trash2,
  Filter,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ImageData {
  id: string;
  file_name: string;
  file_path: string;
  title: string | null;
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
  const [approvals, setApprovals] = useState<ApprovalData[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Fetch current user, images, approvals, and users
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUserId(session.user.id);
        }

        // Fetch images
        const { data: imagesData, error: imagesError } = await supabase
          .from("images")
          .select("*")
          .order("created_at", { ascending: false });

        if (imagesError) throw imagesError;
        setImages(imagesData || []);

        // Fetch all approvals (admin can see all)
        const { data: approvalsData, error: approvalsError } = await supabase
          .from("approvals")
          .select("*");

        if (approvalsError) throw approvalsError;
        setApprovals(approvalsData || []);

        // Fetch users with admin role for the filter
        const { data: rolesData, error: rolesError } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin");

        if (rolesError) throw rolesError;

        // Get user emails from auth (we'll use user_id as fallback)
        const userProfiles: UserProfile[] = (rolesData || []).map((role) => ({
          id: role.user_id,
          email: role.user_id, // Will be replaced if we can get email
          displayName: role.user_id.slice(0, 8) + "...", // Fallback display name
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

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Upload to storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("picks-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create database entry
        const { error: insertError } = await supabase.from("images").insert({
          file_name: file.name,
          file_path: filePath,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for title
          uploaded_by: currentUserId,
        });

        if (insertError) throw insertError;
      }

      // Refresh images
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
      e.target.value = ""; // Reset input
    }
  };

  // Toggle approval for current user
  const toggleApproval = async (imageId: string) => {
    if (!currentUserId) return;

    const existingApproval = approvals.find(
      (a) => a.image_id === imageId && a.user_id === currentUserId
    );

    try {
      if (existingApproval) {
        // Remove approval
        const { error } = await supabase
          .from("approvals")
          .delete()
          .eq("id", existingApproval.id);

        if (error) throw error;
        setApprovals((prev) => prev.filter((a) => a.id !== existingApproval.id));
      } else {
        // Add approval
        const { data, error } = await supabase
          .from("approvals")
          .insert({
            user_id: currentUserId,
            image_id: imageId,
          })
          .select()
          .single();

        if (error) throw error;
        setApprovals((prev) => [...prev, data]);
      }
    } catch (error) {
      console.error("Approval toggle error:", error);
      toast({
        title: "Fehler",
        description: "Aktion fehlgeschlagen",
        variant: "destructive",
      });
    }
  };

  // Delete image
  const handleDeleteImage = async (image: ImageData) => {
    try {
      // Delete from storage
      await supabase.storage.from("picks-images").remove([image.file_path]);

      // Delete from database (cascades to approvals)
      const { error } = await supabase.from("images").delete().eq("id", image.id);
      if (error) throw error;

      setImages((prev) => prev.filter((i) => i.id !== image.id));
      setApprovals((prev) => prev.filter((a) => a.image_id !== image.id));

      toast({
        title: "Gelöscht",
        description: "Bild wurde entfernt",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Fehler",
        description: "Löschen fehlgeschlagen",
        variant: "destructive",
      });
    }
  };

  // Filter images based on selected users (intersection logic)
  const filteredImages = useMemo(() => {
    if (selectedUserIds.length === 0) return images;

    return images.filter((image) => {
      // Check if ALL selected users have approved this image
      return selectedUserIds.every((userId) =>
        approvals.some((a) => a.image_id === image.id && a.user_id === userId)
      );
    });
  }, [images, approvals, selectedUserIds]);

  // Get approvers for an image
  const getImageApprovers = (imageId: string): string[] => {
    return approvals
      .filter((a) => a.image_id === imageId)
      .map((a) => a.user_id);
  };

  // Get image URL
  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage.from("picks-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Toggle user in filter
  const toggleUserFilter = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
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
            Bilder hochladen und Favoriten markieren
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* User Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white text-gray-700">
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
                Zeige Bilder, die von ALLEN ausgewählten Nutzern genehmigt wurden:
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
              {users.length === 0 && (
                <div className="px-2 py-3 text-sm text-gray-400 text-center">
                  Keine Nutzer gefunden
                </div>
              )}
              {selectedUserIds.length > 0 && (
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => setSelectedUserIds([])}
                    className="w-full px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 text-left"
                  >
                    Filter zurücksetzen
                  </button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Upload Button */}
          <Label
            htmlFor="image-upload"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors",
              "bg-gray-900 text-white hover:bg-gray-800",
              isUploading && "opacity-50 pointer-events-none"
            )}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Bilder hochladen
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

      {/* Filter Info */}
      {selectedUserIds.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <Filter className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-800">
            Zeige {filteredImages.length} Bild{filteredImages.length !== 1 ? "er" : ""}, 
            die von allen {selectedUserIds.length} ausgewählten Nutzern genehmigt wurden
          </span>
        </div>
      )}

      {/* Image Gallery */}
      {filteredImages.length === 0 ? (
        <Card className="p-12 text-center bg-white border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-1">
            {images.length === 0 ? "Keine Bilder vorhanden" : "Keine Treffer"}
          </h3>
          <p className="text-sm text-gray-500">
            {images.length === 0
              ? "Lade Bilder hoch, um loszulegen"
              : "Passe die Filter an, um Ergebnisse zu sehen"}
          </p>
        </Card>
      ) : (
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
                {/* Image */}
                <div className="aspect-square relative">
                  <img
                    src={getImageUrl(image.file_path)}
                    alt={image.title || image.file_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {/* Approval Toggle */}
                    <button
                      onClick={() => toggleApproval(image.id)}
                      className={cn(
                        "p-3 rounded-full transition-all",
                        isApprovedByMe
                          ? "bg-green-500 text-white"
                          : "bg-white text-gray-700 hover:bg-green-500 hover:text-white"
                      )}
                      title={isApprovedByMe ? "Freigabe entfernen" : "Freigeben"}
                    >
                      {isApprovedByMe ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteImage(image)}
                      className="p-3 rounded-full bg-white text-red-600 hover:bg-red-500 hover:text-white transition-all"
                      title="Löschen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Approval indicator */}
                  {isApprovedByMe && (
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-green-500 text-white shadow-lg">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Footer with approval count */}
                <div className="p-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 truncate flex-1" title={image.title || image.file_name}>
                      {image.title || image.file_name}
                    </span>
                    {approvers.length > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-2 bg-gray-100 text-gray-600 text-xs"
                        title={`${approvers.length} Freigabe${approvers.length !== 1 ? "n" : ""}`}
                      >
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
    </div>
  );
};

export default PicksPanel;
