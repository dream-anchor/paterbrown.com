import { Flame } from "lucide-react";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";

export const StickyBlackWeekCTA = () => {
  const isBlackWeek = isBlackWeekActive();

  if (!isBlackWeek) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 animate-bounce-subtle">
      <a 
        href={EVENTIM_AFFILIATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Black Week: 30% Rabatt sichern"
      >
        <button 
          className="stoerer-badge px-6 py-3 md:px-8 md:py-4 rounded-full shadow-2xl flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform"
          type="button"
        >
          <Flame className="w-5 h-5 md:w-6 md:h-6 text-black fill-neon-gold animate-pulse" />
          <span className="text-black font-black text-sm md:text-base uppercase tracking-wide whitespace-nowrap">
            30% sichern – Nur diese Woche!
          </span>
        </button>
      </a>
    </div>
  );
};
