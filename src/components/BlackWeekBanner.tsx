import { useState, useEffect } from 'react';
import { BLACK_WEEK_CONFIG, getTimeRemaining } from '@/lib/blackWeekConfig';
import { Zap, Flame, Clock } from 'lucide-react';

export const BlackWeekBanner = () => {
  const [timeLeft, setTimeLeft] = useState<string | null>(getTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 60000); // Update jede Minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="stoerer-banner py-4 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 relative z-10">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 md:w-8 md:h-8 text-black fill-neon-yellow animate-pulse" />
          <span className="text-stroke-white font-display text-2xl md:text-3xl font-black uppercase tracking-[0.2em] text-black">
            {BLACK_WEEK_CONFIG.texts.badge}
          </span>
          <Zap className="w-6 h-6 md:w-8 md:h-8 text-black fill-neon-yellow animate-pulse" />
        </div>
        
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-neon-yellow fill-neon-yellow animate-pulse" />
          <span className="text-black font-black text-xl md:text-2xl uppercase tracking-wider">
            {BLACK_WEEK_CONFIG.texts.discount}
          </span>
          <Flame className="w-6 h-6 text-neon-yellow fill-neon-yellow animate-pulse" />
        </div>
        
        {timeLeft && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/90 border-2 border-neon-yellow">
            <Clock className="w-4 h-4 text-neon-yellow" />
            <span className="text-xs md:text-sm text-white font-bold tracking-wide">
              {BLACK_WEEK_CONFIG.texts.countdown.replace('{time}', timeLeft)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
