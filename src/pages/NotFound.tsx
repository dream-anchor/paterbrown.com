import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="404 – Seite nicht gefunden"
        description="Die angeforderte Seite wurde leider nicht gefunden."
        robots="noindex, nofollow"
        ogTitle="404 – Seite nicht gefunden | Pater Brown"
        ogDescription="Die angeforderte Seite wurde leider nicht gefunden."
      />
      <Navigation />

      <main className="flex-1 pt-32 pb-16">
        <section className="py-28 md:py-36 px-6">
          <div className="container mx-auto max-w-3xl text-center">
            <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">
              Fehler
            </p>
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-heading text-foreground mb-8">
              404
            </h1>
            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mx-auto mb-12" aria-hidden="true" />

            <p className="text-xl text-foreground/70 leading-relaxed max-w-2xl mx-auto mb-12 font-light">
              Diese Seite existiert leider nicht. Vielleicht finden Sie auf unserer
              Startseite oder bei den aktuellen Terminen, was Sie suchen.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/" className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block">
                Zur Startseite
              </Link>
              <Link to="/termine" className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block">
                Aktuelle Termine
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
