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
    <div className="stoerer-banner py-3 md:py-4 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 relative z-10">
        <div className="flex items-center gap-2 md:gap-3">
          <Zap className="w-5 h-5 md:w-7 md:h-7 text-black fill-neon-yellow animate-pulse" />
          <span className="font-heading text-xl md:text-3xl font-black uppercase tracking-[0.15em] text-black" style={{ textShadow: '2px 2px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white' }}>
            {BLACK_WEEK_CONFIG.texts.badge}
          </span>
          <Zap className="w-5 h-5 md:w-7 md:h-7 text-black fill-neon-yellow animate-pulse" />
        </div>
        
        <div className="flex items-center gap-2">
          <Flame className="w-7 h-7 md:w-9 md:h-9 text-neon-yellow fill-neon-yellow animate-pulse" />
          <span className="text-black font-heading font-black text-3xl md:text-5xl uppercase tracking-tight">
            {BLACK_WEEK_CONFIG.texts.discount}
          </span>
          <Flame className="w-7 h-7 md:w-9 md:h-9 text-neon-yellow fill-neon-yellow animate-pulse" />
        </div>
        
        {timeLeft && (
          <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-black/90 border-2 border-neon-yellow shadow-lg">
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-neon-yellow animate-pulse" />
            <span className="text-xs md:text-sm text-white font-bold tracking-wide">
              {BLACK_WEEK_CONFIG.texts.countdown.replace('{time}', timeLeft)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
