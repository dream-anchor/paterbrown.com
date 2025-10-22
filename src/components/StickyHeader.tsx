import { useState, useEffect } from "react";
import logoImage from "@/assets/pater-brown-logo.png";
import ticketButton from "@/assets/tickets-sichern-button.png";

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
      style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)" }}
    >
      <div className="container mx-auto px-6 py-3 flex items-center justify-end">
        {/* Ticket Button */}
        <a 
          href="https://www.eventim.de/noapp/artist/antoine-monot/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-105 transition-transform"
        >
          <img 
            src={ticketButton} 
            alt="Tickets sichern" 
            className="h-10 md:h-12 w-auto mix-blend-screen"
          />
        </a>
      </div>
    </header>
  );
};

export default StickyHeader;
