import { useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Check,
  HelpCircle,
  XCircle,
  Trash2,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageData, VoteStatus, ImageVote } from "./types";
import { getImageOriginalUrl } from "@/lib/documentUtils";

interface ImageLightboxProps {
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

const ImageLightbox = ({
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
}: ImageLightboxProps) => {
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
        // Sort by name if available
        const nameA = a.user_display_name || '';
        const nameB = b.user_display_name || '';
        return nameA.localeCompare(nameB);
      });
  }, [image, votes, currentUserId]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!image) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        if (hasPrev) onNavigate('prev');
        break;
      case 'ArrowRight':
        if (hasNext) onNavigate('next');
        break;
      case '1':
        onVote(image.id, 'approved');
        break;
      case '2':
        onVote(image.id, 'unsure');
        break;
      case '3':
        onVote(image.id, 'rejected');
        break;
    }
  }, [image, hasPrev, hasNext, onClose, onNavigate, onVote]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when open
  useEffect(() => {
    if (image) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [image]);

  if (!image) return null;

  // Use preview_url if available, otherwise fall back to original
  const getDisplayUrl = (img: ImageData) => {
    if (img.preview_url) {
      return img.preview_url;
    }
    // Fallback to original
    return getImageOriginalUrl("picks-images", img.file_path);
  };
  
  // Get original for download
  const getDownloadUrl = (filePath: string) => {
    return getImageOriginalUrl("picks-images", filePath);
  };
  
  const isMissingPreview = !image.preview_url;

  const voteButtons = [
    { status: 'approved' as VoteStatus, icon: Check, label: 'Freigabe', key: '1', color: 'bg-green-500 hover:bg-green-600 text-white' },
    { status: 'unsure' as VoteStatus, icon: HelpCircle, label: 'Unsicher', key: '2', color: 'bg-amber-500 hover:bg-amber-600 text-white' },
    { status: 'rejected' as VoteStatus, icon: XCircle, label: 'Verwerfen', key: '3', color: 'bg-red-500 hover:bg-red-600 text-white' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex"
        onClick={onClose}
      >
        {/* Main image area */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation arrows */}
          {hasPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Image */}
          <motion.img
            key={image.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            src={getDisplayUrl(image)}
            alt={image.title || image.file_name}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Missing preview indicator */}
          {isMissingPreview && (
            <div className="absolute top-16 right-4 bg-amber-500/80 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
              <span>⚠️ Original wird geladen (Preview fehlt)</span>
            </div>
          )}

          {/* Image info - bottom left */}
          <div className="absolute bottom-6 left-6 text-white/80 text-sm">
            <p className="font-medium">{image.title || image.file_name}</p>
            <p className="text-white/50 text-xs mt-1">
              {currentIndex + 1} / {images.length}
            </p>
          </div>
        </div>

        {/* Right sidebar - Voting panel */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="w-72 bg-gray-900/80 backdrop-blur-md border-l border-white/10 p-6 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-white font-semibold mb-6">Bewertung</h3>

          {/* Vote buttons */}
          <div className="space-y-3">
            {voteButtons.map(({ status, icon: Icon, label, key, color }) => (
              <button
                key={status}
                onClick={() => onVote(image.id, status)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all",
                  currentVote === status
                    ? color
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </div>
                <span className="text-xs opacity-60 bg-white/10 px-2 py-0.5 rounded">
                  {key}
                </span>
              </button>
            ))}
          </div>

          {/* Team Decisions Section - always show, even if empty */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-white/60" />
              <h4 className="text-white/80 text-sm font-medium">Team-Entscheidungen</h4>
            </div>
            
            {teamVotes.length > 0 ? (
              <div className="space-y-2">
                {teamVotes.map((vote) => (
                  <div 
                    key={vote.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5"
                  >
                    {/* Avatar / Initials */}
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-xs font-medium">
                      {getInitials(vote.user_first_name, vote.user_last_name, vote.user_id)}
                    </div>
                    
                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm truncate">
                        {vote.user_display_name || `User ${vote.user_id.slice(0, 6)}...`}
                      </p>
                    </div>
                    
                    {/* Vote Status Icon */}
                    <VoteStatusIcon status={vote.vote_status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-sm text-center py-4">
                Noch keine Bewertungen von anderen
              </p>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action buttons */}
          <div className="space-y-3 pt-6 border-t border-white/10">
            <Button
              onClick={() => onDownload(image)}
              variant="ghost"
              className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Herunterladen
            </Button>

            {canDelete && onDelete && (
              <Button
                onClick={() => onDelete(image)}
                variant="ghost"
                className="w-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Löschen
              </Button>
            )}
          </div>

          {/* Keyboard hint */}
          <p className="text-white/40 text-xs mt-4 text-center">
            Pfeiltasten für Navigation · ESC zum Schließen
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageLightbox;
