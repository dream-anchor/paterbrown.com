import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";
import { Zap } from "lucide-react";

const ProjectConceptSection = () => {
  const isBlackWeek = isBlackWeekActive();
  return <section className="py-24 px-6 bg-card/20 relative overflow-hidden" aria-labelledby="concept-heading">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" aria-hidden="true" />
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-24">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">Das Konzept</p>
          <h2 id="concept-heading" className="text-4xl sm:text-6xl md:text-8xl font-heading tracking-wider text-foreground uppercase mb-12">
            Das Erlebnis
          </h2>
          <p className="text-xl md:text-2xl text-foreground/90 font-light leading-relaxed max-w-3xl mx-auto">
            Ein Abend voller Spannung, Humor und Gänsehaut.
          </p>
          <p className="text-lg md:text-xl text-gold/80 font-light leading-relaxed max-w-3xl mx-auto mt-4">
            Zwei Schauspieler. Alle Stimmen. Jeder verdächtig.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <article className="text-center space-y-4 premium-card p-6">
            <div className="text-5xl mb-4" role="img" aria-label="Theater Maske">🎭</div>
            <h3 className="text-2xl font-heading uppercase tracking-wide text-gold">
              Theater trifft Hörspiel
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Live-Performance mit zwei bekannten Schauspielern
            </p>
          </article>
          
          <article className="text-center space-y-4 premium-card p-6">
            <div className="text-5xl mb-4" role="img" aria-label="Mikrofon">🎤</div>
            <h3 className="text-2xl font-heading uppercase tracking-wide text-gold">
              Beatbox statt Geräusche
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Marvelin erschafft mit Loop-Station moderne Klangwelten
            </p>
          </article>
          
          <article className="text-center space-y-4 premium-card p-6">
            <div className="text-5xl mb-4" role="img" aria-label="Lupe">🔍</div>
            <h3 className="text-2xl font-heading uppercase tracking-wide text-gold">
              Crime-Event
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Spannung und Mystik nach G.K. Chesterton
            </p>
          </article>
        </div>

        <div className="max-w-3xl mx-auto mt-12 premium-card p-8">
          <p className="text-foreground/90 leading-relaxed text-center text-lg md:text-xl">Mit Wanja Mues und Antoine Monot, bekannt aus der ZDF-Serie „Ein Fall für Zwei", erleben Sie die TV-Stars live auf der Bühne.</p>
        </div>

        <div className="text-center mt-16 mb-16">
          <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer" aria-label="Jetzt Tickets für Pater Brown Live-Hörspiel sichern">
            <button className="btn-premium" type="button">
              <span aria-hidden="true" role="img" aria-label="Ticket">🎟</span> Jetzt Tickets sichern
            </button>
          </a>
        </div>

        <div className="premium-card p-12 text-center space-y-8">
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Eine einzigartige Verschmelzung von Theater, 
            Sound und Spannung. Beatboxer und Loop Artist Marvelin liefert den rhythmischen Heartbeat dieser Crime-Show.
          </p>
          
          <div className="divider-gold w-48 mx-auto" aria-hidden="true" />
          
          <p className="text-2xl md:text-3xl text-foreground font-light">
            Ein Abend, der bleibt.
          </p>
        </div>

        {/* Black Week Box Banner */}
        {isBlackWeek && (
          <div className="max-w-2xl mx-auto mt-16">
            <div className="bg-gold/10 border-2 border-gold/30 rounded-lg px-8 py-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-gold fill-gold" />
                <h3 className="text-2xl font-heading tracking-wider text-gold uppercase">
                  BLACK WEEK – Jetzt sparen!
                </h3>
                <Zap className="w-6 h-6 text-gold fill-gold" />
              </div>
              <p className="text-foreground/90 text-lg mb-4">
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
    </section>;
};
export default ProjectConceptSection;