import { useCallback, useRef, useState, useEffect } from "react";
import { haptic } from "@/lib/haptics";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // Distance in pixels to trigger refresh
  resistance?: number; // How hard it is to pull (higher = harder)
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  progress: number; // 0-1 for visual indicator
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: UsePullToRefreshOptions) {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    progress: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const triggeredHaptic = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only enable pull-to-refresh when scrolled to top
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      triggeredHaptic.current = false;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!startY.current || state.isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0 && containerRef.current && containerRef.current.scrollTop <= 0) {
      // Apply resistance
      const pullDistance = Math.min(diff / resistance, threshold * 1.5);
      const progress = Math.min(pullDistance / threshold, 1);

      setState(prev => ({
        ...prev,
        isPulling: true,
        pullDistance,
        progress,
      }));

      // Haptic feedback when threshold is reached
      if (progress >= 1 && !triggeredHaptic.current) {
        haptic('medium');
        triggeredHaptic.current = true;
      }

      // Prevent default scroll when pulling
      if (pullDistance > 0) {
        e.preventDefault();
      }
    }
  }, [state.isRefreshing, threshold, resistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!state.isPulling) return;

    if (state.progress >= 1) {
      setState(prev => ({
        ...prev,
        isRefreshing: true,
        pullDistance: threshold * 0.6,
      }));

      haptic('success');

      try {
        await onRefresh();
      } finally {
        setState({
          isPulling: false,
          isRefreshing: false,
          pullDistance: 0,
          progress: 0,
        });
      }
    } else {
      setState({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
        progress: 0,
      });
    }

    startY.current = 0;
    currentY.current = 0;
  }, [state.isPulling, state.progress, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    ...state,
  };
}
