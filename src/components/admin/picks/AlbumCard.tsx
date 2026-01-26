import { motion } from "framer-motion";
import { Folder, Trash2, Image as ImageIcon, ChevronRight } from "lucide-react";
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
  const hasImages = previewImages.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl cursor-pointer",
          "bg-gradient-to-br from-gray-50 to-gray-100",
          "border border-gray-200/60 hover:border-amber-400/60",
          "shadow-sm hover:shadow-xl hover:shadow-amber-500/10",
          "transition-all duration-300 ease-out"
        )}
        onClick={() => onOpen(album)}
      >
        {/* Cover Image Area */}
        <div className="aspect-[4/3] relative overflow-hidden">
          {hasImages ? (
            <>
              {/* Main cover image - use thumbnail for performance */}
              <img
                src={previewImages[0].thumbnail_url || previewImages[0].file_path}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Stacked effect - subtle offset cards behind */}
              <div className="absolute inset-0 pointer-events-none">
                {previewImages.length > 1 && (
                  <div 
                    className="absolute -bottom-1 -right-1 w-[95%] h-[95%] rounded-xl bg-white/80 border border-gray-200/50 -z-10 transform rotate-2"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  />
                )}
                {previewImages.length > 2 && (
                  <div 
                    className="absolute -bottom-2 -right-2 w-[90%] h-[90%] rounded-xl bg-white/60 border border-gray-200/30 -z-20 transform rotate-4"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
                  />
                )}
              </div>
              
              {/* Gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              
              {/* Image count badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
                <ImageIcon className="w-3 h-3" />
                {imageCount}
              </div>
            </>
          ) : (
            /* Empty album state */
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-50/50 to-orange-50/50">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <Folder className="w-8 h-8 text-amber-500" />
                </div>
                <span className="text-xs text-gray-400">Leer</span>
              </div>
            </div>
          )}
        </div>

        {/* Album Info Footer */}
        <div className={cn(
          "relative px-4 py-3",
          hasImages 
            ? "absolute bottom-0 inset-x-0 text-white" 
            : "bg-white border-t border-gray-100"
        )}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-semibold truncate text-sm",
                hasImages ? "text-white" : "text-gray-900"
              )}>
                {album.name}
              </h3>
              {!hasImages && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {imageCount} {imageCount === 1 ? 'Bild' : 'Bilder'}
                </p>
              )}
            </div>
            
            {/* Arrow indicator */}
            <div className={cn(
              "flex items-center justify-center w-7 h-7 rounded-full transition-all",
              hasImages 
                ? "bg-white/20 group-hover:bg-white/30" 
                : "bg-gray-100 group-hover:bg-amber-100"
            )}>
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform group-hover:translate-x-0.5",
                hasImages ? "text-white" : "text-gray-500 group-hover:text-amber-600"
              )} />
            </div>
          </div>
        </div>

        {/* Delete button - only visible for owner on hover */}
        {canDelete && isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(album);
            }}
            className={cn(
              "absolute top-3 left-3 p-2 rounded-xl transition-all",
              "opacity-0 group-hover:opacity-100",
              "bg-white/90 hover:bg-red-50 shadow-lg",
              "text-gray-400 hover:text-red-500"
            )}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default AlbumCard;
