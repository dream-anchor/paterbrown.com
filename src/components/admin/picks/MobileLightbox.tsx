import { useEffect, useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { 
  X, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Check,
  HelpCircle,
  XCircle,
  Trash2,
  Users,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageData, VoteStatus, ImageVote } from "./types";
import { getImageOriginalUrl } from "@/lib/documentUtils";
import { haptics } from "@/lib/haptics";

interface MobileLightboxProps {
  image: ImageData | null;
  images: ImageData[];
  votes: ImageVote[];
  currentUserId: string | null;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onVote: (imageId: string, status: VoteStatus) => void;
  onDownload: (image: ImageData) => void;
  onDelete?: (image: ImageData) => void;
  canDelete: boolean;
}

// Helper to get initials from name
const getInitials = (firstName?: string, lastName?: string, fallbackId?: string): string => {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (fallbackId) return fallbackId.slice(0, 2).toUpperCase();
  return "??";
};

// Vote status icon component
const VoteStatusIcon = ({ status }: { status: VoteStatus }) => {
  switch (status) {
    case 'approved':
      return <Check className="w-4 h-4 text-green-400" />;
    case 'unsure':
      return <HelpCircle className="w-4 h-4 text-amber-400" />;
    case 'rejected':
      return <XCircle className="w-4 h-4 text-red-400" />;
  }
};

const MobileLightbox = ({
  image,
  images,
  votes,
  currentUserId,
  onClose,
  onNavigate,
  onVote,
  onDownload,
  onDelete,
  canDelete,
}: MobileLightboxProps) => {
  const [showTeamVotes, setShowTeamVotes] = useState(false);
  const currentIndex = image ? images.findIndex(img => img.id === image.id) : -1;
  const hasNext = currentIndex < images.length - 1;
  const hasPrev = currentIndex > 0;
  
  const currentVote = votes.find(
    v => v.image_id === image?.id && v.user_id === currentUserId
  )?.vote_status;

  // Get team votes (excluding current user)
  const teamVotes = useMemo(() => {
    if (!image) return [];
    return votes
      .filter(v => v.image_id === image.id && v.user_id !== currentUserId)
      .sort((a, b) => {
        const nameA = a.user_display_name || '';
        const nameB = b.user_display_name || '';
        return nameA.localeCompare(nameB);
      });
  }, [image, votes, currentUserId]);

  // Lock body scroll when open
  useEffect(() => {
    if (image) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [image]);

  // Handle swipe gestures
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocity = 0.5;
    
    if (info.offset.x > threshold || info.velocity.x > velocity) {
      if (hasPrev) {
        haptics.tap();
        onNavigate('prev');
      }
    } else if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      if (hasNext) {
        haptics.tap();
        onNavigate('next');
      }
    }
  }, [hasPrev, hasNext, onNavigate]);

  if (!image) return null;

  // Use preview_url if available, otherwise fall back to original
  const getDisplayUrl = (img: ImageData) => {
    if (img.preview_url) {
      return img.preview_url;
    }
    return getImageOriginalUrl("picks-images", img.file_path);
  };

  const voteButtons = [
    { status: 'approved' as VoteStatus, icon: Check, label: 'Freigabe', activeBg: 'bg-green-500', activeRing: 'ring-green-400' },
    { status: 'unsure' as VoteStatus, icon: HelpCircle, label: 'Unsicher', activeBg: 'bg-amber-500', activeRing: 'ring-amber-400' },
    { status: 'rejected' as VoteStatus, icon: XCircle, label: 'Verwerfen', activeBg: 'bg-red-500', activeRing: 'ring-red-400' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        {/* Header - minimal */}
        <div className="flex items-center justify-between px-4 py-3 safe-area-top">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <span className="text-white/60 text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
          
          <button
            onClick={() => onDownload(image)}
            className="p-2 -mr-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* Main image area with swipe */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center px-2">
          {/* Navigation hint arrows */}
          {hasPrev && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 z-10">
              <ChevronLeft className="w-8 h-8" />
            </div>
          )}
          {hasNext && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 z-10">
              <ChevronRight className="w-8 h-8" />
            </div>
          )}
          
          <motion.img
            key={image.id}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            src={getDisplayUrl(image)}
            alt={image.title || image.file_name}
            className="max-w-full max-h-full object-contain rounded-lg touch-pan-y"
          />
        </div>

        {/* Bottom panel - voting and actions */}
        <motion.div 
          className="bg-gray-900/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Vote buttons - horizontal pill style */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-center gap-3">
              {voteButtons.map(({ status, icon: Icon, label, activeBg, activeRing }) => (
                <motion.button
                  key={status}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    haptics.tap();
                    onVote(image.id, status);
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all",
                    currentVote === status
                      ? cn(activeBg, "text-white shadow-lg ring-2", activeRing)
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm font-medium hidden xs:inline">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Team votes toggle */}
          <button
            onClick={() => setShowTeamVotes(!showTeamVotes)}
            className="w-full flex items-center justify-between px-4 py-2 border-t border-white/10 text-white/60 hover:text-white/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Team-Entscheidungen</span>
              {teamVotes.length > 0 && (
                <span className="bg-white/20 text-white/80 text-xs px-1.5 py-0.5 rounded-full">
                  {teamVotes.length}
                </span>
              )}
            </div>
            {showTeamVotes ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>

          {/* Team votes list - expandable */}
          <AnimatePresence>
            {showTeamVotes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-white/10"
              >
                <div className="px-4 py-3 max-h-32 overflow-y-auto">
                  {teamVotes.length > 0 ? (
                    <div className="space-y-2">
                      {teamVotes.map((vote) => (
                        <div 
                          key={vote.id}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5"
                        >
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-xs font-medium">
                            {getInitials(vote.user_first_name, vote.user_last_name, vote.user_id)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/80 text-sm truncate">
                              {vote.user_display_name || `User ${vote.user_id.slice(0, 6)}...`}
                            </p>
                          </div>
                          <VoteStatusIcon status={vote.vote_status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm text-center py-2">
                      Noch keine Bewertungen von anderen
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete button if allowed */}
          {canDelete && onDelete && (
            <div className="px-4 py-3 border-t border-white/10">
              <Button
                onClick={() => {
                  haptics.warning();
                  onDelete(image);
                }}
                variant="ghost"
                className="w-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Löschen
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileLightbox;