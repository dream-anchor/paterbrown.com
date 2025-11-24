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
          className="sticky-cta-premium px-4 py-3 md:px-6 md:py-4 rounded-full shadow-2xl flex items-center gap-2 md:gap-3 transition-all duration-300 animate-pulse-glow"
          type="button"
        >
          <span className="font-['Pacifico'] text-sm md:text-base text-neon-tubing whitespace-nowrap">
            BLACK WEEK
          </span>
          <span className="price-tag-red text-xs md:text-sm font-black whitespace-nowrap">
            30%
          </span>
        </button>
      </a>
    </div>
  );
};
