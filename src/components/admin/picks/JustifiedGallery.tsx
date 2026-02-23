import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  HelpCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageData, VoteStatus, ImageVote } from "./types";
import { getImageThumbnailUrl, isVideoFile } from "@/lib/documentUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface JustifiedGalleryProps {
  images: ImageData[];
  votes: ImageVote[];
  currentUserId: string | null;
  selectedImageIds: Set<string>;
  onSelect: (imageId: string, addToSelection: boolean) => void;
  onOpen: (image: ImageData) => void;
  onVote: (imageId: string, status: VoteStatus) => void;
  targetRowHeight?: number; // kept for API compat, unused
  gap?: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

// Premium Glassmorphism Vote Badge
const VoteBadge = ({ status, isHovered, isMobile }: { status: VoteStatus; isHovered?: boolean; isMobile?: boolean }) => {
  const config = {
    approved: { icon: Check, ring: 'ring-green-400/40' },
    unsure: { icon: HelpCircle, ring: 'ring-amber-400/40' },
    rejected: { icon: XCircle, ring: 'ring-red-400/40' },
  };

  const { icon: Icon, ring } = config[status];

  return (
    <motion.div
      initial={false}
      animate={{
        scale: isHovered ? 1.1 : 1,
        backgroundColor: isHovered ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)'
      }}
      transition={{ duration: 0.15 }}
      className={cn(
        "rounded-full backdrop-blur-xl shadow-lg ring-1",
        ring,
        isMobile ? "p-1.5" : "p-2"
      )}
    >
      <Icon className={cn(
        "text-white drop-shadow-md",
        isMobile ? "w-3 h-3" : "w-4 h-4"
      )} strokeWidth={2.5} />
    </motion.div>
  );
};

// Single image card — shows at natural aspect ratio (no cropping)
const MasonryItem = ({
  image,
  votes,
  currentUserId,
  isSelected,
  index,
  onSelect,
  onOpen,
  onVote,
  isMobile,
  gap,
}: {
  image: ImageData;
  votes: ImageVote[];
  currentUserId: string | null;
  isSelected: boolean;
  index: number;
  onSelect: (imageId: string, addToSelection: boolean) => void;
  onOpen: (image: ImageData) => void;
  onVote: (imageId: string, status: VoteStatus) => void;
  isMobile: boolean;
  gap: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isInView, setIsInView] = useState(index < 20);
  const cardRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (index < 20) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px', threshold: 0.01 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  const handleImageError = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setIsRetrying(true);
      setLoadError(true);
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

  const handleManualRetry = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setRetryCount(0);
    setLoadError(false);
    setImageLoaded(false);
    setIsRetrying(true);
    setTimeout(() => setIsRetrying(false), 100);
  }, []);

  const myVote = votes.find(
    v => v.image_id === image.id && v.user_id === currentUserId
  )?.vote_status;

  const getDisplayUrl = useCallback(() => {
    const cacheBuster = retryCount > 0 ? `?retry=${retryCount}` : '';
    if (image.thumbnail_url) return image.thumbnail_url + cacheBuster;
    if (!image.file_path.startsWith("https://")) {
      return getImageThumbnailUrl("picks-images", image.file_path, 600, 600, 80) + cacheBuster;
    }
    return image.file_path + cacheBuster;
  }, [image.thumbnail_url, image.file_path, retryCount]);

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) onSelect(image.id, true);
    else onOpen(image);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
      className={cn(
        "relative overflow-hidden cursor-pointer rounded-2xl bg-gray-100 group aspect-[4/3]",
        isSelected
          ? "ring-3 ring-amber-500 ring-offset-2 ring-offset-gray-100 shadow-lg"
          : "hover:shadow-xl transition-shadow duration-200"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Skeleton placeholder */}
      {!imageLoaded && !loadError && !isRetrying && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
      )}

      {isRetrying && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {loadError && !isRetrying && (
        <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center gap-1 p-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <button
            onClick={handleManualRetry}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-300 rounded text-xs text-gray-600 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Media — w-full + h-auto = natural aspect ratio, no cropping */}
      {isInView && !loadError && !isRetrying && (
        isVideoFile(image.mime_type, image.file_name) ? (
          <>
            {/* Video: show thumbnail if available, otherwise poster-like element */}
            {image.thumbnail_url ? (
              <img
                src={image.thumbnail_url}
                alt={image.title || image.file_name}
                className={cn(
                  "w-full h-full object-cover block transition-transform duration-300",
                  isHovered && "scale-[1.03]",
                  !imageLoaded && "hidden"
                )}
                loading={index < 20 ? "eager" : "lazy"}
                onLoad={() => { setImageLoaded(true); setLoadError(false); }}
                onError={handleImageError}
              />
            ) : (
              <video
                src={image.file_path}
                muted
                playsInline
                preload="metadata"
                className={cn(
                  "w-full h-full object-cover block transition-transform duration-300",
                  isHovered && "scale-[1.03]",
                  !imageLoaded && "hidden"
                )}
                onLoadedData={() => { setImageLoaded(true); setLoadError(false); }}
                onError={() => handleImageError()}
              />
            )}
            {/* Video play badge */}
            {imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 shadow-lg">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
            )}
          </>
        ) : (
          <img
            src={getDisplayUrl()}
            alt={image.title || image.file_name}
            className={cn(
              "w-full h-full object-cover block transition-transform duration-300",
              isHovered && "scale-[1.03]",
              !imageLoaded && "hidden"
            )}
            loading={index < 20 ? "eager" : "lazy"}
            decoding={index < 20 ? "sync" : "async"}
            fetchPriority={index < 10 ? "high" : "auto"}
            onLoad={() => {
              setImageLoaded(true);
              setLoadError(false);
            }}
            onError={handleImageError}
          />
        )
      )}

      {/* Overlays — all absolute, work correctly over natural-height image */}

      {/* Selection checkbox */}
      <motion.div
        initial={false}
        animate={{
          opacity: isSelected || isHovered ? 1 : 0,
          scale: isSelected || isHovered ? 1 : 0.8
        }}
        transition={{ duration: 0.15 }}
        className={cn("absolute z-10", isMobile ? "top-1.5 left-1.5" : "top-3 left-3")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn(
          "bg-black/30 backdrop-blur-xl rounded-full shadow-lg ring-1 ring-white/20 flex items-center justify-center",
          isMobile ? "min-h-[44px] min-w-[44px]" : "p-1.5"
        )}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(image.id, true)}
            className={cn(
              "border-white/50 bg-white/20 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500",
              isMobile ? "h-5 w-5" : "h-4 w-4"
            )}
          />
        </div>
      </motion.div>

      {/* Vote badge — top right */}
      {myVote && (
        <div className={cn("absolute z-10", isMobile ? "top-1.5 right-1.5" : "top-3 right-3")}>
          <VoteBadge status={myVote} isHovered={isHovered} isMobile={isMobile} />
        </div>
      )}

      {/* Hover gradient overlay */}
      <motion.div
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"
      />

      {/* Hover vote buttons (desktop only) */}
      <AnimatePresence>
        {isHovered && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-xl rounded-full px-2 py-1.5 shadow-xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { status: 'approved' as VoteStatus, icon: Check, activeRing: 'ring-green-400', activeBg: 'bg-green-500' },
              { status: 'unsure' as VoteStatus, icon: HelpCircle, activeRing: 'ring-amber-400', activeBg: 'bg-amber-500' },
              { status: 'rejected' as VoteStatus, icon: XCircle, activeRing: 'ring-red-400', activeBg: 'bg-red-500' },
            ].map(({ status, icon: Icon, activeRing, activeBg }) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onVote(image.id, status)}
                className={cn(
                  "p-2 rounded-full transition-all duration-150",
                  myVote === status
                    ? cn(activeBg, "text-white shadow-lg ring-2", activeRing)
                    : "bg-white/20 text-white/90 hover:bg-white/30 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={2.5} />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const JustifiedGallery = ({
  images,
  votes,
  currentUserId,
  selectedImageIds,
  onSelect,
  onOpen,
  onVote,
  gap = 4,
}: JustifiedGalleryProps) => {
  const isMobile = useIsMobile();
  const effectiveGap = isMobile ? 2 : gap;

  return (
    <div className={cn(
      "w-full grid",
      isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
    )} style={{ gap: effectiveGap }}>
      {images.map((image, index) => (
        <MasonryItem
          key={image.id}
          image={image}
          votes={votes}
          currentUserId={currentUserId}
          isSelected={selectedImageIds.has(image.id)}
          index={index}
          onSelect={onSelect}
          onOpen={onOpen}
          onVote={onVote}
          isMobile={isMobile}
          gap={effectiveGap}
        />
      ))}
    </div>
  );
};

export default JustifiedGallery;
