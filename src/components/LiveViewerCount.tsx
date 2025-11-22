import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

const cities = [
  "Hamburg", "München", "Berlin", "Köln", "Frankfurt", 
  "Stuttgart", "Düsseldorf", "Leipzig", "Dresden", "Hannover"
];

export const LiveViewerCount = () => {
  const [viewerCount, setViewerCount] = useState(187);
  const [currentCity, setCurrentCity] = useState(cities[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Random viewer count between 150-250
      const newCount = Math.floor(Math.random() * (250 - 150 + 1)) + 150;
      setViewerCount(newCount);
      
      // Random city
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      setCurrentCity(randomCity);
    }, 30000); // Change every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gold/10 border border-gold/30 rounded-lg px-4 md:px-6 py-3 mb-8 text-center animate-fade-in">
      <p className="text-gold text-sm md:text-base flex items-center justify-center gap-2 flex-wrap">
        <Eye className="w-4 h-4 animate-pulse" aria-hidden="true" />
        <span className="font-bold">{viewerCount} Personen</span>
        <span className="text-gold/80">betrachten gerade Tickets für</span>
        <span className="font-bold">{currentCity}</span>
      </p>
    </div>
  );
};
