import { useState, useEffect } from "react";
import logoImage from "@/assets/pater-brown-logo.png";
import heroBackground from "@/assets/hero-background.jpg";
import castAntoine from "@/assets/cast-antoine.jpg";
import castWanja from "@/assets/cast-wanja.jpg";
import StickyHeader from "@/components/StickyHeader";
import NewsletterSection from "@/components/NewsletterSection";
import { Instagram, Facebook } from "lucide-react";

const Index = () => {
  const [logoAnimating, setLogoAnimating] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Start animation at 200px
      if (scrollY > 200 && !logoAnimating) {
        setLogoAnimating(true);
        // Show sticky header after animation completes
        setTimeout(() => setShowStickyHeader(true), 600);
      } else if (scrollY <= 200 && logoAnimating) {
        setLogoAnimating(false);
        setShowStickyHeader(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [logoAnimating]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      {showStickyHeader && <StickyHeader />}

      {/* Hero Section - Cinematic Premium */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 hero-overlay" />

        {/* Hero Content - Dramatic & Focused */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20 pt-20">
          <div className={`max-w-6xl w-full mb-16 cinematic-enter transition-all duration-700 ${
            logoAnimating 
              ? `fixed top-3 left-6 !max-w-[120px] z-[100] ${showStickyHeader ? 'opacity-0' : 'opacity-100'}`
              : 'relative'
          }`}>
            <img 
              src={logoImage} 
              alt="Pater Brown - Das Live-Hörspiel" 
              className="w-full h-auto drop-shadow-[0_0_60px_rgba(234,179,8,0.3)]"
            />
          </div>

          <div className="max-w-4xl text-center space-y-8 cinematic-enter" style={{ animationDelay: "0.3s" }}>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-light tracking-[0.1em] text-foreground/95 leading-tight">
              Wenn Spannung sichtbar wird: Pater Brown LIVE – Krimi, Klang & Gänsehaut auf der Bühne.
            </h1>
            
            <div className="divider-gold w-32 mx-auto my-8" />
            
            <p className="text-lg md:text-xl lg:text-2xl text-gold/90 font-light leading-relaxed">
              Ein Live-Hörspiel mit Wanja Mues & Antoine Monot – wo Stimme, Klang und Beat zum Krimi werden.
            </p>

            <div className="divider-gold w-16 mx-auto my-6 opacity-50" />

            <p className="text-base md:text-lg text-muted-foreground font-light">
              Mit Beatboxer Marvelin
            </p>

            <a 
              href="https://www.eventim.de/noapp/artist/antoine-monot/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="btn-premium mt-12 cinematic-enter" style={{ animationDelay: "0.6s" }}>
                🎟 Tickets sichern
              </button>
            </a>
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
                <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                  Als Erzähler mit einer Stimme, die Spannung lebendig werden lässt.
                </p>
              </div>
            </div>

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
                <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                  Als Pater Brown mit feinem Humor und unerschütterlicher Moral.
                </p>
              </div>
            </div>
          </div>
          
          {/* Bekannt aus */}
          <div className="text-center mt-24">
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">Bekannt aus</p>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-heading tracking-[0.2em] text-foreground uppercase">
              EIN FALL FÜR ZWEI
            </h3>
          </div>
        </div>
      </section>

      {/* Das Erlebnis - Premium Storytelling */}
      <section className="py-40 px-6 bg-card/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-20">
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">Das Konzept</p>
            <h2 className="text-6xl md:text-8xl font-heading tracking-wider text-foreground uppercase mb-12">
              Das Erlebnis
            </h2>
            <p className="text-xl md:text-2xl text-foreground/90 font-light leading-relaxed max-w-3xl mx-auto">
              Ein Abend voller Spannung, Humor und Gänsehaut.
            </p>
            <p className="text-lg md:text-xl text-gold/80 font-light leading-relaxed max-w-3xl mx-auto mt-4">
              Live-Performance mit zwei Schauspielern – und jede Stimme ein Verdächtiger ist.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 mb-20">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-heading uppercase tracking-wide text-gold">Theater</h3>
              <p className="text-muted-foreground leading-relaxed">
                Live-Performance mit talentierten Sprechern
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-heading uppercase tracking-wide text-gold">Klang & Beat</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sounddesign und Beatbox schaffen Atmosphäre
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-heading uppercase tracking-wide text-gold">Crime-Event</h3>
              <p className="text-muted-foreground leading-relaxed">
                Spannung und Mystik verschmelzen
              </p>
            </div>
          </div>

          <div className="premium-card p-12 text-center space-y-8">
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Mit Wanja Mues und Antoine Monot erleben Sie eine einzigartige Verschmelzung von Theater, 
              Klang und Spannung. Beatboxer Marvelin liefert den rhythmischen Heartbeat dieser Crime-Show.
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
            <h2 className="text-6xl md:text-8xl font-heading tracking-wider text-foreground uppercase mb-8">
              Termine
            </h2>
            <p className="text-xl md:text-2xl text-foreground/80 font-light leading-relaxed max-w-2xl mx-auto mt-6">
              Erlebe Pater Brown live in deiner Stadt – sichere jetzt deine Tickets:
            </p>
          </div>
          
          <div className="space-y-2 max-w-4xl mx-auto">
            {[
              { 
                date: "12.11.2025", 
                day: "Mi. 20:00",
                city: "Augsburg", 
                venue: "Spectrum Club", 
                note: "Preview",
                link: "https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-spectrum-club-20806635/?affiliate=KZB"
              },
              { 
                date: "08.01.2026", 
                day: "Do. 20:00",
                city: "Hamburg", 
                venue: "Friedrich-Ebert-Halle", 
                note: "Premiere",
                link: "https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-friedrich-ebert-halle-20783148/?affiliate=KZB"
              },
              { 
                date: "09.01.2026", 
                day: "Fr. 20:00",
                city: "Bremen", 
                venue: "Die Glocke - Kleiner Saal", 
                note: "",
                link: "https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-die-glocke-20822367/?affiliate=KZB"
              },
              { 
                date: "11.02.2026", 
                day: "Mi. 20:00",
                city: "Neu-Isenburg", 
                venue: "Hugenottenhalle", 
                note: "",
                link: "https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-hugenottenhalle-20792307/?affiliate=KZB"
              },
              { 
                date: "17.02.2026", 
                day: "Di. 20:00",
                city: "München", 
                venue: "Alte Kongresshalle", 
                note: "",
                link: "https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-alte-kongresshalle-muenchen-20792306/?affiliate=KZB"
              },
              { 
                date: "18.02.2026", 
                day: "Mi. 20:00",
                city: "Zürich", 
                venue: "Volkshaus - Weisser Saal", 
                note: "",
                link: "https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-volkshaus-20823961/?affiliate=KZB"
              },
            ].map((show, index) => (
              <div 
                key={index}
                className="tour-date-premium flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 group"
              >
                <div className="flex flex-col md:flex-row gap-6 md:gap-12 flex-1">
                  <div className="flex flex-col min-w-[160px]">
                    <span className="text-3xl md:text-4xl font-heading text-gold group-hover:scale-105 transition-transform">
                      {show.date}
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">
                      {show.day}
                    </span>
                  </div>
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
                <a 
                  href={show.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-gold transition-all duration-300 font-medium uppercase tracking-[0.15em] text-base border-b-2 border-transparent hover:border-gold pb-1"
                >
                  Tickets →
                </a>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-20">
            <a 
              href="https://www.eventim.de/noapp/artist/antoine-monot/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="btn-premium">
                Alle Termine ansehen
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Footer - Elegant */}
      <footer className="py-20 px-6 border-t border-gold/10 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left mb-16">
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
                Social
              </h3>
              <div className="flex gap-6 justify-center md:justify-start">
                <a 
                  href="https://www.instagram.com/paterbrown.live" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-gold transition-colors flex items-center gap-2"
                >
                  <Instagram className="w-5 h-5" />
                  <span className="text-sm">Instagram</span>
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

          <div className="text-center space-y-4">
            <p className="text-foreground/60 text-sm">
              Eine Produktion der Dream & Anchor.
            </p>
            <p className="text-muted-foreground text-xs tracking-wider">
              © 2025 Pater Brown Live-Hörspiel
            </p>
            <div className="mt-6">
              <a 
                href="https://www.eventim.de/noapp/artist/antoine-monot/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold/80 transition-colors text-sm font-medium tracking-wide"
              >
                Noch keine Tickets? Jetzt sichern →
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
