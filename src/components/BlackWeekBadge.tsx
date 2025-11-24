import { BLACK_WEEK_CONFIG } from "@/lib/blackWeekConfig";
import { Flame, Zap } from "lucide-react";

interface BlackWeekBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const BlackWeekBadge = ({ variant = 'compact', className = '' }: BlackWeekBadgeProps) => {
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-2 stoerer-badge px-6 py-3 rounded-lg text-sm md:text-base font-black uppercase tracking-wider animate-tag-wobble ${className}`}>
        <Flame className="w-5 h-5 md:w-6 md:h-6 text-white fill-white drop-shadow-lg" />
        <div className="flex flex-col items-center leading-none">
          <span className="text-white text-xs md:text-sm font-bold drop-shadow-md">{BLACK_WEEK_CONFIG.texts.badge}</span>
          <span className="text-white font-heading text-2xl md:text-3xl font-black -mt-1 drop-shadow-md">{BLACK_WEEK_CONFIG.texts.discount}</span>
        </div>
        <Flame className="w-5 h-5 md:w-6 md:h-6 text-white fill-white drop-shadow-lg" />
      </span>
    );
  }
  
  return (
    <div className={`inline-flex flex-col items-center gap-2 stoerer-badge px-8 py-4 rounded-lg backdrop-blur-sm animate-tag-wobble ${className}`}>
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-white fill-white drop-shadow-lg" />
        <span className="text-white font-display text-base tracking-[0.15em] font-normal" style={{ 
          textShadow: '0 0 10px hsl(22 100% 50%), 0 0 20px hsl(22 100% 50%)',
          fontStyle: 'italic'
        }}>
          {BLACK_WEEK_CONFIG.texts.badge}
        </span>
        <Zap className="w-5 h-5 text-white fill-white drop-shadow-lg" />
      </div>
      <span className="text-white font-heading font-black text-4xl tracking-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
        {BLACK_WEEK_CONFIG.texts.discount}
      </span>
    </div>
  );
};
