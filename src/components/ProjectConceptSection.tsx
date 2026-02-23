import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";
import { Zap } from "lucide-react";

const ProjectConceptSection = () => {
  const isBlackWeek = isBlackWeekActive();
  return (
    <section className="py-28 md:py-36 px-6 relative overflow-hidden" aria-labelledby="concept-heading">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.03] via-transparent to-transparent pointer-events-none" aria-hidden="true" />
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-24">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium">Das Konzept</p>
          <h2 id="concept-heading" className="text-5xl sm:text-6xl md:text-[8rem] font-heading text-foreground leading-[0.85] mb-12">
            Das Erlebnis
          </h2>
          <p className="text-xl md:text-2xl text-foreground/70 font-light leading-relaxed max-w-3xl mx-auto">
            Ein Abend voller Spannung, Humor und Gänsehaut.
          </p>
          <p className="text-lg md:text-xl text-gold/70 font-light leading-relaxed max-w-3xl mx-auto mt-4">
            Zwei Schauspieler. Alle Stimmen. Jeder verdächtig.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <article className="text-center space-y-4 p-8 border border-foreground/10 bg-card/10 transition-colors hover:border-gold/20">
            <div className="text-5xl mb-4" role="img" aria-label="Theater Maske">🎭</div>
            <h3 className="text-2xl font-heading text-gold">
              Theater trifft Hörspiel
            </h3>
            <p className="text-foreground/50 leading-relaxed text-sm">
              Live-Performance mit zwei bekannten Schauspielern
            </p>
          </article>
          
          <article className="text-center space-y-4 p-8 border border-foreground/10 bg-card/10 transition-colors hover:border-gold/20">
            <div className="text-5xl mb-4" role="img" aria-label="Mikrofon">🎤</div>
            <h3 className="text-2xl font-heading text-gold">
              Beatbox statt Geräusche
            </h3>
            <p className="text-foreground/50 leading-relaxed text-sm">
              Marvelin erschafft mit Loop-Station moderne Klangwelten
            </p>
          </article>
          
          <article className="text-center space-y-4 p-8 border border-foreground/10 bg-card/10 transition-colors hover:border-gold/20">
            <div className="text-5xl mb-4" role="img" aria-label="Lupe">🔍</div>
            <h3 className="text-2xl font-heading text-gold">
              Crime-Event
            </h3>
            <p className="text-foreground/50 leading-relaxed text-sm">
              Spannung und Mystik nach G.K. Chesterton
            </p>
          </article>
        </div>

        <div className="max-w-3xl mx-auto mt-12 border border-foreground/10 p-10 text-center">
          <p className="text-foreground/80 leading-relaxed text-lg md:text-xl font-light">
            Mit Wanja Mues und Antoine Monot, bekannt aus der ZDF-Serie „Ein Fall für Zwei", erleben Sie die TV-Stars live auf der Bühne.
          </p>
        </div>

        <div className="text-center mt-16 mb-16">
          <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer" aria-label="Jetzt Tickets für Pater Brown Live-Hörspiel sichern">
            <button className="btn-premium" type="button">
              🎟 Jetzt Tickets sichern
            </button>
          </a>
        </div>

        <div className="border border-foreground/10 p-12 text-center space-y-8">
          <p className="text-xl md:text-2xl text-foreground/60 leading-relaxed max-w-3xl mx-auto font-light">
            Eine einzigartige Verschmelzung von Theater, 
            Sound und Spannung. Beatboxer und Loop Artist Marvelin liefert den rhythmischen Heartbeat dieser Crime-Show.
          </p>
          
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent max-w-lg mx-auto" />
          
          <p className="text-3xl md:text-4xl text-foreground font-heading italic">
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
