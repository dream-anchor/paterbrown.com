import { Button } from "@/components/ui/button";
import logoImage from "@/assets/pater-brown-logo.png";
import heroBackground from "@/assets/hero-background.jpg";
import castAntoine from "@/assets/cast-antoine.jpg";
import castWanja from "@/assets/cast-wanja.jpg";
import { useEffect, useState } from "react";

const Index = () => {
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Emotional Hook */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackground})` }}
        >
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center cinematic-enter">
          <img 
            src={logoImage} 
            alt="Pater Brown Das Live-Hörspiel Logo" 
            className="mx-auto mb-12 max-w-2xl w-full h-auto animate-glow"
          />
          
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-white animate-fade-in leading-tight">
            Wenn Spannung sichtbar wird:<br />Pater Brown LIVE
          </h1>
          
          <p className="text-2xl md:text-3xl mb-4 text-gold font-light tracking-wide cinematic-enter">
            Krimi, Klang & Gänsehaut auf der Bühne
          </p>

          <p className="text-lg md:text-xl mb-12 text-white/80 max-w-3xl mx-auto animate-fade-in">
            Ein Live-Hörspiel mit <span className="text-gold font-semibold">Antoine Monot</span> & <span className="text-gold font-semibold">Wanja Mues</span> – wo Stimme, Klang und Beat zum Krimi werden.
          </p>

          <Button 
            onClick={() => window.open('https://www.eventim.de/noapp/artist/antoine-monot/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp', '_blank')}
            variant="neon"
            size="lg"
            className="btn-premium text-lg px-12 py-6 animate-slide-up"
          >
            🎟 Tickets sichern
          </Button>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 spotlight-effect">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-white/50 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Cast Section - Storytelling */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-center mb-16 text-gold">
            Die Stimmen
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="cast-spotlight group">
              <div className="cast-image relative overflow-hidden rounded-lg mb-6">
                <img 
                  src={castAntoine} 
                  alt="Antoine Monot als Pater Brown" 
                  className="w-full h-auto transform transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-display font-bold mb-2 text-white">
                  Antoine Monot
                </h3>
                <p className="text-gold text-lg mb-4 tracking-wider">
                  PATER BROWN
                </p>
                <p className="text-white/90 text-lg leading-relaxed mb-3">
                  Als Pater Brown mit feinem Humor und unerschütterlicher Moral – eine Stimme, die Vertrauen schafft.
                </p>
                <p className="text-white/60 text-sm italic">
                  Der Ermittler mit dem Gespür für Menschen und Verbrechen
                </p>
              </div>
            </div>

            <div className="cast-spotlight group">
              <div className="cast-image relative overflow-hidden rounded-lg mb-6">
                <img 
                  src={castWanja} 
                  alt="Wanja Mues als Erzähler" 
                  className="w-full h-auto transform transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-display font-bold mb-2 text-white">
                  Wanja Mues
                </h3>
                <p className="text-gold text-lg mb-4 tracking-wider">
                  ERZÄHLER
                </p>
                <p className="text-white/90 text-lg leading-relaxed mb-3">
                  Seine Stimme atmet Spannung. Jedes Wort ein Puzzleteil im Kriminalfall.
                </p>
                <p className="text-white/60 text-sm italic">
                  Die Stimme, die die Geschichte zum Leben erweckt
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Das Erlebnis Section - Emotionalisierung */}
      <section className="py-24 bg-gradient-to-b from-background to-black/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-center mb-8 text-gold">
            Das Erlebnis
          </h2>
          
          <p className="text-2xl md:text-3xl text-center mb-4 text-white/90 max-w-3xl mx-auto font-light">
            Ein Abend voller Spannung, Humor und Gänsehaut.
          </p>
          
          <p className="text-xl text-center mb-16 text-gold/80 max-w-2xl mx-auto italic">
            Wenn Klang zum Ermittler wird – und jede Stimme ein Verdächtiger ist.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <div className="premium-card p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-display text-gold mb-4 group-hover:animate-pulse">01</div>
              <h3 className="text-2xl font-display font-bold mb-4 text-white">Theater</h3>
              <p className="text-white/90 text-lg leading-relaxed font-semibold mb-2">
                Live-Performance, die unter die Haut geht
              </p>
              <p className="text-white/60 text-sm">
                Echte Schauspieler. Echte Emotionen. Live auf der Bühne.
              </p>
            </div>

            <div className="premium-card p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-display text-gold mb-4 group-hover:animate-pulse">02</div>
              <h3 className="text-2xl font-display font-bold mb-4 text-white">Klang & Beat</h3>
              <p className="text-white/90 text-lg leading-relaxed font-semibold mb-2">
                Beatboxer Marvelin schafft die Soundkulisse des Verbrechens
              </p>
              <p className="text-white/60 text-sm">
                Jeder Beat, jedes Geräusch – live kreiert, ohne Playback
              </p>
            </div>

            <div className="premium-card p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-display text-gold mb-4 group-hover:animate-pulse">03</div>
              <h3 className="text-2xl font-display font-bold mb-4 text-white">Crime-Event</h3>
              <p className="text-white/90 text-lg leading-relaxed font-semibold mb-2">
                Spannung, die du spüren kannst
              </p>
              <p className="text-white/60 text-sm">
                Ein Kriminalfall zum Mitfiebern, Miträtseln und Miterleben
              </p>
            </div>
          </div>

          <div className="premium-card max-w-4xl mx-auto p-12 text-center">
            <p className="text-2xl md:text-3xl font-light text-white/90 leading-relaxed mb-4">
              Ein Abend, an dem jede Stimme zum Instrument wird und jeder Sound Teil des Verbrechens.
            </p>
            <p className="text-lg text-gold/70 italic">
              Das ist kein gewöhnliches Hörspiel – das ist Live-Theater der neuen Generation.
            </p>
          </div>
        </div>
      </section>

      {/* Tour Dates Section - Urgency & Dringlichkeit */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-center mb-8 text-gold">
            Tour Termine
          </h2>
          
          <p className="text-xl md:text-2xl text-center mb-16 text-white/90 max-w-3xl mx-auto">
            Erlebe Pater Brown live in deiner Stadt – sichere jetzt deine Tickets:
          </p>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            {[
              { 
                date: "12.02.2025", 
                city: "Augsburg", 
                venue: "Spectrum Club",
                link: "https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-spectrum-club-20806635/?affiliate=KZB",
                urgency: "Limitierte Plätze"
              },
              { 
                date: "21.02.2025", 
                city: "Ludwigsburg", 
                venue: "Friedrich-Ebert-Halle",
                link: "https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-friedrich-ebert-halle-20783148/?affiliate=KZB"
              },
              { 
                date: "22.02.2025", 
                city: "Bremen", 
                venue: "Die Glocke",
                link: "https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-die-glocke-20822367/?affiliate=KZB"
              },
              { 
                date: "01.03.2025", 
                city: "Neu-Isenburg", 
                venue: "Hugenottenhalle",
                link: "https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-hugenottenhalle-20792307/?affiliate=KZB"
              },
              { 
                date: "02.03.2025", 
                city: "München", 
                venue: "Alte Kongresshalle",
                link: "https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-alte-kongresshalle-muenchen-20792306/?affiliate=KZB",
                urgency: "Hohe Nachfrage"
              },
              { 
                date: "09.03.2025", 
                city: "Zürich", 
                venue: "Volkshaus",
                link: "https://www.eventim.de/event/pater-brown-das-live-hoerspiel-mit-antoine-monot-wanja-mues-marvelin-volkshaus-20823961/?affiliate=KZB"
              }
            ].map((show, index) => (
              <div 
                key={index}
                className="tour-date-premium group hover:scale-[1.02] transition-all duration-300 relative"
              >
                {show.urgency && (
                  <div className="absolute -top-3 left-6 bg-gold text-black px-4 py-1 rounded-full text-sm font-bold z-10 animate-pulse">
                    {show.urgency}
                  </div>
                )}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-3xl font-display font-bold text-gold">
                        {show.date}
                      </span>
                    </div>
                    <div className="text-xl text-white font-semibold mb-1">
                      {show.city}
                    </div>
                    <div className="text-white/60">
                      {show.venue}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => window.open(show.link, '_blank')}
                    variant="outline"
                    className="border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 group-hover:scale-110"
                  >
                    Tickets →
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => window.open('https://www.eventim.de/noapp/artist/antoine-monot/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp', '_blank')}
              variant="outline"
              size="lg"
              className="border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300"
            >
              Alle Termine ansehen
            </Button>
          </div>
        </div>
      </section>

      {/* Pressestimmen / Social Proof Section */}
      <section className="py-24 bg-gradient-to-b from-black/50 to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-center mb-16 text-gold">
            Das sagen andere
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="premium-card p-8">
              <div className="text-6xl text-gold mb-4">"</div>
              <p className="text-xl text-white/90 mb-6 leading-relaxed">
                Ein akustisches Erlebnis der Extraklasse. Spannung pur von der ersten bis zur letzten Minute.
              </p>
              <p className="text-gold/70 text-sm italic">— Pressestimme (folgt nach Premiere)</p>
            </div>

            <div className="premium-card p-8">
              <div className="text-6xl text-gold mb-4">"</div>
              <p className="text-xl text-white/90 mb-6 leading-relaxed">
                Spannung, die man hören UND sehen kann. Live-Hörspiel auf einem neuen Level.
              </p>
              <p className="text-gold/70 text-sm italic">— Pressestimme (folgt nach Premiere)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="premium-card max-w-3xl mx-auto p-12 text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-gold">
              Verpasse keine neuen Termine
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Trage dich ein und erhalte Updates zu neuen Shows
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Deine E-Mail Adresse"
                className="flex-1 px-6 py-4 rounded-lg bg-black/50 border-2 border-gold/30 text-white placeholder:text-white/40 focus:border-gold focus:outline-none transition-colors"
              />
              <Button
                variant="outline"
                size="lg"
                className="border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 px-8"
              >
                Benachrichtige mich
              </Button>
            </div>
            
            <p className="text-sm text-white/50 mt-6">
              Exklusive Updates · Neue Termine · Behind-the-Scenes
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Marken-Stärkung */}
      <footer className="bg-black/90 border-t border-gold/20 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Footer Content */}
            <div className="grid md:grid-cols-3 gap-12 mb-12">
              {/* Contact */}
              <div>
                <h3 className="text-xl font-display font-bold mb-4 text-gold">Kontakt</h3>
                <div className="space-y-2 text-white/70">
                  <p>Monot Media GmbH</p>
                  <p>Dream & Anchor GmbH</p>
                  <p className="mt-4">
                    <a href="mailto:info@pater-brown-live.de" className="hover:text-gold transition-colors">
                      info@pater-brown-live.de
                    </a>
                  </p>
                </div>
              </div>

              {/* Showtimes */}
              <div>
                <h3 className="text-xl font-display font-bold mb-4 text-gold">Showzeiten</h3>
                <div className="space-y-2 text-white/70">
                  <p>Einlass: 19:00 Uhr</p>
                  <p>Beginn: 20:00 Uhr</p>
                  <p className="mt-4 text-sm">
                    Dauer: ca. 2 Stunden inkl. Pause
                  </p>
                </div>
              </div>

              {/* Social */}
              <div>
                <h3 className="text-xl font-display font-bold mb-4 text-gold">Folge uns</h3>
                <div className="flex gap-4 mb-4">
                  <a 
                    href="https://www.instagram.com/paterbrown.live" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-gold transition-colors text-2xl"
                    aria-label="Instagram"
                  >
                    📸
                  </a>
                  <a 
                    href="https://www.facebook.com/paterbrownlive" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-gold transition-colors text-2xl"
                    aria-label="Facebook"
                  >
                    👤
                  </a>
                </div>
                <p className="text-sm text-white/50 mt-6">
                  Eine Produktion von<br />
                  <span className="text-gold">Monot Media & Dream & Anchor</span>
                </p>
              </div>
            </div>

            <div className="divider-gold mb-8" />

            {/* Legal & Copyright */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-white/50 text-sm">
              <div className="flex gap-6">
                <a href="/impressum" className="hover:text-gold transition-colors">Impressum</a>
                <a href="/datenschutz" className="hover:text-gold transition-colors">Datenschutz</a>
                <a href="/agb" className="hover:text-gold transition-colors">AGB</a>
              </div>
              <p>© 2025 Pater Brown - Das Live-Hörspiel. Alle Rechte vorbehalten.</p>
            </div>

            {/* Footer CTA */}
            <div className="text-center mt-8 pt-8 border-t border-gold/10">
              <a 
                href="https://www.eventim.de/noapp/artist/antoine-monot/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold/80 transition-colors text-lg font-semibold"
              >
                Noch keine Tickets? Jetzt sichern →
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Sticky CTA Button */}
      {showStickyCTA && (
        <Button
          onClick={() => window.open('https://www.eventim.de/noapp/artist/antoine-monot/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp', '_blank')}
          variant="neon"
          size="lg"
          className="fixed bottom-8 right-8 z-50 btn-premium shadow-2xl animate-pulse hover:animate-none hidden md:flex"
        >
          🎟 Tickets sichern
        </Button>
      )}
    </div>
  );
};

export default Index;
