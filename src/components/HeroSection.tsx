import { useState, useEffect, useRef, useLayoutEffect } from "react";
import logoImage from "@/assets/pater-brown-logo.png";
import heroBackground from "@/assets/hero-background.jpg";
import antoineHeaderBg from "@/assets/antoine-header-bg.png";
import wanjaHeaderBg from "@/assets/wanja-header-bg.png";
import StickyHeader from "@/components/StickyHeader";
import { EVENTIM_AFFILIATE_URL, SCROLL_THRESHOLD_STICKY_HEADER } from "@/lib/constants";

const HeroSection = () => {
  const [logoAnimating, setLogoAnimating] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [imageOpacity, setImageOpacity] = useState(0.3);
  const [imageBrightness, setImageBrightness] = useState(1);
  const logoRef = useRef<HTMLDivElement>(null);
  const [logoHeight, setLogoHeight] = useState(0);

  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        
        const progress = Math.min(scrollY / 200, 1);
        const newOpacity = Math.max(0, 0.3 - (progress * 0.3));
        const newBrightness = Math.max(0, 1 - (progress * 1));
        
        setImageOpacity(newOpacity);
        setImageBrightness(newBrightness);
        
        if (scrollY > SCROLL_THRESHOLD_STICKY_HEADER && !logoAnimating) {
          setLogoAnimating(true);
          setTimeout(() => setShowStickyHeader(true), 600);
        } else if (scrollY <= SCROLL_THRESHOLD_STICKY_HEADER && logoAnimating) {
          setLogoAnimating(false);
          setShowStickyHeader(false);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [logoAnimating]);

  useLayoutEffect(() => {
    if (logoRef.current) {
      setLogoHeight(logoRef.current.offsetHeight);
    }
  }, []);

  return (
    <>
      {showStickyHeader && <StickyHeader />}
      
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-top bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackground})`, backgroundPositionY: '-200px' }}
          role="img"
          aria-label="Atmosphärischer Hintergrund für Pater Brown Live-Hörspiel"
        />
        <div className="absolute inset-0 hero-overlay" />
        
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-0 top-[380px] md:top-[440px] h-[28%] md:h-[32%] w-auto transition-all duration-300" style={{ transform: 'translateX(28%)', opacity: imageOpacity, filter: `brightness(${imageBrightness})` }}>
            <img 
              src={antoineHeaderBg}
              alt=""
              className="h-full w-auto object-contain object-top"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>
          <div className="absolute right-0 top-[400px] md:top-[456px] h-[28%] md:h-[32%] w-auto transition-all duration-300" style={{ transform: 'translateX(-28%)', opacity: imageOpacity, filter: `brightness(${imageBrightness})` }}>
            <img 
              src={wanjaHeaderBg}
              alt=""
              className="h-full w-auto object-contain object-top"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-6 pb-20 pt-8">
          <div 
            className="w-full max-w-6xl mb-8" 
            style={{ 
              height: logoAnimating ? `${logoHeight}px` : '0',
              transition: 'height 0s',
              overflow: 'hidden'
            }} 
          />
          
          <div 
            ref={logoRef}
            className={`w-full mb-8 cinematic-enter ${
            logoAnimating 
              ? 'fixed top-3 left-6 max-w-[210px] z-[200]'
              : 'max-w-6xl relative'
          } ${showStickyHeader ? 'opacity-0' : 'opacity-100'}`}
            style={{ transition: 'opacity 0.7s ease-in-out' }}
          >
            <img 
              src={logoImage} 
              alt="Pater Brown - Das Live-Hörspiel" 
              className="w-full h-auto drop-shadow-[0_0_60px_rgba(234,179,8,0.3)]"
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="max-w-4xl text-center space-y-8 cinematic-enter mt-48" style={{ animationDelay: "0.3s" }}>
            <p className="text-2xl md:text-4xl lg:text-5xl font-light tracking-[0.1em] text-foreground/95 leading-tight mt-16">
              Wenn Spannung sichtbar wird: Pater Brown LIVE – Krimi, Klang & Gänsehaut auf der Bühne.
            </p>
            
            <div className="divider-gold w-32 mx-auto my-8" aria-hidden="true" />
            
            <p className="text-lg md:text-xl lg:text-2xl text-gold/90 font-light leading-relaxed">
              Ein Live-Hörspiel mit Wanja Mues & Antoine Monot – wo Stimme, Klang und Beat zum Krimi werden.
            </p>

            <div className="divider-gold w-16 mx-auto my-6 opacity-50" aria-hidden="true" />

            <p className="text-xl md:text-2xl text-muted-foreground font-light">
              Mit Beatboxer Marvelin
            </p>

            <a 
              href={EVENTIM_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Tickets für Pater Brown Live-Hörspiel bei Eventim kaufen"
            >
              <button className="btn-premium mt-12 cinematic-enter" style={{ animationDelay: "0.6s" }}>
                <span aria-hidden="true">🎟</span> Tickets sichern
              </button>
            </a>
          </div>
        </div>

        <div className="relative z-10 pb-8 flex justify-center" role="presentation">
          <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center" aria-label="Nach unten scrollen">
            <div className="w-1 h-3 bg-gold rounded-full mt-2 spotlight-effect" />
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
