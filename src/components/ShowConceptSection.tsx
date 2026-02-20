import { memo } from "react";
import { showCases } from "@/data/castData";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";
import { Flame } from "lucide-react";

const ShowConceptSection = memo(() => {
  return (
    <section 
      className="py-24 px-6 bg-gradient-to-b from-card/20 to-background"
      aria-labelledby="program-heading"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-24">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">
            Zwei Kriminalfälle an einem Abend
          </p>
          <h2 id="program-heading" className="text-4xl sm:text-6xl md:text-8xl font-heading tracking-wider text-foreground uppercase">
            Das Programm
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {showCases.map((showCase) => (
            <article 
              key={showCase.id} 
              className="premium-card p-8 space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-4xl font-heading tracking-wider text-gold uppercase">
                  {showCase.title}
                </h3>
              </div>
              <div className="divider-gold w-24" aria-hidden="true" />
              <p className="text-foreground/90 leading-relaxed">
                {showCase.description}
              </p>
            </article>
          ))}
        </div>

        <div className="text-center mt-16 space-y-4">
          <div className="divider-gold w-48 mx-auto opacity-50" aria-hidden="true" />
          <p className="text-xl md:text-2xl text-foreground/80 font-light">
            Gesamtdauer: ca. 2 Stunden inkl. 15-minütiger Pause
          </p>
        </div>

        {/* Black Week CTA Banner */}
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
