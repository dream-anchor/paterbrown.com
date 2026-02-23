import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import Section from "@/components/ui/Section";
import GhostButton from "@/components/ui/GhostButton";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="404 \u2013 Seite nicht gefunden"
        description="Die angeforderte Seite wurde leider nicht gefunden."
        robots="noindex, nofollow"
        ogTitle="404 \u2013 Seite nicht gefunden | Pater Brown"
        ogDescription="Die angeforderte Seite wurde leider nicht gefunden."
      />
      <Navigation />

      <main className="flex-1 pt-32 pb-16">
        <Section container="narrow">
          <div className="text-center">
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
              Fehler
            </p>
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-heading text-foreground mb-4">
              404
            </h1>
            <div className="divider-gold mb-12 max-w-[120px] mx-auto" aria-hidden="true" />

            <p className="text-xl font-serif text-foreground/70 leading-relaxed max-w-2xl mx-auto mb-12">
              Diese Seite existiert leider nicht. Vielleicht finden Sie auf unserer
              Startseite oder bei den aktuellen Terminen, was Sie suchen.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GhostButton to="/">
                Zur Startseite
              </GhostButton>
              <GhostButton to="/termine">
                Aktuelle Termine
              </GhostButton>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
