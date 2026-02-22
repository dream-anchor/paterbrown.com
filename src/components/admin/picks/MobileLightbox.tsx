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
  ChevronDown,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageData, VoteStatus, ImageVote } from "./types";
import { getImageOriginalUrl, isVideoFile } from "@/lib/documentUtils";
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
  selectedImageIds?: Set<string>;
  onToggleDrops?: (imageId: string) => void;
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
  selectedImageIds,
  onToggleDrops,
}: MobileLightboxProps) => {
  const [showTeamVotes, setShowTeamVotes] = useState(false);
  const currentIndex = image ? images.findIndex(img => img.id === image.id) : -1;
  const hasNext = currentIndex < images.length - 1;
  const hasPrev = currentIndex > 0;
  
  const currentVote = votes.find(
    v => v.image_id === image?.id && v.user_id === currentUserId
  )?.vote_status;

  // Get all votes for this image (including current user)
  const teamVotes = useMemo(() => {
    if (!image) return [];
    return votes
      .filter(v => v.image_id === image.id)
      .sort((a, b) => {
        if (a.user_id === currentUserId) return -1;
        if (b.user_id === currentUserId) return 1;
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
        className="fixed inset-0 z-[9999] bg-black flex flex-col"
      >
        {/* Header - minimal with safe area */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <button
            onClick={onClose}
            className="p-2.5 -ml-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors active:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          
          <span className="text-white/70 text-sm font-medium tabular-nums">
            {currentIndex + 1} / {images.length}
          </span>
          
          <button
            onClick={() => onDownload(image)}
            className="p-2.5 -mr-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors active:bg-white/20"
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
          
          {isVideoFile(image.mime_type, image.file_name) ? (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full flex items-center justify-center"
            >
              <video
                src={getImageOriginalUrl("picks-images", image.file_path)}
                controls
                autoPlay
                playsInline
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </motion.div>
          ) : (
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
          )}
        </div>

        {/* Bottom panel - voting and actions - ABOVE main nav */}
        <motion.div 
          className="bg-gray-900/98 backdrop-blur-2xl border-t border-white/15 shadow-2xl"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1, type: "spring", damping: 25 }}
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          {/* Vote label */}
          <div className="flex items-center justify-center pt-3 pb-1">
            <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Bewertung</span>
          </div>
          
          {/* Vote buttons - large, clear, touch-friendly */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-center gap-2">
              {voteButtons.map(({ status, icon: Icon, label, activeBg, activeRing }) => (
                <motion.button
                  key={status}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    haptics.tap();
                    onVote(image.id, status);
                  }}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-2xl transition-all min-h-[72px]",
                    currentVote === status
                      ? cn(activeBg, "text-white shadow-xl ring-2 ring-offset-1 ring-offset-black", activeRing)
                      : "bg-white/10 text-white/80 hover:bg-white/15 active:bg-white/20"
                  )}
                >
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                  <span className="text-xs font-semibold">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Secondary actions row - Drops + Team votes + Delete */}
          <div className="flex items-center gap-2 px-4 pb-2 border-t border-white/10 pt-2">
            {/* Drops toggle */}
            {onToggleDrops && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => { haptics.tap(); onToggleDrops(image.id); }}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-colors",
                  selectedImageIds?.has(image.id)
                    ? "bg-amber-500/30 text-amber-300"
                    : "bg-white/5 text-white/60 hover:text-white/80 hover:bg-white/10"
                )}
              >
                <Send className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {selectedImageIds?.has(image.id) ? "✓ Drops" : "Drops"}
                </span>
              </motion.button>
            )}
            {/* Team votes toggle */}
            <button
              onClick={() => setShowTeamVotes(!showTeamVotes)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/5 text-white/60 hover:text-white/80 hover:bg-white/10 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Freigaben</span>
              {teamVotes.length > 0 && (
                <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {teamVotes.length}
                </span>
              )}
              {showTeamVotes ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
            
            {/* Delete button if allowed */}
            {canDelete && onDelete && (
              <button
                onClick={() => {
                  haptics.warning();
                  onDelete(image);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs font-medium">Löschen</span>
              </button>
            )}
          </div>

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
                <div className="px-4 py-3 max-h-28 overflow-y-auto">
                  {teamVotes.length > 0 ? (
                    <div className="space-y-1.5">
                      {teamVotes.map((vote) => {
                        const isMe = vote.user_id === currentUserId;
                        return (
                          <div 
                            key={vote.id}
                            className={cn(
                              "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg",
                              isMe ? "bg-white/10 ring-1 ring-white/15" : "bg-white/5"
                            )}
                          >
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-[10px] font-medium flex-shrink-0">
                              {getInitials(vote.user_first_name, vote.user_last_name, vote.user_id)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/80 text-xs truncate">
                                {vote.user_display_name || vote.user_id.slice(0, 8)}
                                {isMe && <span className="ml-1 text-amber-400/80">(Du)</span>}
                              </p>
                            </div>
                            <VoteStatusIcon status={vote.vote_status} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-white/40 text-xs text-center py-1">
                      Noch keine Bewertungen
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileLightbox;