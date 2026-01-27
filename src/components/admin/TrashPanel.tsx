import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, RotateCcw, Clock, FolderOpen, Image, FileText, 
  Train, Plane, Hotel, Car, Bus, MapPin, Calendar, 
  AlertTriangle, Loader2, Check, X, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow, differenceInDays, addDays } from "date-fns";
import { de } from "date-fns/locale";

// Item types
type ItemType = 'album' | 'image' | 'document' | 'booking' | 'trip' | 'calendar_event' | 'admin_event';

// Types
interface TrashItem {
  id: string;
  item_type: ItemType;
  title: string;
  description: string | null;
  deleted_at: string;
  deleted_by: string | null;
  owner_id: string | null;
  created_at: string;
}

// Table mapping for restore/delete operations
const TABLE_MAP: Record<ItemType, "picks_folders" | "images" | "internal_documents" | "travel_bookings" | "travel_trips" | "calendar_events" | "admin_events"> = {
  album: "picks_folders",
  image: "images",
  document: "internal_documents",
  booking: "travel_bookings",
  trip: "travel_trips",
  calendar_event: "calendar_events",
  admin_event: "admin_events",
};

// Icons for each type
const TYPE_ICONS: Record<string, React.ElementType> = {
  album: FolderOpen,
  image: Image,
  document: FileText,
  booking: Train,
  trip: Plane,
  calendar_event: Calendar,
  admin_event: MapPin,
};

// Labels for each type
const TYPE_LABELS: Record<string, string> = {
  album: "Album",
  image: "Bild",
  document: "Dokument",
  booking: "Buchung",
  trip: "Reise",
  calendar_event: "Termin",
  admin_event: "Event",
};

// Colors for each type (neutral/slate based like Drops)
const TYPE_COLORS: Record<string, string> = {
  album: "bg-slate-100 text-slate-600",
  image: "bg-slate-100 text-slate-600",
  document: "bg-slate-100 text-slate-600",
  booking: "bg-slate-100 text-slate-600",
  trip: "bg-slate-100 text-slate-600",
  calendar_event: "bg-slate-100 text-slate-600",
  admin_event: "bg-slate-100 text-slate-600",
};

const TrashPanel = () => {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TrashItem | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Fetch current user info
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        // Check if admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!roleData);
      }
    };
    fetchUser();
  }, []);

  // Fetch trash items
  const fetchTrashItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("trash_items")
        .select("*")
        .order("deleted_at", { ascending: false });

      if (error) throw error;
      // Cast item_type from string to ItemType
      const typedData = (data || []).map(item => ({
        ...item,
        item_type: item.item_type as ItemType,
      }));
      setItems(typedData);
    } catch (error: any) {
      console.error("Error fetching trash:", error);
      toast({
        title: "Fehler",
        description: "Papierkorb konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashItems();
  }, []);

  // Filter items by type
  const filteredItems = useMemo(() => {
    if (typeFilters.size === 0) return items;
    return items.filter(item => typeFilters.has(item.item_type));
  }, [items, typeFilters]);

  // Get unique types for filter
  const availableTypes = useMemo(() => {
    const types = new Set(items.map(item => item.item_type));
    return Array.from(types);
  }, [items]);

  // Calculate days remaining before permanent deletion
  const getDaysRemaining = (deletedAt: string) => {
    const deleteDate = new Date(deletedAt);
    const expiryDate = addDays(deleteDate, 90);
    return Math.max(0, differenceInDays(expiryDate, new Date()));
  };

  // Check if user can delete/restore an item
  const canManageItem = (item: TrashItem) => {
    if (isAdmin) return true;
    if (!item.owner_id) return isAdmin; // Items without owner (bookings, trips) require admin
    return item.owner_id === currentUserId;
  };

  // Restore a single item
  const restoreItem = async (item: TrashItem) => {
    if (!canManageItem(item)) {
      toast({
        title: "Keine Berechtigung",
        description: "Du kannst nur eigene Elemente wiederherstellen",
        variant: "destructive",
      });
      return;
    }

    setIsRestoring(true);
    try {
      const tableName = TABLE_MAP[item.item_type];
      const { error } = await supabase
        .from(tableName)
        .update({ deleted_at: null, deleted_by: null })
        .eq("id", item.id);

      if (error) throw error;

      toast({
        title: "Wiederhergestellt",
        description: `${TYPE_LABELS[item.item_type]} "${item.title}" wurde wiederhergestellt`,
      });

      // Remove from local state
      setItems(prev => prev.filter(i => i.id !== item.id));
      setSelectedItems(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    } catch (error: any) {
      console.error("Error restoring item:", error);
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  // Restore selected items
  const restoreSelected = async () => {
    const itemsToRestore = filteredItems.filter(
      item => selectedItems.has(item.id) && canManageItem(item)
    );

    if (itemsToRestore.length === 0) {
      toast({
        title: "Keine Elemente",
        description: "Keine wiederherstellbaren Elemente ausgewählt",
        variant: "destructive",
      });
      return;
    }

    setIsRestoring(true);
    let successCount = 0;

    for (const item of itemsToRestore) {
      try {
        const tableName = TABLE_MAP[item.item_type];
        const { error } = await supabase
          .from(tableName)
          .update({ deleted_at: null, deleted_by: null })
          .eq("id", item.id);

        if (!error) successCount++;
      } catch (error) {
        console.error("Error restoring:", error);
      }
    }

    toast({
      title: "Wiederhergestellt",
      description: `${successCount} Element(e) wiederhergestellt`,
    });

    setSelectedItems(new Set());
    fetchTrashItems();
    setIsRestoring(false);
  };

  // Permanently delete an item
  const permanentlyDeleteItem = async (item: TrashItem) => {
    if (!canManageItem(item)) {
      toast({
        title: "Keine Berechtigung",
        description: "Du kannst nur eigene Elemente löschen",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const tableName = TABLE_MAP[item.item_type];
      
      // For images/albums, we should also delete files from storage
      // This is handled by existing delete-files edge function
      if (item.item_type === "image" || item.item_type === "album") {
        // Call delete-files edge function for proper cleanup
        const { error: deleteError } = await supabase.functions.invoke("delete-files", {
          body: {
            type: item.item_type === "album" ? "folder" : "image",
            id: item.id,
          },
        });
        if (deleteError) console.warn("File cleanup warning:", deleteError);
      }

      // Delete from database
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      toast({
        title: "Endgültig gelöscht",
        description: `${TYPE_LABELS[item.item_type]} wurde dauerhaft entfernt`,
      });

      setItems(prev => prev.filter(i => i.id !== item.id));
      setSelectedItems(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    } catch (error: any) {
      console.error("Error deleting:", error);
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    }
  };

  // Delete selected items
  const deleteSelected = async () => {
    const itemsToDelete = filteredItems.filter(
      item => selectedItems.has(item.id) && canManageItem(item)
    );

    if (itemsToDelete.length === 0) return;

    setIsDeleting(true);
    let successCount = 0;

    for (const item of itemsToDelete) {
      try {
        const tableName = TABLE_MAP[item.item_type];
        
        // Cleanup files if needed
        if (item.item_type === "image" || item.item_type === "album") {
          await supabase.functions.invoke("delete-files", {
            body: {
              type: item.item_type === "album" ? "folder" : "image",
              id: item.id,
            },
          });
        }

        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq("id", item.id);

        if (!error) successCount++;
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }

    toast({
      title: "Endgültig gelöscht",
      description: `${successCount} Element(e) dauerhaft entfernt`,
    });

    setSelectedItems(new Set());
    setShowDeleteDialog(false);
    fetchTrashItems();
    setIsDeleting(false);
  };

  // Toggle item selection
  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle all selection
  const toggleAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(i => i.id)));
    }
  };

  // Toggle type filter
  const toggleTypeFilter = (type: string) => {
    setTypeFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <span className="text-sm text-slate-500">Papierkorb wird geladen...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Papierkorb</h1>
            <p className="text-sm text-slate-500">
              {items.length} Element{items.length !== 1 ? "e" : ""} • 90 Tage Aufbewahrung
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full gap-2">
                <Filter className="w-4 h-4" />
                Filter
                {typeFilters.size > 0 && (
                  <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0 text-xs">
                    {typeFilters.size}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {availableTypes.map(type => {
                const Icon = TYPE_ICONS[type] || FileText;
                return (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={typeFilters.has(type)}
                    onCheckedChange={() => toggleTypeFilter(type)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {TYPE_LABELS[type]}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk actions */}
          <AnimatePresence>
            {selectedItems.size > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={restoreSelected}
                  disabled={isRestoring}
                  className="rounded-full gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  {isRestoring ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  {selectedItems.size} wiederherstellen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                  className="rounded-full gap-2 border-red-200 text-red-700 hover:bg-red-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Endgültig löschen
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center mb-4">
            <Trash2 className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-1">Papierkorb ist leer</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            {typeFilters.size > 0 
              ? "Keine Elemente für diesen Filter gefunden" 
              : "Gelöschte Elemente werden hier für 90 Tage aufbewahrt"
            }
          </p>
        </motion.div>
      )}

      {/* Items List */}
      {filteredItems.length > 0 && (
        <div className="space-y-2">
          {/* Select All */}
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
            <Checkbox
              checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
              onCheckedChange={toggleAll}
              className="border-slate-300"
            />
            <span className="text-sm text-slate-600">
              {selectedItems.size > 0 
                ? `${selectedItems.size} von ${filteredItems.length} ausgewählt`
                : "Alle auswählen"
              }
            </span>
          </div>

          {/* Item Cards */}
          <motion.div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => {
                const Icon = TYPE_ICONS[item.item_type] || FileText;
                const daysRemaining = getDaysRemaining(item.deleted_at);
                const canManage = canManageItem(item);
                const isSelected = selectedItems.has(item.id);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.02 }}
                    className={`
                      group relative bg-white rounded-2xl border transition-all duration-200
                      ${isSelected 
                        ? "border-slate-400 shadow-md" 
                        : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                      }
                      ${!canManage ? "opacity-60" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3 p-4">
                      {/* Checkbox */}
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelection(item.id)}
                        disabled={!canManage}
                        className="border-slate-300"
                      />

                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${TYPE_COLORS[item.item_type]}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 truncate">
                            {item.title}
                          </span>
                          <Badge variant="secondary" className="rounded-full text-xs px-2 py-0 bg-slate-100 text-slate-600">
                            {TYPE_LABELS[item.item_type]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            Gelöscht {formatDistanceToNow(new Date(item.deleted_at), { addSuffix: true, locale: de })}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className={daysRemaining <= 7 ? "text-amber-600 font-medium" : ""}>
                            {daysRemaining} Tage verbleibend
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => restoreItem(item)}
                          disabled={!canManage || isRestoring}
                          className="h-8 w-8 rounded-full text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteTarget(item);
                            setShowDeleteDialog(true);
                          }}
                          disabled={!canManage || isDeleting}
                          className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-slate-900">
              {deleteTarget 
                ? "Endgültig löschen?"
                : `${selectedItems.size} Elemente endgültig löschen?`
              }
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              {deleteTarget
                ? `"${deleteTarget.title}" wird dauerhaft gelöscht und kann nicht wiederhergestellt werden.`
                : "Die ausgewählten Elemente werden dauerhaft gelöscht und können nicht wiederhergestellt werden."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget ? permanentlyDeleteItem(deleteTarget) : deleteSelected()}
              disabled={isDeleting}
              className="rounded-full bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Wird gelöscht...
                </>
              ) : (
                "Endgültig löschen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrashPanel;
