import { Flame } from "lucide-react";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";

const StickyMobileCTA = () => {
  const isBlackWeek = isBlackWeekActive();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
      <a
        href={EVENTIM_AFFILIATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label={isBlackWeek ? "Black Week: 30% Rabatt sichern" : "Tickets sichern"}
      >
        <div
          className="flex items-center justify-center gap-2 py-3 px-4"
          style={{
            background: "linear-gradient(135deg, hsl(28 100% 55%), hsl(28 90% 45%))",
            boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.5)",
          }}
        >
          {isBlackWeek && <Flame className="w-4 h-4 text-black" />}
          <span className="text-black font-black text-sm uppercase tracking-wide">
            {isBlackWeek ? "30% Rabatt sichern" : "Tickets sichern"}
          </span>
        </div>
      </a>
    </div>
  );
};

export default StickyMobileCTA;
