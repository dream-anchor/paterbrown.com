import { Zap } from "lucide-react";

export const LiveViewerCount = () => {
  return (
    <div className="bg-gold/10 border border-gold/30 rounded-lg px-4 md:px-6 py-3 mb-8 text-center animate-fade-in">
      <p className="text-gold text-sm md:text-base flex items-center justify-center gap-2 flex-wrap">
        <Zap className="w-4 h-4" aria-hidden="true" />
        <span className="font-bold">Viele Besucher schauen sich Tickets an</span>
      </p>
    </div>
  );
};
