import { useState, useEffect } from 'react';
import { BLACK_WEEK_CONFIG, getTimeRemaining } from '@/lib/blackWeekConfig';
import { EVENTIM_AFFILIATE_URL } from '@/lib/constants';
import { Clock } from 'lucide-react';

export const BlackWeekBanner = () => {
  const [timeLeft, setTimeLeft] = useState<string | null>(getTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <a 
      href={EVENTIM_AFFILIATE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="stoerer-banner py-4 md:py-5 px-4 overflow-hidden block cursor-pointer hover:brightness-105 transition-all"
      aria-label="Black Week: 30% Rabatt sichern"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-3 md:gap-8 relative z-10">
        <span className="font-['Pacifico'] text-3xl md:text-5xl lg:text-6xl text-neon-tubing animate-neon-pulse">
          BLACK WEEK
        </span>
        
        <span className="price-tag-red text-2xl md:text-4xl lg:text-5xl font-black uppercase animate-tag-sway">
          30%
        </span>
        
        {timeLeft && (
          <div className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-black/95 border-2 border-[hsl(45,100%,50%)] shadow-lg">
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-[hsl(45,100%,50%)]" />
            <span className="text-xs md:text-sm text-white font-bold tracking-wide">
              {BLACK_WEEK_CONFIG.texts.countdown.replace('{time}', timeLeft)}
            </span>
          </div>
        )}
      </div>
    </a>
  );
};
