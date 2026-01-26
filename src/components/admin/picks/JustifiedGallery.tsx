import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  HelpCircle, 
  XCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageData, VoteStatus, ImageVote } from "./types";
import { getImageThumbnailUrl } from "@/lib/documentUtils";

interface JustifiedGalleryProps {
  images: ImageData[];
  votes: ImageVote[];
  currentUserId: string | null;
  selectedImageIds: Set<string>;
  onSelect: (imageId: string, addToSelection: boolean) => void;
  onOpen: (image: ImageData) => void;
  onVote: (imageId: string, status: VoteStatus) => void;
  targetRowHeight?: number;
  gap?: number;
}

interface RowImage extends ImageData {
  calculatedWidth: number;
  calculatedHeight: number;
}

interface Row {
  images: RowImage[];
  height: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

// Glassmorphism Vote Badge
const VoteBadge = ({ status }: { status: VoteStatus }) => {
  const config = {
    approved: { icon: Check, bg: 'bg-green-500/80', border: 'border-green-400/50' },
    unsure: { icon: HelpCircle, bg: 'bg-amber-500/80', border: 'border-amber-400/50' },
    rejected: { icon: XCircle, bg: 'bg-red-500/80', border: 'border-red-400/50' },
  };
  
  const { icon: Icon, bg, border } = config[status];
  
  return (
    <div className={cn(
      "p-1 rounded-md backdrop-blur-md border shadow-sm",
      bg, border
    )}>
      <Icon className="w-3 h-3 text-white drop-shadow-sm" />
    </div>
  );
};

// Single Image Item in Justified Gallery
const JustifiedImageItem = ({
  image,
  votes,
  currentUserId,
  isSelected,
  index,
  calculatedWidth,
  calculatedHeight,
  onSelect,
  onOpen,
  onVote,
}: {
  image: ImageData;
  votes: ImageVote[];
  currentUserId: string | null;
  isSelected: boolean;
  index: number;
  calculatedWidth: number;
  calculatedHeight: number;
  onSelect: (imageId: string, addToSelection: boolean) => void;
  onOpen: (image: ImageData) => void;
  onVote: (imageId: string, status: VoteStatus) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isInView, setIsInView] = useState(index < 20);
  const imgRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
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
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
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
    if (image.thumbnail_url) {
      return image.thumbnail_url + cacheBuster;
    }
    if (!image.file_path.startsWith("https://")) {
      return getImageThumbnailUrl("picks-images", image.file_path, 600, 600, 80) + cacheBuster;
    }
    return image.file_path + cacheBuster;
  }, [image.thumbnail_url, image.file_path, retryCount]);

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      onSelect(image.id, true);
    } else {
      onOpen(image);
    }
  };

  return (
    <motion.div
      ref={imgRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-150 rounded-sm flex-shrink-0",
        isSelected && "ring-2 ring-amber-500 ring-offset-1"
      )}
      style={{ 
        width: calculatedWidth, 
        height: calculatedHeight,
        flexGrow: 1,
        flexBasis: calculatedWidth,
        maxWidth: calculatedWidth * 1.2, // Allow slight stretch
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Shimmer placeholder */}
      {(!imageLoaded || isRetrying) && !loadError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]">
          {isRetrying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          )}
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
      
      {/* Image */}
      {isInView && !loadError && !isRetrying && (
        <img
          src={getDisplayUrl()}
          alt={image.title || image.file_name}
          className={cn(
            "w-full h-full object-cover transition-transform duration-300",
            isHovered && "scale-[1.03]",
            !imageLoaded && "opacity-0"
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
      )}

      {/* Selection checkbox - glassmorphism */}
      <div
        className={cn(
          "absolute top-1.5 left-1.5 transition-opacity z-10",
          isSelected || isHovered ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded shadow-sm">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(image.id, false)}
            className="h-4 w-4 border-gray-300"
          />
        </div>
      </div>

      {/* Vote badge - glassmorphism style, top right */}
      {myVote && (
        <div className="absolute top-1.5 right-1.5 z-10">
          <VoteBadge status={myVote} />
        </div>
      )}

      {/* Hover overlay - subtle gradient */}
      <motion.div
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"
      />

      {/* Hover vote buttons */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { status: 'approved' as VoteStatus, icon: Check, activeColor: 'bg-green-500', hoverColor: 'hover:bg-green-500' },
              { status: 'unsure' as VoteStatus, icon: HelpCircle, activeColor: 'bg-amber-500', hoverColor: 'hover:bg-amber-500' },
              { status: 'rejected' as VoteStatus, icon: XCircle, activeColor: 'bg-red-500', hoverColor: 'hover:bg-red-500' },
            ].map(({ status, icon: Icon, activeColor, hoverColor }) => (
              <button
                key={status}
                onClick={() => onVote(image.id, status)}
                className={cn(
                  "p-1.5 rounded-md backdrop-blur-md border border-white/20 transition-all shadow-sm",
                  myVote === status
                    ? cn(activeColor, "text-white scale-105")
                    : cn("bg-white/70 text-gray-700", hoverColor, "hover:text-white")
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
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
  targetRowHeight = 200,
  gap = 4,
}: JustifiedGalleryProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Observe container width
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(width);
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Calculate justified rows
  const rows = useMemo(() => {
    if (containerWidth === 0 || images.length === 0) return [];

    const rows: Row[] = [];
    let currentRow: RowImage[] = [];
    let currentRowWidth = 0;

    // Default aspect ratio for images without known dimensions
    const defaultAspectRatio = 1.5; // Landscape default

    images.forEach((image) => {
      // Estimate aspect ratio - in production you'd have actual dimensions
      // Using 1.5 (landscape) as default since photos are typically landscape
      const aspectRatio = defaultAspectRatio;
      const imageWidth = targetRowHeight * aspectRatio;

      currentRow.push({
        ...image,
        calculatedWidth: imageWidth,
        calculatedHeight: targetRowHeight,
      });
      currentRowWidth += imageWidth + gap;

      // Check if row is full
      if (currentRowWidth >= containerWidth) {
        // Calculate scale factor to fit row exactly
        const totalGaps = (currentRow.length - 1) * gap;
        const availableWidth = containerWidth - totalGaps;
        const naturalWidth = currentRow.reduce((sum, img) => sum + img.calculatedWidth, 0);
        const scale = availableWidth / naturalWidth;

        // Apply scale to each image
        const scaledRow = currentRow.map((img) => ({
          ...img,
          calculatedWidth: Math.floor(img.calculatedWidth * scale),
          calculatedHeight: Math.floor(targetRowHeight * scale),
        }));

        rows.push({
          images: scaledRow,
          height: Math.floor(targetRowHeight * scale),
        });

        currentRow = [];
        currentRowWidth = 0;
      }
    });

    // Handle last incomplete row (don't stretch, just left-align)
    if (currentRow.length > 0) {
      rows.push({
        images: currentRow,
        height: targetRowHeight,
      });
    }

    return rows;
  }, [images, containerWidth, targetRowHeight, gap]);

  // Flatten for index tracking
  let globalIndex = 0;

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex flex-col" style={{ gap }}>
        <AnimatePresence mode="popLayout">
          {rows.map((row, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="flex"
              style={{ gap, height: row.height }}
            >
              {row.images.map((image) => {
                const idx = globalIndex++;
                return (
                  <JustifiedImageItem
                    key={image.id}
                    image={image}
                    votes={votes}
                    currentUserId={currentUserId}
                    isSelected={selectedImageIds.has(image.id)}
                    index={idx}
                    calculatedWidth={image.calculatedWidth}
                    calculatedHeight={image.calculatedHeight}
                    onSelect={onSelect}
                    onOpen={onOpen}
                    onVote={onVote}
                  />
                );
              })}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JustifiedGallery;
