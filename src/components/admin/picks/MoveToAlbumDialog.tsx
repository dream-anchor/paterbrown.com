import { useState } from "react";
import { Folder, FolderPlus, ChevronRight, Home, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AlbumData } from "./types";

interface MoveToAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  albums: AlbumData[];
  currentAlbumId: string | null;
  selectedCount: number;
  onMove: (targetAlbumId: string | null) => void;
  onCreateAndMove: (newAlbumName: string) => void;
}

const MoveToAlbumDialog = ({
  open,
  onOpenChange,
  albums,
  currentAlbumId,
  selectedCount,
  onMove,
  onCreateAndMove,
}: MoveToAlbumDialogProps) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");

  // Get root-level albums (no parent)
  const rootAlbums = albums.filter(a => a.parent_id === null && a.id !== currentAlbumId);

  const handleConfirm = () => {
    if (showCreateNew && newAlbumName.trim()) {
      onCreateAndMove(newAlbumName.trim());
    } else {
      onMove(selectedTargetId);
    }
    onOpenChange(false);
    setNewAlbumName("");
    setShowCreateNew(false);
    setSelectedTargetId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {selectedCount} {selectedCount === 1 ? 'Medium' : 'Medien'} verschieben
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto">
          {/* Root option */}
          <button
            onClick={() => { setSelectedTargetId(null); setShowCreateNew(false); }}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
              selectedTargetId === null && !showCreateNew
                ? "bg-amber-50 border border-amber-200"
                : "hover:bg-gray-50 border border-transparent"
            )}
          >
            <Home className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">Picks (Hauptebene)</span>
            {selectedTargetId === null && !showCreateNew && (
              <Check className="w-4 h-4 text-amber-600 ml-auto" />
            )}
          </button>

          {/* Existing albums */}
          {rootAlbums.map((album) => (
            <button
              key={album.id}
              onClick={() => { setSelectedTargetId(album.id); setShowCreateNew(false); }}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                selectedTargetId === album.id
                  ? "bg-amber-50 border border-amber-200"
                  : "hover:bg-gray-50 border border-transparent"
              )}
            >
              <Folder className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-gray-900">{album.name}</span>
              {selectedTargetId === album.id && (
                <Check className="w-4 h-4 text-amber-600 ml-auto" />
              )}
            </button>
          ))}

          {/* Create new album option */}
          <button
            onClick={() => { setShowCreateNew(true); setSelectedTargetId(null); }}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors border-dashed border",
              showCreateNew
                ? "bg-amber-50 border-amber-300"
                : "border-gray-200 hover:border-amber-300 hover:bg-gray-50"
            )}
          >
            <FolderPlus className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">Neues Album erstellen</span>
          </button>

          {showCreateNew && (
            <div className="pl-8 pt-2">
              <Label htmlFor="new-album-name" className="text-gray-600 text-xs">
                Albumname
              </Label>
              <Input
                id="new-album-name"
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                placeholder="z.B. Probefotos"
                className="mt-1 bg-white border-gray-200"
                autoFocus
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white text-gray-700"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={showCreateNew && !newAlbumName.trim()}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            Verschieben
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveToAlbumDialog;
