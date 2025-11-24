import { BLACK_WEEK_CONFIG } from "@/lib/blackWeekConfig";
import blackWeekLogo from '@/assets/black-week-logo.png';

interface BlackWeekBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const BlackWeekBadge = ({ variant = 'compact', className = '' }: BlackWeekBadgeProps) => {
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center stoerer-badge px-4 py-2 rounded-xl ${className}`}>
        <img 
          src={blackWeekLogo} 
          alt="Black Week 30%" 
          className="h-12 md:h-16 w-auto object-contain"
        />
      </span>
    );
  }
  
  return (
    <div className={`inline-flex items-center stoerer-badge px-6 py-3 rounded-xl backdrop-blur-md ${className}`}>
      <img 
        src={blackWeekLogo} 
        alt="Black Week 30%" 
        className="h-20 md:h-24 w-auto object-contain"
      />
    </div>
  );
};
