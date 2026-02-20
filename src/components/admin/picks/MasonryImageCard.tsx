import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Check, 
  HelpCircle, 
  XCircle,
  ZoomIn,
  Users,
  AlertTriangle,
  RefreshCw
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
  /** Index in the list - first 12 images load eagerly for instant display */
  index?: number;
  onSelect: (imageId: string, addToSelection: boolean) => void;
  onOpen: (image: ImageData) => void;
  onVote: (imageId: string, status: VoteStatus) => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

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
  index = 999,
  onSelect,
  onOpen,
  onVote,
}: MasonryImageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isInView, setIsInView] = useState(index < 12); // First 12 are always in view
  const imgRef = useRef<HTMLImageElement>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);
  
  // Intersection Observer for smarter lazy loading with rootMargin
  useEffect(() => {
    if (index < 12) return; // First 12 don't need observer
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0.01 
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [index]);
  
  // Auto-retry on error
  const handleImageError = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setIsRetrying(true);
      setLoadError(true);
      
      // Exponential backoff: 1.5s, 3s, 4.5s
      const delay = RETRY_DELAY_MS * (retryCount + 1);
      
      retryTimeoutRef.current = window.setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setLoadError(false);
        setImageLoaded(false);
        setIsRetrying(false);
      }, delay);
    } else {
      setLoadError(true);
      setIsRetrying(false);
    }
  }, [retryCount]);
  
  // Manual retry handler
  const handleManualRetry = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setRetryCount(0);
    setLoadError(false);
    setImageLoaded(false);
    setIsRetrying(true);
    
    // Force reload by changing the URL slightly
    setTimeout(() => setIsRetrying(false), 100);
  }, []);
  
  const myVote = votes.find(
    v => v.image_id === image.id && v.user_id === currentUserId
  )?.vote_status;
  
  const totalVotes = votes.filter(v => v.image_id === image.id).length;

  // Use thumbnail_url if available, otherwise fall back to original with transform
  const isMissingThumbnail = !image.thumbnail_url;
  
  const getDisplayUrl = useCallback(() => {
    // Add cache-busting parameter on retry
    const cacheBuster = retryCount > 0 ? `?retry=${retryCount}` : '';
    
    // Priority: thumbnail_url > supabase transform > original
    if (image.thumbnail_url) {
      return image.thumbnail_url + cacheBuster;
    }
    // Fallback: if it's a supabase storage URL, use transform
    if (!image.file_path.startsWith("https://")) {
      return getImageThumbnailUrl("picks-images", image.file_path, 600, 600, 80) + cacheBuster;
    }
    // Last resort: original file (slow!)
    return image.file_path + cacheBuster;
  }, [image.thumbnail_url, image.file_path, retryCount]);

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      onSelect(image.id, true);
    } else {
      onOpen(image);
    }
  };

  const handleCheckboxChange = () => {
    onSelect(image.id, true);
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
      <div className="relative" ref={imgRef}>
        {/* Improved skeleton with shimmer effect - show while loading or retrying */}
        {(!imageLoaded || isRetrying) && !loadError && (
          <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]">
            {isRetrying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
        )}
        
        {/* Error state with manual retry */}
        {loadError && !isRetrying && (
          <div className="aspect-square bg-gray-200 flex flex-col items-center justify-center gap-2 p-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <span className="text-xs text-gray-500 text-center">Laden fehlgeschlagen</span>
            <button
              onClick={handleManualRetry}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-600 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Erneut laden
            </button>
          </div>
        )}
        
        {/* Only render img when in view (Intersection Observer) and not in error state */}
        {isInView && !loadError && !isRetrying && (
          <img
            src={getDisplayUrl()}
            alt={image.title || image.file_name}
            className={cn(
              "w-full object-cover transition-transform duration-300",
              isHovered && "scale-105",
              !imageLoaded && "absolute inset-0 opacity-0"
            )}
            // First 12 images load eagerly for instant display, rest lazy load
            loading={index < 12 ? "eager" : "lazy"}
            // Add decoding hint for faster rendering
            decoding={index < 12 ? "sync" : "async"}
            // Preload hint for first batch
            fetchPriority={index < 6 ? "high" : "auto"}
            onLoad={() => {
              setImageLoaded(true);
              setLoadError(false);
            }}
            onError={handleImageError}
          />
        )}

        {/* Missing thumbnail warning */}
        {isMissingThumbnail && imageLoaded && (
          <div className="absolute top-2 left-10 bg-amber-500 text-white p-1 rounded-full" title="Thumbnail fehlt - Original wird geladen">
            <AlertTriangle className="w-3 h-3" />
          </div>
        )}

        {/* Selection checkbox - top left — 44px touch target */}
        <div
          className={cn(
            "absolute top-2 left-2 transition-opacity",
            isSelected || isHovered ? "opacity-100" : "opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-md shadow-lg flex items-center justify-center min-h-[44px] min-w-[44px]">
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
