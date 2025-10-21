import { Button } from "@/components/ui/button";
import logoImage from "@/assets/pater-brown-logo.png";
import heroBackground from "@/assets/hero-background.jpg";
import castAntoine from "@/assets/cast-antoine.jpg";
import castWanja from "@/assets/cast-wanja.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 hero-overlay" />

        {/* Minimal Navigation */}
        <nav className="relative z-10 px-8 lg:px-16 py-10 flex justify-between items-center">
          <button className="neon-button font-heading text-xl lg:text-2xl tracking-widest hover:scale-110 transition-transform">
            MENÜ
          </button>
          <button className="neon-button font-heading text-xl lg:text-2xl tracking-widest hover:scale-110 transition-transform">
            JETZT BUCHEN
          </button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-32">
          <div className="max-w-5xl w-full mb-12">
            <img 
              src={logoImage} 
              alt="Pater Brown - Das Live-Hörspiel" 
              className="w-full h-auto glow-strong"
            />
          </div>

          <h1 className="neon-text text-7xl md:text-9xl lg:text-[12rem] text-center mb-12 leading-none">
            Pater Brown
          </h1>

          <p className="text-foreground/90 text-2xl md:text-3xl text-center font-sans tracking-[0.3em] uppercase">
            Das Live-Hörspiel
          </p>
        </div>
      </section>

      {/* Cast Section - Bold & Modern */}
      <section className="py-32 px-6 bg-background">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-heading tracking-wider mb-24 text-center text-foreground uppercase">
            Die Darsteller
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 max-w-5xl mx-auto">
            <div className="group">
              <div className="overflow-hidden mb-6">
                <img 
                  src={castAntoine} 
                  alt="Antoine Monot"
                  className="w-full h-auto cast-image"
                />
              </div>
              <h3 className="text-3xl md:text-4xl font-heading tracking-wide text-foreground mb-2">
                ANTOINE MONOT
              </h3>
              <p className="text-lg text-muted-foreground tracking-wider">
                als Pater Brown
              </p>
            </div>

            <div className="group">
              <div className="overflow-hidden mb-6">
                <img 
                  src={castWanja} 
                  alt="Wanja Mues"
                  className="w-full h-auto cast-image"
                />
              </div>
              <h3 className="text-3xl md:text-4xl font-heading tracking-wide text-foreground mb-2">
                WANJA MUES
              </h3>
              <p className="text-lg text-muted-foreground tracking-wider">
                als Flambeau
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Minimal & Bold */}
      <section className="py-32 px-6 bg-card/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl md:text-7xl font-heading tracking-wider mb-16 text-foreground uppercase">
            Das Erlebnis
          </h2>
          
          <div className="space-y-8 text-xl md:text-2xl leading-relaxed">
            <p className="text-muted-foreground">
              Ein bescheidener katholischer Priester mit einem scharfen Verstand löst die 
              rätselhaftesten Kriminalfälle durch Intuition und tiefes Verständnis der 
              menschlichen Natur.
            </p>
            
            <p className="text-foreground font-medium text-2xl md:text-3xl mt-12">
              Live. Atmosphärisch. Unvergesslich.
            </p>

            <Button 
              size="lg"
              className="mt-16 bg-primary hover:bg-primary/90 text-primary-foreground text-xl md:text-2xl font-heading tracking-[0.2em] px-16 py-8 uppercase transition-all hover:scale-105"
            >
              Tickets Sichern
            </Button>
          </div>
        </div>
      </section>

      {/* Highlights - Grid Layout */}
      <section className="py-32 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-16">
            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-heading tracking-wide text-foreground uppercase">
                Live
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Erleben Sie die Geschichte in Echtzeit mit talentierten Sprechern.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-heading tracking-wide text-foreground uppercase">
                Sound
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hochwertige Soundeffekte und Musik schaffen pure Atmosphäre.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-heading tracking-wide text-foreground uppercase">
                Immersiv
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Theater und Hörspiel verschmelzen zu einem einzigartigen Erlebnis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-20 px-6 border-t border-border/20 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left mb-16">
            <div>
              <h3 className="font-heading text-sm mb-4 tracking-[0.3em] text-muted-foreground uppercase">
                Kontakt
              </h3>
              <p className="text-foreground">
                info@paterbrown-live.de<br />
                +49 123 456 789
              </p>
            </div>

            <div>
              <h3 className="font-heading text-sm mb-4 tracking-[0.3em] text-muted-foreground uppercase">
                Spielzeiten
              </h3>
              <p className="text-foreground">
                Fr & Sa: 20:00 Uhr<br />
                So: 18:00 Uhr
              </p>
            </div>

            <div>
              <h3 className="font-heading text-sm mb-4 tracking-[0.3em] text-muted-foreground uppercase">
                Social
              </h3>
              <div className="flex gap-8 justify-center md:justify-start">
                <a href="#" className="text-foreground hover:text-primary transition-colors">
                  Facebook
                </a>
                <a href="#" className="text-foreground hover:text-primary transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="text-center pt-12 border-t border-border/20">
            <p className="text-muted-foreground text-sm tracking-wider">
              © 2025 Pater Brown Live-Hörspiel
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
