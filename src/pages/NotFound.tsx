import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/shared/StickyMobileCTA";
import { SEO } from "@/components/SEO";

interface Quote {
  headline: string;
  subline: string;
}

const QUOTES: Quote[] = [
  {
    headline: "Der Fall der verschwundenen Seite",
    subline: "Selbst Pater Brown kann diese Seite nicht finden.",
  },
  {
    headline: "Ein Rätsel ohne Lösung",
    subline: "Diese URL führt ins Nichts – wie eine Sackgasse im Nebel.",
  },
  {
    headline: "Die Spur verliert sich",
    subline: "Was Sie suchen, existiert nicht mehr – oder hat nie existiert.",
  },
  {
    headline: "Kein Verbrechen, nur ein Irrtum",
    subline: "Die angeforderte Seite wurde leider nicht gefunden.",
  },
  {
    headline: "Das Geheimnis der leeren Seite",
    subline: "Manchmal liegt die Wahrheit darin, dass es nichts zu finden gibt.",
  },
  {
    headline: "Verschwunden wie Flambeau",
    subline: "Diese Seite hat sich genauso geschickt davongemacht.",
  },
  {
    headline: "Eine falsche Fährte",
    subline: "Der Link, dem Sie gefolgt sind, führt ins Leere.",
  },
  {
    headline: "Im Nebel verloren",
    subline: "Die Seite, die Sie suchen, liegt im Dunkel verborgen.",
  },
  {
    headline: "Der unsichtbare Beweis",
    subline: "Hier gibt es nichts zu sehen – und genau das ist die Wahrheit.",
  },
  {
    headline: "Die fehlende Seite",
    subline: "Wie ein herausgerissenes Kapitel aus einem Kriminalroman.",
  },
  {
    headline: "Elementar, aber nicht vorhanden",
    subline: "Diese Seite ist dem Ermittler leider nicht bekannt.",
  },
  {
    headline: "Das Ende einer Spur",
    subline: "Jede Ermittlung hat Sackgassen. Dies ist eine davon.",
  },
];

const NotFound = () => {
  const location = useLocation();
  const [quoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const quote = QUOTES[quoteIndex];

  return (
    <div className="min-h-screen flex flex-col bg-background pb-14 md:pb-0">
      <SEO
        title="404 – Seite nicht gefunden | PATER BROWN – Das Live-Hörspiel"
        description="Die angeforderte Seite wurde leider nicht gefunden."
        robots="noindex, follow"
        ogTitle="404 – Seite nicht gefunden | Pater Brown"
        ogDescription="Die angeforderte Seite wurde leider nicht gefunden."
      />
      <Navigation />

      <main className="flex-1 relative">
        {/* Atmospheric Background */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/images/buehne/pater-brown-atmosphaere-silhouette-nebel-af-1200.webp"
            srcSet="/images/buehne/pater-brown-atmosphaere-silhouette-nebel-af-480.webp 480w, /images/buehne/pater-brown-atmosphaere-silhouette-nebel-af-768.webp 768w, /images/buehne/pater-brown-atmosphaere-silhouette-nebel-af-1200.webp 1200w"
            sizes="100vw"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{
              objectPosition: "50% 30%",
              filter: "contrast(1.1) brightness(0.6) saturate(0.7)",
            }}
            loading="eager"
            decoding="async"
          />
          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.85) 30%, hsl(var(--background) / 0.5) 60%, hsl(var(--background) / 0.3) 100%)",
            }}
          />
        </div>

        {/* Content */}
        <section className="relative z-10 flex items-center justify-center min-h-[80vh] pt-32 pb-16 px-6">
          <div className="text-center max-w-3xl mx-auto">
            {/* 404 Number */}
            <p
              className="text-[8rem] sm:text-[10rem] md:text-[14rem] font-heading leading-none text-foreground/10 select-none"
              aria-hidden="true"
            >
              404
            </p>

            {/* Random Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground leading-tight -mt-8 sm:-mt-12 md:-mt-16 mb-4">
              {quote.headline}
            </h1>

            {/* Subline */}
            <p className="text-lg md:text-xl text-foreground/60 font-light italic max-w-xl mx-auto">
              {quote.subline}
            </p>

            {/* Divider */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent w-32 mx-auto my-10" aria-hidden="true" />

            {/* Fehlerpfad (dezent) */}
            <p className="text-xs text-foreground/30 font-mono mb-10 break-all">
              {location.pathname}
            </p>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/"
                className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-gold/40 hover:border-gold/70 text-gold hover:text-gold/90 bg-gold/5 hover:bg-gold/10 backdrop-blur-sm transition-all duration-300 inline-block"
              >
                Zur Startseite
              </Link>
              <Link
                to="/termine"
                className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/20 hover:border-foreground/40 text-foreground/70 hover:text-foreground/90 bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block"
              >
                Aktuelle Termine
              </Link>
              <Link
                to="/live-hoerspiel"
                className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/20 hover:border-foreground/40 text-foreground/70 hover:text-foreground/90 bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block"
              >
                Die Show
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default NotFound;
