import { useState, useEffect } from "react";
import logoImage from "@/assets/pater-brown-logo.png";
import ticketButton from "@/assets/tickets-sichern-button.png";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const StickyHeader = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show header after scrolling down 200px
      setIsVisible(window.scrollY > 200);
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
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a 
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="Zurück zur Startseite"
        >
          <img 
            src={logoImage} 
            alt="Pater Brown Logo" 
            className="h-[84px] w-auto"
            loading="lazy"
            decoding="async"
          />
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Hauptnavigation">
          <a 
            href="#tour-dates"
            className="text-gold/80 hover:text-gold transition-colors text-sm uppercase tracking-[0.2em] font-medium"
          >
            Termine ansehen
          </a>
        </nav>

        {/* Ticket Button */}
        <a 
          href={EVENTIM_AFFILIATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-105 transition-transform"
        >
          <img 
            src={ticketButton} 
            alt="Tickets sichern" 
            className="h-[70px] md:h-[84px] w-auto mix-blend-screen"
            loading="lazy"
            decoding="async"
          />
        </a>
      </div>
    </header>
  );
};

export default StickyHeader;
