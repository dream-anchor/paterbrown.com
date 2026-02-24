import { useState, useEffect } from "react";
import logoImage from "@/assets/pater-brown-logo.png";
import ticketButton from "@/assets/tickets-sichern-button.png";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const navLinks = [
  { label: "Darsteller", href: "#cast" },
  { label: "Termine", href: "#tour-dates", highlight: true },
  { label: "Trailer", href: "#trailer" },
];

const StickyHeader = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 1);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "hsl(var(--background) / 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid hsl(var(--gold) / 0.15)",
        boxShadow: "0 1px 30px rgba(0, 0, 0, 0.6)",
        paddingTop: "env(safe-area-inset-top)",
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        opacity: isVisible ? 1 : 0,
        transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
        willChange: "transform, opacity",
      }}
    >
      <div className="w-[92%] max-w-[1400px] mx-auto py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-300 shrink-0"
          aria-label="Zurück zur Startseite"
        >
          <img
            src={logoImage}
            alt="Pater Brown Logo"
            className="h-12 md:h-20 lg:h-28 w-auto"
            loading="lazy"
            decoding="async"
          />
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-12" aria-label="Hauptnavigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`relative text-sm uppercase tracking-[0.25em] font-heading transition-colors duration-300 py-2 group ${
                link.highlight
                  ? "neon-gold"
                  : "text-foreground/50 hover:text-foreground/90"
              }`}
            >
              {link.label}
              <span
                className={`absolute bottom-0 left-0 h-[1px] transition-all duration-300 ${
                  link.highlight
                    ? "w-full bg-gold/40"
                    : "w-0 group-hover:w-full bg-foreground/30"
                }`}
              />
            </a>
          ))}
        </nav>

        {/* Ticket Button */}
        <a
          href={EVENTIM_AFFILIATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-105 transition-transform duration-300 shrink-0"
        >
          <img
            src={ticketButton}
            alt="Tickets sichern"
            className="h-[48px] md:h-[96px] lg:h-[140px] w-auto mix-blend-screen"
            loading="lazy"
            decoding="async"
          />
        </a>
      </div>
    </header>
  );
};

export default StickyHeader;
