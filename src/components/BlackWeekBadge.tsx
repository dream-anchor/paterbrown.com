import { BLACK_WEEK_CONFIG } from "@/lib/blackWeekConfig";
import { Flame, Zap } from "lucide-react";

interface BlackWeekBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const BlackWeekBadge = ({ variant = 'compact', className = '' }: BlackWeekBadgeProps) => {
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-2 stoerer-badge px-6 py-3 rounded-xl text-sm md:text-base font-black uppercase tracking-wider ${className}`}>
        <Flame className="w-5 h-5 md:w-6 md:h-6 text-black fill-neon-gold animate-pulse" />
        <div className="flex flex-col items-center leading-none">
          <span className="text-black text-xs md:text-sm font-bold">{BLACK_WEEK_CONFIG.texts.badge}</span>
          <span className="text-black font-heading text-2xl md:text-3xl font-black -mt-1">{BLACK_WEEK_CONFIG.texts.discount}</span>
        </div>
        <Flame className="w-5 h-5 md:w-6 md:h-6 text-black fill-neon-gold animate-pulse" />
      </span>
    );
  }
  
  return (
    <div className={`inline-flex flex-col items-center gap-2 stoerer-badge px-8 py-4 rounded-xl backdrop-blur-md ${className}`}>
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-neon-gold fill-neon-gold animate-pulse" />
        <span className="text-black font-display text-base uppercase tracking-[0.15em] font-black">
          {BLACK_WEEK_CONFIG.texts.badge}
        </span>
        <Zap className="w-5 h-5 text-neon-gold fill-neon-gold animate-pulse" />
      </div>
      <span className="text-black font-black text-4xl tracking-tight text-neon-glow">
        {BLACK_WEEK_CONFIG.texts.discount}
      </span>
    </div>
  );
};
