import { useState, useEffect, useRef } from "react";
import logoImage from "@/assets/pater-brown-logo.png";

interface NeonLogoProps {
  className?: string;
  alt?: string;
}

const NeonLogo = ({ className = "", alt = "Pater Brown - Das Live-Hörspiel" }: NeonLogoProps) => {
  const segmentsRef = useRef<HTMLImageElement[]>([]);
  const [flickeringSegments, setFlickeringSegments] = useState<Set<number>>(new Set());

  useEffect(() => {
    const scheduleNextFlicker = () => {
      const wait = Math.floor(Math.random() * (2800 - 800 + 1)) + 800;
      
      setTimeout(() => {
        const howMany = Math.random() < 0.25 ? 2 : 1;
        const segments = [...Array(6).keys()]; // 6 segments
        
        // Shuffle segments
        for (let i = segments.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [segments[i], segments[j]] = [segments[j], segments[i]];
        }
        
        // Trigger flicker on selected segments
        const newFlickering = new Set<number>();
        for (let i = 0; i < howMany; i++) {
          newFlickering.add(segments[i]);
        }
        setFlickeringSegments(newFlickering);
        
        // Remove flicker class after animation
        const maxDuration = Math.floor(Math.random() * (220 - 120 + 1)) + 120;
        setTimeout(() => {
          setFlickeringSegments(new Set());
        }, maxDuration + 50);
        
        scheduleNextFlicker();
      }, wait);
    };

    scheduleNextFlicker();
  }, []);

  const segments = [
    { name: 'seg-pater-p', clipPath: 'polygon(10% 35%, 27% 35%, 27% 92%, 12% 92%)' },
    { name: 'seg-ate', clipPath: 'polygon(22% 45%, 47% 45%, 47% 88%, 22% 88%)' },
    { name: 'seg-rb', clipPath: 'polygon(45% 45%, 61% 45%, 61% 90%, 45% 90%)' },
    { name: 'seg-blue-o', clipPath: 'polygon(66% 47%, 74% 47%, 74% 72%, 66% 72%)' },
    { name: 'seg-rown', clipPath: 'polygon(73% 45%, 95% 45%, 95% 92%, 73% 92%)' },
    { name: 'seg-hat', clipPath: 'polygon(4% 13%, 33% 13%, 33% 40%, 4% 40%)' }
  ];

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: '1488 / 768' }}>
      {/* Base layer with subtle glow */}
      <img 
        src={logoImage} 
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain neon-logo-base"
        loading="eager"
        decoding="async"
      />
      
      {/* Flickering segment layers */}
      {segments.map((segment, index) => (
        <img
          key={segment.name}
          ref={el => {
            if (el) segmentsRef.current[index] = el;
          }}
          src={logoImage}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-contain neon-logo-layer ${
            flickeringSegments.has(index) ? 'neon-flicker' : ''
          }`}
          style={{ clipPath: segment.clipPath }}
        />
      ))}
    </div>
  );
};

export default NeonLogo;
