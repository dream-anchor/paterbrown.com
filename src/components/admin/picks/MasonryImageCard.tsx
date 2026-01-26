import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Check, 
  HelpCircle, 
  XCircle,
  ZoomIn,
  Users,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ImageData, VoteStatus, ImageVote } from "./types";
import { getImageThumbnailUrl } from "@/lib/documentUtils";

interface MasonryImageCardProps {
  image: ImageData;
  votes: ImageVote[];
  currentUserId: string | null;
  isSelected: boolean;
  onSelect: (imageId: string, addToSelection: boolean) => void;
  onOpen: (image: ImageData) => void;
  onVote: (imageId: string, status: VoteStatus) => void;
}

const VoteIndicator = ({ status }: { status: VoteStatus }) => {
  const config = {
    approved: { icon: Check, bg: 'bg-green-500', ring: 'ring-green-300' },
    unsure: { icon: HelpCircle, bg: 'bg-amber-500', ring: 'ring-amber-300' },
    rejected: { icon: XCircle, bg: 'bg-red-500', ring: 'ring-red-300' },
  };
  
  const { icon: Icon, bg, ring } = config[status];
  
  return (
    <div className={cn("p-1.5 rounded-full shadow-lg ring-2", bg, ring)}>
      <Icon className="w-3 h-3 text-white" />
    </div>
  );
};

const MasonryImageCard = ({
  image,
  votes,
  currentUserId,
  isSelected,
  onSelect,
  onOpen,
  onVote,
}: MasonryImageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const myVote = votes.find(
    v => v.image_id === image.id && v.user_id === currentUserId
  )?.vote_status;
  
  const totalVotes = votes.filter(v => v.image_id === image.id).length;

  // Use thumbnail_url if available, otherwise fall back to original with transform
  const isMissingThumbnail = !image.thumbnail_url;
  
  const getDisplayUrl = () => {
    // Priority: thumbnail_url > supabase transform > original
    if (image.thumbnail_url) {
      return image.thumbnail_url;
    }
    // Fallback: if it's a supabase storage URL, use transform
    if (!image.file_path.startsWith("https://")) {
      return getImageThumbnailUrl("picks-images", image.file_path, 600, 600, 80);
    }
    // Last resort: original file (slow!)
    return image.file_path;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      onSelect(image.id, true);
    } else {
      onOpen(image);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    onSelect(image.id, false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "group relative rounded-xl overflow-hidden bg-gray-100 cursor-pointer transition-all duration-200",
        isSelected && "ring-4 ring-amber-500 ring-offset-2"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative">
        {!imageLoaded && (
          <div className="aspect-square bg-gray-200 animate-pulse" />
        )}
        <img
          src={getDisplayUrl()}
          alt={image.title || image.file_name}
          className={cn(
            "w-full object-cover transition-transform duration-300",
            isHovered && "scale-105",
            !imageLoaded && "hidden"
          )}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Missing thumbnail warning */}
        {isMissingThumbnail && imageLoaded && (
          <div className="absolute top-2 left-10 bg-amber-500 text-white p-1 rounded-full" title="Thumbnail fehlt - Original wird geladen">
            <AlertTriangle className="w-3 h-3" />
          </div>
        )}

        {/* Selection checkbox - top left */}
        <div
          className={cn(
            "absolute top-2 left-2 transition-opacity",
            isSelected || isHovered ? "opacity-100" : "opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-md shadow-lg">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              className="h-5 w-5 border-2"
            />
          </div>
        </div>

        {/* Current vote indicator - top right */}
        {myVote && (
          <div className="absolute top-2 right-2">
            <VoteIndicator status={myVote} />
          </div>
        )}

        {/* Hover overlay with actions */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"
        />

        {/* Hover content */}
        {isHovered && (
          <div className="absolute inset-x-0 bottom-0 p-3">
            {/* Vote buttons */}
            <div 
              className="flex items-center justify-center gap-2 mb-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onVote(image.id, 'approved')}
                className={cn(
                  "p-2 rounded-full transition-all",
                  myVote === 'approved'
                    ? "bg-green-500 text-white scale-110"
                    : "bg-white/90 text-green-600 hover:bg-green-500 hover:text-white"
                )}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => onVote(image.id, 'unsure')}
                className={cn(
                  "p-2 rounded-full transition-all",
                  myVote === 'unsure'
                    ? "bg-amber-500 text-white scale-110"
                    : "bg-white/90 text-amber-600 hover:bg-amber-500 hover:text-white"
                )}
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onVote(image.id, 'rejected')}
                className={cn(
                  "p-2 rounded-full transition-all",
                  myVote === 'rejected'
                    ? "bg-red-500 text-white scale-110"
                    : "bg-white/90 text-red-600 hover:bg-red-500 hover:text-white"
                )}
              >
                <XCircle className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-white/30 mx-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(image);
                }}
                className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Title and votes count */}
            <div className="flex items-center justify-between text-white/90">
              <span className="text-xs truncate flex-1 font-medium">
                {image.title || image.file_name}
              </span>
              {totalVotes > 0 && (
                <Badge className="ml-2 bg-white/20 text-white text-xs border-0">
                  <Users className="w-3 h-3 mr-1" />
                  {totalVotes}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MasonryImageCard;
