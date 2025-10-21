import logoImage from "@/assets/pater-brown-logo.png";
import heroBackground from "@/assets/hero-background.jpg";
import castAntoine from "@/assets/cast-antoine.jpg";
import castWanja from "@/assets/cast-wanja.jpg";
import menuNeon from "@/assets/menu-neon.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Cinematic Premium */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 hero-overlay" />

        {/* Minimal Navigation */}
        <nav className="relative z-10 px-8 lg:px-16 py-10">
          <button className="hover:scale-110 transition-transform">
            <img 
              src={menuNeon} 
              alt="Menü" 
              className="h-16 lg:h-20 w-auto mix-blend-screen"
            />
          </button>
        </nav>

        {/* Hero Content - Dramatic & Focused */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <div className="max-w-6xl w-full mb-16 cinematic-enter">
            <img 
              src={logoImage} 
              alt="Pater Brown - Das Live-Hörspiel" 
              className="w-full h-auto drop-shadow-[0_0_60px_rgba(234,179,8,0.3)]"
            />
          </div>

          <div className="max-w-4xl text-center space-y-8 cinematic-enter" style={{ animationDelay: "0.3s" }}>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-[0.15em] uppercase text-foreground/95">
              Erlebe den Krimi-Sound live
            </h1>
            
            <div className="divider-gold w-32 mx-auto my-8" />
            
            <p className="text-xl md:text-2xl lg:text-3xl text-gold font-light leading-relaxed">
              Antoine Monot · Wanja Mues · Beatboxer Marvelin
            </p>

            <button className="btn-premium mt-12 cinematic-enter" style={{ animationDelay: "0.6s" }}>
              Tickets sichern
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 pb-8 flex justify-center">
          <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gold rounded-full mt-2 spotlight-effect" />
          </div>
        </div>
      </section>

      {/* Cast Section - Hollywood Treatment */}
      <section className="py-40 px-6 bg-gradient-to-b from-background to-card/30 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
        
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-32">
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">Die Stars</p>
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-heading tracking-wider text-foreground uppercase">
              Cast
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 max-w-6xl mx-auto">
            {/* Antoine Monot */}
            <div className="cast-spotlight premium-card p-0 overflow-hidden">
              <div className="relative overflow-hidden aspect-[3/4]">
                <img 
                  src={castAntoine} 
                  alt="Antoine Monot"
                  className="w-full h-full object-cover cast-image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
              <div className="p-8 relative z-10 -mt-20">
                <h3 className="text-4xl md:text-5xl font-heading tracking-wider text-foreground mb-2">
                  ANTOINE MONOT
                </h3>
                <p className="text-xl text-gold tracking-[0.2em] uppercase font-medium">
                  Pater Brown
                </p>
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                  Bekannt aus "Ein Fall für zwei"
                </p>
              </div>
            </div>

            {/* Wanja Mues */}
            <div className="cast-spotlight premium-card p-0 overflow-hidden">
              <div className="relative overflow-hidden aspect-[3/4]">
                <img 
                  src={castWanja} 
                  alt="Wanja Mues"
                  className="w-full h-full object-cover cast-image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
              <div className="p-8 relative z-10 -mt-20">
                <h3 className="text-4xl md:text-5xl font-heading tracking-wider text-foreground mb-2">
                  WANJA MUES
                </h3>
                <p className="text-xl text-gold tracking-[0.2em] uppercase font-medium">
                  Erzähler
                </p>
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                  Stimme der Spannung
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Das Erlebnis - Premium Storytelling */}
      <section className="py-40 px-6 bg-card/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-20">
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">Das Konzept</p>
            <h2 className="text-6xl md:text-8xl font-heading tracking-wider text-foreground uppercase mb-16">
              Das Erlebnis
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 mb-20">
            <div className="text-center space-y-4">
              <div className="text-6xl font-heading text-gold">01</div>
              <h3 className="text-2xl font-heading uppercase tracking-wide">Theater</h3>
              <p className="text-muted-foreground leading-relaxed">
                Live-Performance mit talentierten Sprechern
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="text-6xl font-heading text-gold">02</div>
              <h3 className="text-2xl font-heading uppercase tracking-wide">Klang & Beat</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sounddesign und Beatbox schaffen Atmosphäre
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="text-6xl font-heading text-gold">03</div>
              <h3 className="text-2xl font-heading uppercase tracking-wide">Crime-Event</h3>
              <p className="text-muted-foreground leading-relaxed">
                Spannung und Mystik verschmelzen
              </p>
            </div>
          </div>

          <div className="premium-card p-12 text-center space-y-8">
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Spüre die Spannung, wenn Pater Brown den Fall löst. Lausche der Stimme von Antoine Monot. 
              Erlebe die dramaturgische Kraft einer Sound-Bühne.
            </p>
            
            <div className="divider-gold w-48 mx-auto" />
            
            <p className="text-2xl md:text-3xl text-foreground font-light">
              Ein Abend, der bleibt.
            </p>
          </div>
        </div>
      </section>

      {/* Tour Dates - Premium List */}
      <section className="py-40 px-6 bg-gradient-to-b from-background to-card/20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-24">
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">Live Tour 2025/26</p>
            <h2 className="text-6xl md:text-8xl font-heading tracking-wider text-foreground uppercase">
              Termine
            </h2>
          </div>
          
          <div className="space-y-2 max-w-4xl mx-auto">
            {[
              { date: "12.11.2025", city: "Augsburg", venue: "Stadttheater", note: "Premiere" },
              { date: "08.01.2026", city: "Hamburg", venue: "Thalia Theater", note: "" },
              { date: "09.01.2026", city: "Bremen", venue: "Theater am Goetheplatz", note: "" },
              { date: "11.02.2026", city: "Neu-Isenburg", venue: "Hugenottenhalle", note: "" },
              { date: "17.02.2026", city: "München", venue: "Residenztheater", note: "" },
              { date: "18.02.2026", city: "Zürich", venue: "Schauspielhaus", note: "" },
            ].map((show, index) => (
              <div 
                key={index}
                className="tour-date-premium flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 group"
              >
                <div className="flex flex-col md:flex-row gap-6 md:gap-12 flex-1">
                  <span className="text-3xl md:text-4xl font-heading text-gold min-w-[160px] group-hover:scale-105 transition-transform">
                    {show.date}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-2xl md:text-3xl text-foreground font-light">
                      {show.city}
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">
                      {show.venue}
                    </span>
                  </div>
                  {show.note && (
                    <span className="self-start px-4 py-1.5 bg-gold/10 text-gold text-xs uppercase tracking-[0.2em] font-bold border border-gold/30">
                      {show.note}
                    </span>
                  )}
                </div>
                <button className="text-foreground hover:text-gold transition-all duration-300 font-medium uppercase tracking-[0.15em] text-base border-b-2 border-transparent hover:border-gold pb-1">
                  Tickets →
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-20">
            <button className="btn-premium">
              Alle Termine ansehen
            </button>
          </div>
        </div>
      </section>

      {/* Footer - Elegant */}
      <footer className="py-20 px-6 border-t border-gold/10 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 text-center md:text-left mb-16">
            <div>
              <h3 className="text-gold text-xs mb-4 tracking-[0.3em] uppercase font-bold">
                Kontakt
              </h3>
              <p className="text-foreground/80 text-sm leading-relaxed">
                info@paterbrown-live.de<br />
                +49 123 456 789
              </p>
            </div>

            <div>
              <h3 className="text-gold text-xs mb-4 tracking-[0.3em] uppercase font-bold">
                Spielzeiten
              </h3>
              <p className="text-foreground/80 text-sm leading-relaxed">
                Fr & Sa: 20:00 Uhr<br />
                So: 18:00 Uhr
              </p>
            </div>

            <div>
              <h3 className="text-gold text-xs mb-4 tracking-[0.3em] uppercase font-bold">
                Social
              </h3>
              <div className="flex gap-6 justify-center md:justify-start text-sm">
                <a href="#" className="text-foreground/80 hover:text-gold transition-colors">
                  Facebook
                </a>
                <a href="#" className="text-foreground/80 hover:text-gold transition-colors">
                  Instagram
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-gold text-xs mb-4 tracking-[0.3em] uppercase font-bold">
                Rechtliches
              </h3>
              <div className="flex flex-col gap-2 text-sm">
                <a href="#" className="text-foreground/80 hover:text-gold transition-colors">
                  Impressum
                </a>
                <a href="#" className="text-foreground/80 hover:text-gold transition-colors">
                  Datenschutz
                </a>
                <a href="#" className="text-foreground/80 hover:text-gold transition-colors">
                  AGB
                </a>
              </div>
            </div>
          </div>

          <div className="divider-gold mb-8" />

          <div className="text-center">
            <p className="text-muted-foreground text-xs tracking-wider">
              © 2025 Pater Brown Live-Hörspiel
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
