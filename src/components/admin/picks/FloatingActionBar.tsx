import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  HelpCircle,
  XCircle,
  Trash2,
  FolderInput,
  X,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoteStatus } from "./types";

interface FloatingActionBarProps {
  selectedCount: number;
  onBatchVote: (status: VoteStatus) => void;
  onBatchDelete: () => void;
  onBatchMove: () => void;
  onClearSelection: () => void;
  canDelete: boolean;
  onSendViaDrops?: () => void;
}

const FloatingActionBar = ({
  selectedCount,
  onBatchVote,
  onBatchDelete,
  onBatchMove,
  onClearSelection,
  canDelete,
  onSendViaDrops,
}: FloatingActionBarProps) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed left-1/2 -translate-x-1/2 z-40"
          style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-2 flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center max-w-[calc(100vw-2rem)]">
            {/* Selection count */}
            <div className="px-3 sm:px-4 py-2 text-white font-medium text-sm whitespace-nowrap">
              {selectedCount} ausgewählt
            </div>

            <div className="w-px h-8 bg-gray-700 hidden sm:block" />

            {/* Vote buttons — icon-only on mobile */}
            <Button
              onClick={() => onBatchVote('approved')}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white min-h-[44px] min-w-[44px] sm:min-w-0"
              title="Freigabe"
            >
              <Check className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Freigabe</span>
            </Button>
            <Button
              onClick={() => onBatchVote('unsure')}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white min-h-[44px] min-w-[44px] sm:min-w-0"
              title="Unsicher"
            >
              <HelpCircle className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Unsicher</span>
            </Button>
            <Button
              onClick={() => onBatchVote('rejected')}
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white min-h-[44px] min-w-[44px] sm:min-w-0"
              title="Verwerfen"
            >
              <XCircle className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Verwerfen</span>
            </Button>

            <div className="w-px h-8 bg-gray-700 hidden sm:block" />

            {/* Move button — icon-only on mobile */}
            <Button
              onClick={onBatchMove}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-gray-700 min-h-[44px] min-w-[44px]"
              title="Verschieben"
            >
              <FolderInput className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Verschieben</span>
            </Button>

            {/* Delete button - only for owners */}
            {canDelete && (
              <Button
                onClick={onBatchDelete}
                size="sm"
                variant="ghost"
                className="text-red-400 hover:bg-red-500/20 hover:text-red-300 min-h-[44px] min-w-[44px]"
                title="Löschen"
              >
                <Trash2 className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Löschen</span>
              </Button>
            )}

            {onSendViaDrops && (
              <>
                <div className="w-px h-8 bg-gray-700 hidden sm:block" />
                <Button
                  onClick={onSendViaDrops}
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-medium min-h-[44px]"
                  title="Via Drops senden"
                >
                  <Send className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Via Drops senden</span>
                </Button>
              </>
            )}

            <div className="w-px h-8 bg-gray-700 hidden sm:block" />

            {/* Clear selection */}
            <Button
              onClick={onClearSelection}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-gray-700 min-h-[44px] min-w-[44px]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingActionBar;
