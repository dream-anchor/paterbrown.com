import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";
import { Zap } from "lucide-react";

const concepts = [
  {
    number: "I",
    title: "Theater\ntrifft Hörspiel",
    description: "Zwei Schauspieler schlüpfen live in sämtliche Rollen — ohne Kulisse, ohne Schnitt. Pures Schauspiel.",
  },
  {
    number: "II",
    title: "Beatbox\nstatt Geräusche",
    description: "Marvelin erschafft mit Loop-Station und Stimme eine Klangwelt, die jede Szene atmen lässt.",
  },
  {
    number: "III",
    title: "Crime\nEvent",
    description: "Kriminalfälle nach G.K. Chesterton — mit Witz, Wendungen und der nötigen Portion Gänsehaut.",
  },
];

const ProjectConceptSection = () => {
  const isBlackWeek = isBlackWeekActive();
  return (
    <section className="py-28 md:py-36 px-6 relative overflow-hidden" aria-labelledby="concept-heading">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.03] via-transparent to-transparent pointer-events-none" aria-hidden="true" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-24">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium">Das Konzept</p>
          <h2 id="concept-heading" className="text-5xl sm:text-6xl md:text-[8rem] font-heading text-foreground leading-[0.85]">
            Das Erlebnis
          </h2>
        </div>

        {/* Drei Konzept-Säulen — typografisch, kein Emoji */}
        <div className="grid md:grid-cols-3 gap-0 mb-24">
          {concepts.map((item, i) => (
            <article
              key={item.number}
              className={`relative px-8 md:px-10 py-12 md:py-16 group ${
                i < concepts.length - 1 ? "md:border-r md:border-foreground/10" : ""
              }`}
            >
              <span className="block text-gold/30 text-[5rem] md:text-[7rem] font-heading leading-none select-none" aria-hidden="true">
                {item.number}
              </span>
              <h3 className="text-3xl md:text-4xl font-heading text-foreground leading-[0.95] mt-4 whitespace-pre-line">
                {item.title}
              </h3>
              <div className="h-[1px] bg-gradient-to-r from-gold/50 to-transparent w-16 mt-6 mb-6" />
              <p className="text-foreground/50 leading-relaxed text-base">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        {/* Cinematisches Zitat-Element */}
        <div className="relative max-w-4xl mx-auto text-center py-16">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-16" />
          <blockquote>
            <p className="text-2xl md:text-4xl lg:text-5xl font-heading text-foreground/90 leading-tight italic">
              Zwei Schauspieler. Alle Stimmen.
              <br />
              <span className="neon-gold-subtle">Jeder verdächtig.</span>
            </p>
          </blockquote>
          <p className="text-foreground/40 text-base md:text-lg font-light mt-10 max-w-2xl mx-auto leading-relaxed">
            Mit Wanja Mues und Antoine Monot, bekannt aus der ZDF-Serie
            „Ein Fall für Zwei", erleben Sie die TV-Stars live auf der Bühne.
          </p>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent mt-16" />
        </div>

        {/* CTA */}
        <div className="text-center mt-8 mb-8">
          <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer" aria-label="Jetzt Tickets für Pater Brown Live-Hörspiel sichern">
            <button className="btn-premium" type="button">
              Jetzt Tickets sichern
            </button>
          </a>
        </div>

        {/* Abschluss-Statement */}
        <div className="max-w-3xl mx-auto mt-20 text-center space-y-8">
          <p className="text-xl md:text-2xl text-foreground/50 leading-relaxed font-light">
            Eine einzigartige Verschmelzung von Theater,
            Sound und Spannung. Beatboxer Marvelin liefert den rhythmischen Heartbeat dieser Crime-Show.
          </p>
          <p className="text-3xl md:text-5xl text-foreground font-heading italic neon-gold-subtle">
            Ein Abend, der bleibt.
          </p>
        </div>

        {isBlackWeek && (
          <div className="max-w-2xl mx-auto mt-16">
            <div className="bg-gold/10 border-2 border-gold/30 px-8 py-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-gold fill-gold" />
                <h3 className="text-2xl font-heading text-gold">
                  BLACK WEEK – Jetzt sparen!
                </h3>
                <Zap className="w-6 h-6 text-gold fill-gold" />
              </div>
              <p className="text-foreground/80 text-lg mb-4">
                30% Rabatt auf alle Termine – nur bis 1. Dezember
              </p>
              <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer">
                <button className="btn-premium" type="button">
                  Jetzt 30% Rabatt sichern
                </button>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
export default ProjectConceptSection;
