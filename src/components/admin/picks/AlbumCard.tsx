import { motion } from "framer-motion";
import { Folder, Trash2, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlbumData, ImageData } from "./types";

interface AlbumCardProps {
  album: AlbumData;
  imageCount: number;
  previewImages: ImageData[];
  currentUserId: string | null;
  onOpen: (album: AlbumData) => void;
  onDelete: (album: AlbumData) => void;
  canDelete: boolean;
}

const AlbumCard = ({
  album,
  imageCount,
  previewImages,
  currentUserId,
  onOpen,
  onDelete,
  canDelete,
}: AlbumCardProps) => {
  const isOwner = album.created_by === currentUserId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden bg-white border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all cursor-pointer"
        )}
        onClick={() => onOpen(album)}
      >
        {/* Preview grid or folder icon */}
        <div className="aspect-square relative bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden">
          {previewImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-0.5 h-full p-0.5">
              {previewImages.slice(0, 4).map((img, idx) => (
                <div key={img.id} className="relative overflow-hidden">
                  <img
                    src={img.file_path}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
              {previewImages.length < 4 && 
                Array.from({ length: 4 - previewImages.length }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="bg-amber-100/50 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-amber-300" />
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Folder className="w-16 h-16 text-amber-400" />
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Album info */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-sm font-medium text-gray-900 truncate flex-1">
              {album.name}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            {imageCount} {imageCount === 1 ? 'Bild' : 'Bilder'}
          </p>
        </div>

        {/* Delete button - only visible for owner */}
        {canDelete && isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(album);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white opacity-0 group-hover:opacity-100 transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </Card>
    </motion.div>
  );
};

export default AlbumCard;
