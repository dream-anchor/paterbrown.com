import { BLACK_WEEK_CONFIG } from "@/lib/blackWeekConfig";
import { Flame, Zap } from "lucide-react";

interface BlackWeekBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const BlackWeekBadge = ({ variant = 'compact', className = '' }: BlackWeekBadgeProps) => {
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-2 stoerer-badge px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider ${className}`}>
        <Flame className="w-4 h-4 text-black fill-neon-yellow" />
        <span className="text-black">{BLACK_WEEK_CONFIG.texts.badge}</span>
        <span className="text-neon-yellow text-sm font-black">{BLACK_WEEK_CONFIG.texts.discount}</span>
        <Flame className="w-4 h-4 text-black fill-neon-yellow" />
      </span>
    );
  }
  
  return (
    <div className={`inline-flex flex-col items-center gap-2 stoerer-badge px-8 py-4 rounded-xl backdrop-blur-md ${className}`}>
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-neon-yellow fill-neon-yellow animate-pulse" />
        <span className="text-black font-display text-base uppercase tracking-[0.15em] font-black">
          {BLACK_WEEK_CONFIG.texts.badge}
        </span>
        <Zap className="w-5 h-5 text-neon-yellow fill-neon-yellow animate-pulse" />
      </div>
      <span className="text-black font-black text-4xl tracking-tight text-neon-glow">
        {BLACK_WEEK_CONFIG.texts.discount}
      </span>
    </div>
  );
};
