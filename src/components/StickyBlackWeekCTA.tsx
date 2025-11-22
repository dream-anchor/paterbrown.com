import { Flame } from "lucide-react";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";

export const StickyBlackWeekCTA = () => {
  const isBlackWeek = isBlackWeekActive();

  if (!isBlackWeek) return null;

  return (
    <div className="fixed bottom-8 right-4 md:bottom-12 md:right-6 z-50 max-w-[calc(100vw-2rem)]">
      <a 
        href={EVENTIM_AFFILIATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Black Week: 30% Rabatt bis 1.12."
      >
        <button 
          className="sticky-cta-premium px-3 py-2 md:px-6 md:py-3 rounded-full shadow-2xl flex items-center gap-2 transition-all duration-300"
          type="button"
        >
          <Flame className="w-4 h-4 md:w-5 md:h-5 text-black" />
          <span className="text-black font-black text-[10px] md:text-xs uppercase tracking-wide whitespace-nowrap leading-tight">
            🔥 Jetzt letzte Tickets sichern – 30% Rabatt bis 1.12.
          </span>
        </button>
      </a>
    </div>
  );
};
