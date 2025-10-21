import { Button } from "@/components/ui/button";
import logoImage from "@/assets/pater-brown-logo.png";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Background */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 hero-overlay" />

        {/* Navigation */}
        <nav className="relative z-10 px-8 py-8 flex justify-between items-center">
          <button className="neon-button font-heading text-2xl tracking-widest hover:scale-110 transition-transform uppercase">
            Menü
          </button>
          <button className="neon-button font-heading text-2xl tracking-widest hover:scale-110 transition-transform uppercase">
            Jetzt Buchen
          </button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-20">
          {/* Logo */}
          <div className="mb-8 max-w-4xl w-full">
            <img 
              src={logoImage} 
              alt="Pater Brown - Das Live-Hörspiel" 
              className="w-full h-auto glow-subtle"
            />
          </div>

          {/* Main Title - Handwritten Neon Style */}
          <h1 className="neon-text text-6xl md:text-8xl lg:text-9xl text-center mb-8 leading-tight">
            Pater Brown
          </h1>

          <p className="text-foreground/90 text-xl md:text-2xl text-center mb-4 font-sans tracking-wide uppercase">
            Das Live-Hörspiel
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-heading tracking-wider mb-8 text-foreground uppercase">
            Über die Show
          </h2>
          
          <div className="space-y-6 text-lg leading-relaxed">
            <p className="text-muted-foreground">
              Pater Brown, der bescheidene katholische Priester mit dem scharfen Verstand, 
              löst die rätselhaftesten Kriminalfälle mit einer einzigartigen Kombination 
              aus Intuition, Menschenkenntnis und tiefem Verständnis für die menschliche Natur.
            </p>
            
            <p className="text-muted-foreground">
              In unserem Live-Hörspiel erwachen diese zeitlosen Geschichten zum Leben. 
              Professionelle Sprecher, atmosphärische Soundeffekte und dramatische Musik 
              schaffen ein immersives Erlebnis, das Sie von der ersten bis zur letzten Minute fesselt.
            </p>

            <Button 
              size="lg"
              className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground text-xl font-heading tracking-wider px-10 py-6 uppercase transition-all hover:scale-105"
            >
              Tickets Sichern
            </Button>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-24 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-heading tracking-wider mb-16 text-center text-foreground uppercase">
            Highlights
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="space-y-3">
              <h3 className="text-2xl font-heading tracking-wide text-foreground uppercase">
                Live-Performance
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Erleben Sie die Geschichte in Echtzeit mit talentierten Sprechern, 
                die jeden Charakter zum Leben erwecken.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-heading tracking-wide text-foreground uppercase">
                Atmosphärischer Sound
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Hochwertige Soundeffekte und Musik entführen Sie in die mysteriöse 
                Welt von Pater Brown.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-heading tracking-wide text-foreground uppercase">
                Interaktives Erlebnis
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Werden Sie Teil der Geschichte und erleben Sie Theater auf eine 
                völlig neue Art.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-heading tracking-wide text-foreground uppercase">
                Unvergessliche Atmosphäre
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Eine einzigartige Mischung aus Theater, Hörspiel und Live-Performance 
                schafft ein unvergessliches Erlebnis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-border/30 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
              <h3 className="font-heading text-lg mb-4 tracking-wide text-foreground uppercase">
                Kontakt
              </h3>
              <p className="text-muted-foreground text-sm">
                info@paterbrown-live.de<br />
                +49 123 456 789
              </p>
            </div>

            <div>
              <h3 className="font-heading text-lg mb-4 tracking-wide text-foreground uppercase">
                Spielzeiten
              </h3>
              <p className="text-muted-foreground text-sm">
                Fr & Sa: 20:00 Uhr<br />
                So: 18:00 Uhr
              </p>
            </div>

            <div>
              <h3 className="font-heading text-lg mb-4 tracking-wide text-foreground uppercase">
                Folgen Sie uns
              </h3>
              <div className="flex gap-6 justify-center md:justify-start text-sm">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Facebook
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/30 text-center">
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
