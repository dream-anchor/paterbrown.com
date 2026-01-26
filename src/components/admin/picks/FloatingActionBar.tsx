import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  HelpCircle, 
  XCircle, 
  Trash2, 
  FolderInput,
  X
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
}

const FloatingActionBar = ({
  selectedCount,
  onBatchVote,
  onBatchDelete,
  onBatchMove,
  onClearSelection,
  canDelete,
}: FloatingActionBarProps) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-2 flex items-center gap-2">
            {/* Selection count */}
            <div className="px-4 py-2 text-white font-medium">
              {selectedCount} ausgewählt
            </div>

            <div className="w-px h-8 bg-gray-700" />

            {/* Vote buttons */}
            <Button
              onClick={() => onBatchVote('approved')}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-1" />
              Freigabe
            </Button>
            <Button
              onClick={() => onBatchVote('unsure')}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              Unsicher
            </Button>
            <Button
              onClick={() => onBatchVote('rejected')}
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Ablehnen
            </Button>

            <div className="w-px h-8 bg-gray-700" />

            {/* Move button */}
            <Button
              onClick={onBatchMove}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-gray-700"
            >
              <FolderInput className="w-4 h-4 mr-1" />
              Verschieben
            </Button>

            {/* Delete button - only for owners */}
            {canDelete && (
              <Button
                onClick={onBatchDelete}
                size="sm"
                variant="ghost"
                className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Löschen
              </Button>
            )}

            <div className="w-px h-8 bg-gray-700" />

            {/* Clear selection */}
            <Button
              onClick={onClearSelection}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-gray-700"
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
