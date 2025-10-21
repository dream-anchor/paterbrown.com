import { useState, useEffect } from "react";
import { Ticket } from "lucide-react";

const StickyTicketButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <a
      href="https://www.eventim.de/noapp/artist/antoine-monot/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-50 animate-fade-in"
    >
      <button className="btn-premium flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform">
        <Ticket className="w-5 h-5" />
        🎟 Tickets sichern
      </button>
    </a>
  );
};

export default StickyTicketButton;
