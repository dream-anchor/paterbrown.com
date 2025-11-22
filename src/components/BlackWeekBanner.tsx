import { useState, useEffect } from 'react';
import { BLACK_WEEK_CONFIG, getTimeRemaining } from '@/lib/blackWeekConfig';

export const BlackWeekBanner = () => {
  const [timeLeft, setTimeLeft] = useState<string | null>(getTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 60000); // Update jede Minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="black-week-banner-premium border-y border-gold/20 py-4 px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 relative z-10">
        <div className="flex items-center gap-3">
          <span className="text-gold black-week-glow font-display text-lg md:text-xl uppercase tracking-[0.2em]">
            {BLACK_WEEK_CONFIG.texts.banner}
          </span>
        </div>
        {timeLeft && (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/40 backdrop-blur-sm border border-gold/30">
            <span className="text-xs md:text-sm text-gold/90 font-medium tracking-wide">
              {BLACK_WEEK_CONFIG.texts.countdown.replace('{time}', timeLeft)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
