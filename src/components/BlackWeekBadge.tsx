import { BLACK_WEEK_CONFIG } from "@/lib/blackWeekConfig";

interface BlackWeekBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const BlackWeekBadge = ({ variant = 'compact', className = '' }: BlackWeekBadgeProps) => {
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-1 bg-black text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-red-500/30 ${className}`}>
        ⚡ {BLACK_WEEK_CONFIG.texts.badge}
      </span>
    );
  }
  
  return (
    <div className={`inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg border-2 border-red-500 ${className}`}>
      <span className="text-red-500 font-bold text-sm uppercase tracking-wide">
        ⚡ {BLACK_WEEK_CONFIG.texts.badge}
      </span>
      <span className="text-gold font-bold text-lg">
        {BLACK_WEEK_CONFIG.texts.discount}
      </span>
    </div>
  );
};
