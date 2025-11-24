import { memo } from "react";
import { showCases } from "@/data/castData";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";

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
          <h2 id="program-heading" className="text-6xl md:text-8xl font-heading tracking-wider text-foreground uppercase">
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
            <a href="https://www.eventim.de" target="_blank" rel="noopener noreferrer">
              <div className="bw-box-banner inline-flex items-center gap-4 px-8 md:px-10 py-5 md:py-6 rounded-xl hover:scale-[1.02] transition-transform">
                <span className="font-['Pacifico'] text-xl md:text-2xl text-neon-tubing">
                  BLACK WEEK
                </span>
                <span className="price-tag-red text-lg md:text-xl font-black">
                  30%
                </span>
                <span className="text-foreground/90 text-sm md:text-base font-medium">
                  auf alle Termine bis 1.12.
                </span>
              </div>
            </a>
          </div>
        )}
      </div>
    </section>
  );
});

ShowConceptSection.displayName = 'ShowConceptSection';

export default ShowConceptSection;
