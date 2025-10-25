import { useState, useEffect, useRef } from "react";
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
  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const progress = Math.min(scrollY / 200, 1);
        const newOpacity = Math.max(0, 0.3 - progress * 0.3);
        const newBrightness = Math.max(0, 1 - progress * 1);
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
    window.addEventListener("scroll", handleScroll, {
      passive: true
    });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [logoAnimating]);
  return <>
      {showStickyHeader && <StickyHeader />}
      
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-top bg-no-repeat" style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundPositionY: '-200px'
      }} role="img" aria-label="Atmosphärischer Hintergrund für Pater Brown Live-Hörspiel" />
        <div className="absolute inset-0 hero-overlay" />
        

        <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-6 pb-20 pt-8">
          <div className="w-full max-w-4xl mb-12 cinematic-enter relative h-[180px]">
            <div ref={logoRef} className={`absolute w-full ${logoAnimating ? 'fixed top-3 left-6 max-w-[210px] z-[200]' : 'relative'} ${showStickyHeader ? 'opacity-0' : 'opacity-100'}`} style={{
            transition: 'opacity 0.7s ease-in-out'
          }}>
              <img src={logoImage} alt="Pater Brown - Das Live-Hörspiel" className="w-full h-auto drop-shadow-[0_0_60px_rgba(234,179,8,0.3)]" loading="eager" decoding="async" />
            </div>
          </div>

          <div className="flex justify-center gap-8 mb-8 mt-16 md:mt-64 cinematic-enter" style={{
          animationDelay: "0.2s",
          opacity: imageOpacity,
          filter: `brightness(${imageBrightness})`,
          transition: 'opacity 0.3s, filter 0.3s'
        }}>
            <div className="w-[200px] md:w-[280px] h-auto relative group">
              <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/60 pointer-events-none rounded-lg" />
              <img src={antoineHeaderBg} alt="Antoine Monot" className="w-full h-auto object-contain transition-all duration-500" style={{
              filter: 'drop-shadow(0 0 40px rgba(234, 179, 8, 0.2))',
              mixBlendMode: 'lighten'
            }} loading="eager" decoding="async" />
            </div>
            <div className="w-[200px] md:w-[280px] h-auto relative group">
              <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/60 pointer-events-none rounded-lg" />
              <img src={wanjaHeaderBg} alt="Wanja Mues" className="w-full h-auto object-contain transition-all duration-500" style={{
              filter: 'drop-shadow(0 0 40px rgba(234, 179, 8, 0.2))',
              mixBlendMode: 'lighten'
            }} loading="eager" decoding="async" />
            </div>
          </div>

          <div className="max-w-4xl text-center space-y-8 cinematic-enter" style={{
          animationDelay: "0.3s"
        }}>
            <p className="text-2xl md:text-4xl lg:text-5xl font-light tracking-[0.1em] text-foreground/95 leading-tight mt-16">
              Wenn Spannung sichtbar wird: Pater Brown LIVE – Krimi, Klang & Gänsehaut auf der Bühne.
            </p>
            
            <div className="divider-gold w-32 mx-auto my-8" aria-hidden="true" />
            
            <p className="text-lg md:text-xl lg:text-2xl text-gold/90 font-light leading-relaxed">
              Mit Antoine Monot und Wanja Mues, bekannt aus der ZDF-Serie „Ein Fall für Zwei", erleben Sie TV-Stars live auf der Bühne.
            </p>

            <div className="divider-gold w-16 mx-auto my-6 opacity-50" aria-hidden="true" />

            <p className="text-xl md:text-2xl text-muted-foreground font-light">
              Mit Beatboxer Marvelin
            </p>

            <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer" aria-label="Tickets für Pater Brown Live-Hörspiel bei Eventim kaufen">
              <button className="btn-premium mt-12 cinematic-enter" style={{
              animationDelay: "0.6s"
            }}>
                <span aria-hidden="true">🎟</span> Tickets sichern
              </button>
            </a>

            <p className="text-gold/70 text-sm uppercase tracking-[0.25em] mt-8 cinematic-enter" style={{
            animationDelay: "0.8s"
          }}>
              🤫 LIVE 2025 AUGSBURG (PREVIEW)<br />
              <br />
              📍 LIVE 2026 IN HAMBURG • BREMEN •<br />NEU-ISENBURG / FRANKFURT A.M. • MÜNCHEN • ZÜRICH (CH)
            </p>
          </div>
        </div>
      </section>
    </>;
};
export default HeroSection;