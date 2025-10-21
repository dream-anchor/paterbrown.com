import { Button } from "@/components/ui/button";
import logoImage from "@/assets/pater-brown-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen curtain-gradient">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center bg-background/80 backdrop-blur-sm border-b border-border">
        <button className="neon-orange font-heading text-2xl tracking-wider hover:neon-orange-bright transition-all">
          MENÜ
        </button>
        <button className="neon-orange font-heading text-2xl tracking-wider hover:neon-orange-bright transition-all">
          JETZT BUCHEN
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Logo */}
          <div className="flex justify-center mb-12 animate-float">
            <img 
              src={logoImage} 
              alt="Pater Brown - Das Live-Hörspiel" 
              className="w-full max-w-2xl h-auto drop-shadow-[0_0_30px_rgba(255,140,0,0.4)]"
            />
          </div>

          {/* Tagline */}
          <div className="text-center mb-12">
            <h2 className="neon-white font-heading text-3xl md:text-4xl tracking-wider mb-4">
              EIN UNVERGESSLICHES
            </h2>
            <h1 className="neon-orange-bright font-heading text-5xl md:text-7xl tracking-wider neon-flicker">
              THEATER-ERLEBNIS
            </h1>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mb-16">
            <Button 
              size="lg"
              className="neon-box bg-card hover:bg-card/80 text-2xl font-heading tracking-wider px-12 py-8 neon-orange transition-all hover:scale-105"
            >
              TICKETS SICHERN
            </Button>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="neon-box bg-card/50 backdrop-blur-sm p-8 rounded-lg text-center hover:scale-105 transition-transform">
              <h3 className="neon-orange font-heading text-3xl mb-4 tracking-wider">
                SPANNEND
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Erleben Sie die fesselnde Geschichte von Pater Brown live und hautnah
              </p>
            </div>

            <div className="neon-box bg-card/50 backdrop-blur-sm p-8 rounded-lg text-center hover:scale-105 transition-transform">
              <h3 className="neon-blue font-heading text-3xl mb-4 tracking-wider">
                MYSTERIÖS
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Tauchen Sie ein in die Welt des brillanten Detektivs und seiner Fälle
              </p>
            </div>

            <div className="neon-box bg-card/50 backdrop-blur-sm p-8 rounded-lg text-center hover:scale-105 transition-transform">
              <h3 className="neon-orange font-heading text-3xl mb-4 tracking-wider">
                EINZIGARTIG
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Ein Live-Hörspiel-Erlebnis, das Sie so noch nie gesehen haben
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="neon-orange-bright font-heading text-4xl md:text-5xl text-center mb-12 tracking-wider">
            ÜBER DIE SHOW
          </h2>
          
          <div className="space-y-6 text-lg leading-relaxed text-center">
            <p className="text-foreground/90">
              Pater Brown, der bescheidene katholische Priester mit dem scharfen Verstand, 
              löst die rätselhaftesten Kriminalfälle mit einer einzigartigen Kombination 
              aus Intuition, Menschenkenntnis und tiefem Verständnis für die menschliche Natur.
            </p>
            
            <p className="text-foreground/90">
              In unserem Live-Hörspiel erwachen diese zeitlosen Geschichten zum Leben. 
              Professionelle Sprecher, atmosphärische Soundeffekte und dramatische Musik 
              schaffen ein immersives Erlebnis, das Sie von der ersten bis zur letzten Minute fesselt.
            </p>

            <p className="neon-orange font-semibold text-xl mt-8">
              Ein Abend voller Spannung, Rätsel und unvergesslicher Momente wartet auf Sie!
            </p>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="neon-blue font-heading text-4xl md:text-5xl text-center mb-16 tracking-wider">
            HIGHLIGHTS
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <div className="neon-orange text-4xl font-heading">01</div>
              <div>
                <h3 className="neon-orange font-heading text-2xl mb-3 tracking-wide">
                  LIVE-PERFORMANCE
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Erleben Sie die Geschichte in Echtzeit mit talentierten Sprechern, 
                  die jeden Charakter zum Leben erwecken.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="neon-orange text-4xl font-heading">02</div>
              <div>
                <h3 className="neon-orange font-heading text-2xl mb-3 tracking-wide">
                  ATMOSPHÄRISCHER SOUND
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Hochwertige Soundeffekte und Musik entführen Sie in die mysteriöse 
                  Welt von Pater Brown.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="neon-blue text-4xl font-heading">03</div>
              <div>
                <h3 className="neon-blue font-heading text-2xl mb-3 tracking-wide">
                  INTERAKTIVES ERLEBNIS
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Werden Sie Teil der Geschichte und erleben Sie Theater auf eine 
                  völlig neue Art.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="neon-orange text-4xl font-heading">04</div>
              <div>
                <h3 className="neon-orange font-heading text-2xl mb-3 tracking-wide">
                  UNVERGESSLICHE ATMOSPHÄRE
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Eine einzigartige Mischung aus Theater, Hörspiel und Live-Performance 
                  schafft ein unvergessliches Erlebnis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="neon-orange-bright font-heading text-5xl md:text-6xl mb-8 tracking-wider neon-flicker">
            SEIEN SIE DABEI!
          </h2>
          <p className="text-xl text-foreground/90 mb-12 leading-relaxed">
            Sichern Sie sich jetzt Ihre Tickets für ein unvergessliches Live-Hörspiel-Erlebnis
          </p>
          <Button 
            size="lg"
            className="neon-box bg-card hover:bg-card/80 text-2xl font-heading tracking-wider px-12 py-8 neon-orange transition-all hover:scale-105"
          >
            TICKETS KAUFEN
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="neon-orange font-heading text-xl mb-4 tracking-wide">
                KONTAKT
              </h3>
              <p className="text-muted-foreground">
                info@paterbrown-live.de<br />
                +49 123 456 789
              </p>
            </div>

            <div>
              <h3 className="neon-orange font-heading text-xl mb-4 tracking-wide">
                SPIELZEITEN
              </h3>
              <p className="text-muted-foreground">
                Fr & Sa: 20:00 Uhr<br />
                So: 18:00 Uhr
              </p>
            </div>

            <div>
              <h3 className="neon-orange font-heading text-xl mb-4 tracking-wide">
                FOLGEN SIE UNS
              </h3>
              <div className="flex gap-4 justify-center md:justify-start">
                <a href="#" className="neon-orange hover:neon-orange-bright transition-all">
                  Facebook
                </a>
                <a href="#" className="neon-orange hover:neon-orange-bright transition-all">
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              © 2025 Pater Brown Live-Hörspiel. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
