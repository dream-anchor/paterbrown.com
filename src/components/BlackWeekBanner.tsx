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
    <div className="bg-gradient-to-r from-black via-red-950/50 to-black border-y border-red-500/30 py-3 px-4 text-center animate-pulse-subtle">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
        <span className="text-red-500 font-bold text-sm md:text-base uppercase tracking-wider">
          ⚡ {BLACK_WEEK_CONFIG.texts.banner}
        </span>
        {timeLeft && (
          <span className="text-gold/90 text-xs md:text-sm font-medium">
            ⏰ {BLACK_WEEK_CONFIG.texts.countdown.replace('{time}', timeLeft)}
          </span>
        )}
      </div>
    </div>
  );
};
