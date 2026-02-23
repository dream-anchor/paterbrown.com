import { useState, useEffect } from "react";
import logoImage from "@/assets/pater-brown-logo.png";
import ticketButton from "@/assets/tickets-sichern-button.png";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const StickyHeader = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show header after scrolling down 200px
      setIsVisible(window.scrollY > 1);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-gold/20 animate-fade-in"
      style={{ 
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
        WebkitTransform: "translate3d(0,0,0)",
        transform: "translate3d(0,0,0)",
        willChange: "transform",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="w-[92%] max-w-[1400px] mx-auto py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity shrink-0"
          aria-label="Zurück zur Startseite"
        >
          <img
            src={logoImage}
            alt="Pater Brown Logo"
            className="h-12 md:h-16 w-auto"
            loading="lazy"
            decoding="async"
          />
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-10" aria-label="Hauptnavigation">
          <a
            href="#cast"
            className="text-foreground/60 hover:text-foreground transition-colors text-base uppercase tracking-[0.2em] font-heading"
          >
            Darsteller
          </a>
          <a
            href="#tour-dates"
            className="neon-gold text-base uppercase tracking-[0.2em] font-heading"
          >
            Termine
          </a>
          <a
            href="#trailer"
            className="text-foreground/60 hover:text-foreground transition-colors text-base uppercase tracking-[0.2em] font-heading"
          >
            Trailer
          </a>
        </nav>

        {/* Ticket Button */}
        <a
          href={EVENTIM_AFFILIATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-105 transition-transform shrink-0"
        >
          <img
            src={ticketButton}
            alt="Tickets sichern"
            className="h-[48px] md:h-[64px] lg:h-[80px] w-auto mix-blend-screen"
            loading="lazy"
            decoding="async"
          />
        </a>
      </div>
    </header>
  );
};

export default StickyHeader;
