interface BlackWeekBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const BlackWeekBadge = ({ variant = 'compact', className = '' }: BlackWeekBadgeProps) => {
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-3 md:gap-4 stoerer-badge px-5 py-2.5 md:px-6 md:py-3 rounded-xl ${className}`}>
        <span className="font-['Pacifico'] text-lg md:text-xl text-neon-tubing">
          BLACK WEEK
        </span>
        <span className="price-tag-red text-base md:text-lg font-black">
          30%
        </span>
      </span>
    );
  }
  
  return (
    <div className={`inline-flex flex-col items-center gap-3 stoerer-badge px-8 py-5 rounded-xl ${className}`}>
      <span className="font-['Pacifico'] text-2xl md:text-3xl text-neon-tubing">
        BLACK WEEK
      </span>
      <span className="price-tag-red text-3xl md:text-4xl font-black">
        30%
      </span>
    </div>
  );
};
