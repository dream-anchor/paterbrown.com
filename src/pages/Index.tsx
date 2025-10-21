import { Button } from "@/components/ui/button";
import logoImage from "@/assets/pater-brown-logo.png";
import heroBackground from "@/assets/hero-background.jpg";
import castAntoine from "@/assets/cast-antoine.jpg";
import castWanja from "@/assets/cast-wanja.jpg";
import jetztBuchenNeon from "@/assets/jetzt-buchen-neon.png";
import menuNeon from "@/assets/menu-neon.png";
import ticketsSichernNeon from "@/assets/tickets-sichern-neon.png";

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
          <button className="hover:scale-110 transition-transform">
            <img 
              src={menuNeon} 
              alt="Menü" 
              className="h-24 lg:h-32 w-auto mix-blend-screen"
            />
          </button>
          <button className="hover:scale-110 transition-transform">
            <img 
              src={jetztBuchenNeon} 
              alt="Jetzt Buchen" 
              className="h-24 lg:h-32 w-auto mix-blend-screen"
            />
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

          <p className="text-foreground/90 text-2xl md:text-3xl lg:text-4xl text-center font-sans tracking-[0.2em] uppercase mt-8 mb-4">
            Erlebe den Krimi-Sound live: Pater Brown live in Augsburg
          </p>
          
          <p className="text-primary text-xl md:text-2xl text-center font-medium mt-6">
            Mit Antoine Monot & Wanja Mues + Beatboxer Marvelin – jetzt Tickets sichern!
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

      {/* About Section - CTA */}
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
              Wenn Stimme, Klang und Beat auf Spannung treffen – erlebst du Pater Brown live.
            </p>

            <div className="mt-16">
              <button className="hover:scale-110 transition-transform">
                <img 
                  src={ticketsSichernNeon} 
                  alt="Tickets Sichern" 
                  className="h-60 lg:h-72 w-auto mix-blend-screen mx-auto"
                />
              </button>
              <p className="text-primary text-lg mt-8 font-medium">
                Tickets sind limitiert – sichere Dir Deinen Platz jetzt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-heading tracking-wider mb-16 text-center text-foreground uppercase">
            Häufige Fragen
          </h2>
          
          <div className="space-y-8">
            <div className="border-b border-border/20 pb-6">
              <h3 className="text-2xl font-heading text-foreground mb-3">
                Dauer der Show?
              </h3>
              <p className="text-lg text-muted-foreground">
                Die Show dauert ca. 90-120 Minuten inklusive Pause.
              </p>
            </div>

            <div className="border-b border-border/20 pb-6">
              <h3 className="text-2xl font-heading text-foreground mb-3">
                Einlass?
              </h3>
              <p className="text-lg text-muted-foreground">
                Der Einlass beginnt 30 Minuten vor Vorstellungsbeginn.
              </p>
            </div>

            <div className="border-b border-border/20 pb-6">
              <h3 className="text-2xl font-heading text-foreground mb-3">
                Gibt es Pausen?
              </h3>
              <p className="text-lg text-muted-foreground">
                Ja, es gibt eine Pause von ca. 15-20 Minuten.
              </p>
            </div>

            <div className="border-b border-border/20 pb-6">
              <h3 className="text-2xl font-heading text-foreground mb-3">
                Gilt das Ticket für alle Termine oder nur für eine Stadt?
              </h3>
              <p className="text-lg text-muted-foreground">
                Das Ticket gilt nur für den ausgewählten Termin und Ort.
              </p>
            </div>

            <div className="border-b border-border/20 pb-6">
              <h3 className="text-2xl font-heading text-foreground mb-3">
                Gibt es Ermäßigungen?
              </h3>
              <p className="text-lg text-muted-foreground">
                Ermäßigungen für Schüler, Studenten und Senioren sind an der Abendkasse erhältlich.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Was dich erwartet - Vorteile */}
      <section className="py-32 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-5xl md:text-7xl font-heading tracking-wider mb-24 text-center text-foreground uppercase">
            Was dich erwartet
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-heading tracking-wide text-foreground uppercase">
                Ein neues Hörspielerlebnis
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Kein Podcast, kein klassisches Theater – Du hörst, siehst und spürst die Ermittlungen aus nächster Nähe.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-heading tracking-wide text-foreground uppercase">
                Live-Performance mit Stars
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Bekannt aus Ein Fall für zwei: Antoine Monot und Wanja Mues treten live auf der Bühne auf.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-heading tracking-wide text-foreground uppercase">
                Soundshow + Bühneninszenierung
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Beatboxer Marvelin liefert den Rhythmus, die Stimmen liefern die Spannung.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-heading tracking-wide text-foreground uppercase">
                Exklusiv in deiner Stadt
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Termine in Augsburg, Hamburg, Bremen, Neu-Isenburg, München und Zürich.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tourdaten */}
      <section className="py-32 px-6 bg-card/20">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-5xl md:text-7xl font-heading tracking-wider mb-24 text-center text-foreground uppercase">
            Tourdaten
          </h2>
          
          <div className="space-y-6">
            {[
              { date: "12.11.2025", city: "Augsburg", note: "Premiere" },
              { date: "08.01.2026", city: "Hamburg", note: "" },
              { date: "09.01.2026", city: "Bremen", note: "" },
              { date: "11.02.2026", city: "Neu-Isenburg", note: "" },
              { date: "17.02.2026", city: "München", note: "" },
              { date: "18.02.2026", city: "Zürich", note: "" },
            ].map((show, index) => (
              <div 
                key={index}
                className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 border border-border/20 hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
                  <span className="text-2xl md:text-3xl font-heading text-foreground min-w-[140px]">
                    {show.date}
                  </span>
                  <span className="text-xl md:text-2xl text-muted-foreground">
                    {show.city}
                  </span>
                  {show.note && (
                    <span className="text-primary text-sm uppercase tracking-wider font-medium">
                      {show.note}
                    </span>
                  )}
                </div>
                <button className="px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-background transition-colors font-medium">
                  TICKETS
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warum hingehen */}
      <section className="py-32 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl md:text-7xl font-heading tracking-wider mb-16 text-foreground uppercase">
            Warum hingehen?
          </h2>
          
          <div className="space-y-8 text-xl md:text-2xl leading-relaxed">
            <p className="text-muted-foreground">
              Spüre die Spannung, wenn Pater Brown den Fall löst. Lausche der Stimme von Antoine Monot. 
              Erlebe die dramaturgische Kraft einer Sound-Bühne. Ein Abend, der bleibt.
            </p>
            
            <p className="text-foreground font-medium text-2xl md:text-3xl mt-12">
              Für Krimifans, Hörspiel-Liebhaber, Theaterfreunde – ein Erlebnis der Sonderklasse.
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-20 px-6 border-t border-border/20 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 text-center md:text-left mb-16">
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

            <div>
              <h3 className="font-heading text-sm mb-4 tracking-[0.3em] text-muted-foreground uppercase">
                Rechtliches
              </h3>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-foreground hover:text-primary transition-colors">
                  Impressum
                </a>
                <a href="#" className="text-foreground hover:text-primary transition-colors">
                  Datenschutz
                </a>
                <a href="#" className="text-foreground hover:text-primary transition-colors">
                  AGB
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
