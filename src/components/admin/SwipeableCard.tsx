import React, { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Trash2, Pencil } from "lucide-react";

interface SwipeableCardProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 80;

export const SwipeableCard = ({ 
  children, 
  onDelete, 
  onEdit,
  disabled = false 
}: SwipeableCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  
  // Transform for background colors based on swipe direction
  const deleteOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20, 0], [1, 0.5, 0]);
  const editOpacity = useTransform(x, [0, 20, SWIPE_THRESHOLD], [0, 0.5, 1]);
  const deleteScale = useTransform(x, [-SWIPE_THRESHOLD * 1.5, -SWIPE_THRESHOLD, 0], [1, 0.9, 0.5]);
  const editScale = useTransform(x, [0, SWIPE_THRESHOLD, SWIPE_THRESHOLD * 1.5], [0.5, 0.9, 1]);

  // Haptic feedback helper
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    if (info.offset.x < -SWIPE_THRESHOLD && onDelete) {
      triggerHaptic('heavy');
      onDelete();
    } else if (info.offset.x > SWIPE_THRESHOLD && onEdit) {
      triggerHaptic('medium');
      onEdit();
    }
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Trigger light haptic when crossing threshold
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD - 5 && Math.abs(info.offset.x) < SWIPE_THRESHOLD + 5) {
      triggerHaptic('light');
    }
  };

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete background (left swipe) */}
      <motion.div 
        className="absolute inset-y-0 right-0 w-24 flex items-center justify-center rounded-r-xl bg-gradient-to-l from-destructive to-destructive/80"
        style={{ opacity: deleteOpacity }}
      >
        <motion.div style={{ scale: deleteScale }} className="flex flex-col items-center gap-1">
          <Trash2 className="w-6 h-6 text-destructive-foreground" />
          <span className="text-xs font-medium text-destructive-foreground">Löschen</span>
        </motion.div>
      </motion.div>
      
      {/* Edit background (right swipe) */}
      <motion.div 
        className="absolute inset-y-0 left-0 w-24 flex items-center justify-center rounded-l-xl bg-gradient-to-r from-primary to-primary/80"
        style={{ opacity: editOpacity }}
      >
        <motion.div style={{ scale: editScale }} className="flex flex-col items-center gap-1">
          <Pencil className="w-6 h-6 text-primary-foreground" />
          <span className="text-xs font-medium text-primary-foreground">Bearbeiten</span>
        </motion.div>
      </motion.div>
      
      {/* Card content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`relative z-10 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeableCard;
