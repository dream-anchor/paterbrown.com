import { memo } from "react";
import { showCases } from "@/data/castData";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";
import { Flame } from "lucide-react";

const ShowConceptSection = memo(() => {
  return (
    <section 
      className="py-28 md:py-36 px-6"
      aria-labelledby="program-heading"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-24">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium">
            Zwei Kriminalfälle an einem Abend
          </p>
          <h2 id="program-heading" className="text-5xl sm:text-6xl md:text-[8rem] font-heading text-foreground leading-[0.85]">
            Das Programm
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {showCases.map((showCase) => (
            <article 
              key={showCase.id} 
              className="p-8 border border-foreground/10 bg-card/10 space-y-6 transition-colors hover:border-gold/20"
            >
              <h3 className="text-3xl md:text-4xl font-heading text-gold">
                {showCase.title}
              </h3>
              <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24" />
              <p className="text-foreground/70 leading-relaxed text-lg font-light">
                {showCase.description}
              </p>
            </article>
          ))}
        </div>

        <div className="text-center mt-16 space-y-4">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent max-w-lg mx-auto" />
          <p className="text-xl md:text-2xl text-foreground/60 font-light">
            Gesamtdauer: ca. 2 Stunden inkl. 15-minütiger Pause
          </p>
        </div>

        {isBlackWeekActive() && (
          <div className="text-center mt-12">
            <div className="stoerer-badge inline-flex items-center gap-3 px-8 py-4 rounded-lg">
              <Flame className="w-6 h-6 text-black fill-neon-gold" />
              <p className="text-black font-black text-lg uppercase tracking-wide">
                BLACK WEEK – 30% auf alle Termine bis 1.12.
              </p>
              <Flame className="w-6 h-6 text-black fill-neon-gold" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

ShowConceptSection.displayName = 'ShowConceptSection';

export default ShowConceptSection;
