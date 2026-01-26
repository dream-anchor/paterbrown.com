import React from "react";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshContainerProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  disabled?: boolean;
}

/**
 * Container that enables pull-to-refresh functionality for mobile lists
 */
export function PullToRefreshContainer({
  children,
  onRefresh,
  className,
  disabled = false,
}: PullToRefreshContainerProps) {
  const { containerRef, isPulling, isRefreshing, pullDistance, progress } = usePullToRefresh({
    onRefresh,
    threshold: 80,
  });

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      style={{ touchAction: isPulling ? 'none' : 'auto' }}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-0 right-0 flex items-center justify-center transition-all duration-200",
          "pointer-events-none z-10"
        )}
        style={{
          top: -60,
          transform: `translateY(${pullDistance}px)`,
          opacity: progress,
        }}
      >
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full",
            "bg-white shadow-lg border border-gray-200",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)`,
          }}
        >
          <RefreshCw
            className={cn(
              "w-5 h-5 transition-colors",
              progress >= 1 ? "text-amber-500" : "text-gray-400"
            )}
          />
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        style={{
          transform: isPulling || isRefreshing ? `translateY(${pullDistance}px)` : undefined,
          transition: isPulling ? undefined : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default PullToRefreshContainer;
