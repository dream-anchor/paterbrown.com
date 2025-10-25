import { useState, useEffect, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ModernImage } from "./ModernImage";
import StickyHeader from "./StickyHeader";
import { throttle } from "@/lib/scroll-utils";
import { usePrefetch } from "@/hooks/usePrefetch";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import paterbrown from "../assets/pater-brown-logo.png";
import marvelinImage from "../assets/marvelin-v3.png";
import stefanieImage from "../assets/stefanie-sick-blazer-rot-v10-2.png";

const HeroSection = () => {
  const [logoAnimating, setLogoAnimating] = useState(true);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(1);
  const [bgBrightness, setBgBrightness] = useState(1);
  
  // Prefetch ticket link on hover for faster conversion
  const prefetchProps = usePrefetch(EVENTIM_AFFILIATE_URL, { trigger: 'hover' });

  const handleScroll = useCallback(throttle(() => {
    const scrollY = window.scrollY;

    // Control sticky header visibility
    if (scrollY > 300 && !showStickyHeader) {
      setShowStickyHeader(true);
    } else if (scrollY <= 300 && showStickyHeader) {
      setShowStickyHeader(false);
    }

    // Background fade effects
    if (scrollY < 500) {
      setBgOpacity(Math.max(0.3, 1 - scrollY / 500));
      setBgBrightness(Math.max(0.3, 1 - scrollY / 800));
    }
  }, 50), [showStickyHeader]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      {showStickyHeader && <StickyHeader />}

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/src/assets/hero-background.jpg)",
            opacity: bgOpacity,
            filter: `brightness(${bgBrightness})`,
          }}
          role="img"
          aria-label="Pater Brown Live-Hörspiel Hintergrund"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div
            className={`mb-12 transition-all duration-700 ${
              logoAnimating ? "animate-fade-in" : ""
            }`}
          >
            <img
              src={paterbrown}
              alt="Pater Brown - Das Live-Hörspiel Logo"
              className="w-full max-w-4xl mx-auto h-auto drop-shadow-[0_0_60px_rgba(245,158,11,0.3)]"
              loading="eager"
              fetchPriority="high"
              width={800}
              height={200}
            />
          </div>

          <ModernImage
            src={marvelinImage}
            alt="Marvelin Artwork"
            width={500}
            height={700}
            className="absolute left-[5%] top-[20%] w-[45%] max-w-[400px] object-contain z-10 animate-fade-in opacity-0"
            loading="eager"
            fetchPriority="high"
            style={{
              animationDelay: "0.3s",
              animationFillMode: "forwards",
            }}
          />
          <ModernImage
            src={stefanieImage}
            alt="Stefanie Sick Artwork"
            width={500}
            height={700}
            className="absolute right-[5%] top-[20%] w-[45%] max-w-[400px] object-contain z-10 animate-fade-in opacity-0"
            loading="eager"
            fetchPriority="high"
            style={{
              animationDelay: "0.6s",
              animationFillMode: "forwards",
            }}
          />

          <div className="space-y-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <p className="text-2xl md:text-4xl lg:text-5xl font-light tracking-[0.1em] text-foreground/95 leading-tight">
              Wenn Spannung sichtbar wird: Pater Brown LIVE – Krimi, Klang & Gänsehaut auf der Bühne.
            </p>

            <div className="divider-gold w-32 mx-auto my-8" aria-hidden="true" />

            <p className="text-lg md:text-xl lg:text-2xl text-gold/90 font-light leading-relaxed">
              Mit Wanja Mues und Antoine Monot, bekannt aus der ZDF-Serie „Ein Fall für Zwei", erleben Sie TV-Stars live auf der Bühne.
            </p>

            <div className="divider-gold w-16 mx-auto my-6 opacity-50" aria-hidden="true" />

            <p className="text-xl md:text-2xl text-muted-foreground font-light">
              Mit Beatboxer Marvelin
            </p>

            <Button 
              size="lg"
              className="btn-premium text-xl px-12 py-8 rounded-none border-2 border-gold bg-gold/10 hover:bg-gold hover:text-background transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:shadow-[0_0_50px_rgba(245,158,11,0.8)]"
              asChild
            >
              <a 
                href={EVENTIM_AFFILIATE_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                {...prefetchProps}
              >
                Tickets sichern
              </a>
            </Button>

            <p className="text-gold/70 text-sm uppercase tracking-[0.25em] mt-8">
              🤫 LIVE 2025 AUGSBURG (PREVIEW)<br />
              <br />
              📍 LIVE 2026 IN HAMBURG • BREMEN • NEU-ISENBURG / FRANKFURT A.M. • MÜNCHEN • ZÜRICH (CH)
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default memo(HeroSection);
