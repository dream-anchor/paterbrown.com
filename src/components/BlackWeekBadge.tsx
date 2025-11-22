import { BLACK_WEEK_CONFIG } from "@/lib/blackWeekConfig";

interface BlackWeekBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const BlackWeekBadge = ({ variant = 'compact', className = '' }: BlackWeekBadgeProps) => {
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-2 black-week-badge-premium px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${className}`}>
        <span className="text-gold">{BLACK_WEEK_CONFIG.texts.badge}</span>
        <span className="text-copper text-[10px]">{BLACK_WEEK_CONFIG.texts.discount}</span>
      </span>
    );
  }
  
  return (
    <div className={`inline-flex flex-col items-center gap-1 black-week-badge-premium px-6 py-3 rounded-lg backdrop-blur-md ${className}`}>
      <span className="text-gold font-display text-sm uppercase tracking-[0.15em] black-week-glow">
        {BLACK_WEEK_CONFIG.texts.badge}
      </span>
      <span className="text-copper font-bold text-xl tracking-tight">
        {BLACK_WEEK_CONFIG.texts.discount}
      </span>
    </div>
  );
};
