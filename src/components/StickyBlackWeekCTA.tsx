import { Flame } from "lucide-react";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";

export const StickyBlackWeekCTA = () => {
  const isBlackWeek = isBlackWeekActive();

  if (!isBlackWeek) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 max-w-[calc(100vw-2rem)]">
      <a 
        href={EVENTIM_AFFILIATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Black Week: 30% Rabatt sichern"
      >
        <button 
          className="sticky-cta-premium px-4 py-2 md:px-8 md:py-4 rounded-full shadow-2xl flex items-center gap-2 md:gap-3 transition-all duration-300"
          type="button"
        >
          <Flame className="w-4 h-4 md:w-6 md:h-6 text-black" />
          <div className="flex items-center gap-1">
            <span className="badge-30-percent text-sm md:text-base">30%</span>
            <span className="text-black font-black text-xs md:text-sm uppercase tracking-wide whitespace-nowrap">
              Rabatt sichern
            </span>
          </div>
        </button>
      </a>
    </div>
  );
};
