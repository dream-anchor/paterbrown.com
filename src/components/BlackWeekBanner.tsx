import { useState, useEffect } from 'react';
import { BLACK_WEEK_CONFIG, getTimeRemaining } from '@/lib/blackWeekConfig';
import { EVENTIM_AFFILIATE_URL } from '@/lib/constants';
import { Clock } from 'lucide-react';
import blackWeekLogo from '@/assets/black-week-logo.png';

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
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 relative z-10">
        {/* Black Week Logo */}
        <img 
          src={blackWeekLogo} 
          alt="Black Week 30%" 
          className="h-16 md:h-24 lg:h-32 w-auto object-contain"
        />
        
        {/* Countdown mit rotem Preisschild-Design */}
        {timeLeft && (
          <div className="price-tag-red flex items-center gap-2 px-4 py-2 md:px-5 md:py-3 rounded-lg shadow-lg">
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
