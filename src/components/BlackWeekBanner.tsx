import { useState, useEffect } from 'react';
import { BLACK_WEEK_CONFIG, getTimeRemaining } from '@/lib/blackWeekConfig';
import { EVENTIM_AFFILIATE_URL } from '@/lib/constants';
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
    <a 
      href={EVENTIM_AFFILIATE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="stoerer-banner py-3 md:py-4 px-4 overflow-hidden block cursor-pointer hover:brightness-110 transition-all"
      aria-label="Black Week: 30% Rabatt sichern"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 relative z-10">
        <div className="flex items-center gap-2 md:gap-3">
          <Zap className="w-5 h-5 md:w-7 md:h-7 text-black-week-neon fill-black-week-neon drop-shadow-lg" />
          <span className="font-display text-xl md:text-2xl lg:text-3xl font-normal text-black-week-neon animate-neon-flicker" style={{ 
            textShadow: '0 0 10px hsl(22 100% 50%), 0 0 20px hsl(22 100% 50%), 0 0 30px hsl(22 100% 50%)',
            fontStyle: 'italic'
          }}>
            {BLACK_WEEK_CONFIG.texts.badge}
          </span>
          <Zap className="w-5 h-5 md:w-7 md:h-7 text-black-week-neon fill-black-week-neon drop-shadow-lg" />
        </div>
        
        <div className="flex items-center gap-2">
          <Flame className="w-7 h-7 md:w-9 md:h-9 text-white fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <span className="text-white font-heading font-black text-2xl md:text-3xl lg:text-5xl uppercase tracking-tight text-industrial-3d">
            {BLACK_WEEK_CONFIG.texts.discount}
          </span>
          <Flame className="w-7 h-7 md:w-9 md:h-9 text-white fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        </div>
        
        {timeLeft && (
          <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-black-week-dark/95 border-2 border-white shadow-lg">
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
            <span className="text-xs md:text-sm text-white font-bold tracking-wide">
              {BLACK_WEEK_CONFIG.texts.countdown.replace('{time}', timeLeft)}
            </span>
          </div>
        )}
      </div>
    </a>
  );
};
