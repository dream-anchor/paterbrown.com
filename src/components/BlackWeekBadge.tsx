import { BLACK_WEEK_CONFIG } from "@/lib/blackWeekConfig";

interface BlackWeekBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const BlackWeekBadge = ({ variant = 'compact', className = '' }: BlackWeekBadgeProps) => {
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center stoerer-badge px-3 py-2 rounded-xl ${className}`}>
        <span className="badge-30-percent text-lg">30%</span>
      </span>
    );
  }
  
  return (
    <div className={`inline-flex items-center stoerer-badge px-4 py-3 rounded-xl backdrop-blur-md gap-2 ${className}`}>
      <span className="badge-30-percent text-2xl">30%</span>
      <div className="flex flex-col items-center leading-none">
        <span className="text-black-neon text-3xl">Black</span>
        <span className="text-week-metal text-3xl" data-text="WEEK">WEEK</span>
      </div>
    </div>
  );
};
