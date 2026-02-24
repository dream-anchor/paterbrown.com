import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logoImage from "@/assets/pater-brown-logo.webp";
import ticketButton from "@/assets/tickets-sichern-button.webp";
const heroBackground = "/images/buehne/dd-duo-marvelin-tiefblau.webp";
import StickyHeader from "@/components/StickyHeader";
import { EVENTIM_AFFILIATE_URL, SCROLL_THRESHOLD_STICKY_HEADER } from "@/lib/constants";
import { throttle } from "@/lib/scroll-utils";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";
import { BlackWeekBanner } from "@/components/BlackWeekBanner";
import HeroTourInfo from "@/components/HeroTourInfo";

const HeroSection = () => {
  const [logoAnimating, setLogoAnimating] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const isBlackWeek = isBlackWeekActive();

  const { data: tourEvents = [] } = useQuery({
    queryKey: ['hero-tour-events', new Date().toISOString().split('T')[0]],
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tour_events')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      const today = new Date().toISOString().split('T')[0];
      return (data || []).filter(event => event.event_date >= today);
    }
  });

  const previewEvents = tourEvents.filter(e => 
    e.note?.toLowerCase().includes('preview')
  );

  const tour2026Events = tourEvents.filter(e => 
    e.note?.toLowerCase().includes('premiere') || 
    (e.event_date >= '2026-01-01' && !e.note?.toLowerCase().includes('preview'))
  );

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    
    if (scrollY > SCROLL_THRESHOLD_STICKY_HEADER && !logoAnimating) {
      setLogoAnimating(true);
      setTimeout(() => setShowStickyHeader(true), 600);
    } else if (scrollY <= SCROLL_THRESHOLD_STICKY_HEADER && logoAnimating) {
      setLogoAnimating(false);
      setShowStickyHeader(false);
    }
  }, [logoAnimating]);

  useEffect(() => {
    const throttledScroll = throttle(handleScroll, 16);
    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [handleScroll]);

  return <>
    {showStickyHeader && <StickyHeader />}
    {isBlackWeek && <BlackWeekBanner />}
    
    <section className="relative min-h-screen flex flex-col overflow-hidden max-w-full">
      {/* Blurred background layer */}
      <div className="absolute inset-0">
        <img
          src={heroBackground}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{ objectPosition: "50% 15%", filter: "contrast(1.15) brightness(0.9) saturate(0.85) blur(3px)" }}
          loading="eager"
          decoding="async"
        />
      </div>
      {/* Sharp foreground layer with radial mask — fake depth-of-field */}
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 50% 40%, black 30%, transparent 70%)",
          maskImage: "radial-gradient(ellipse 70% 80% at 50% 40%, black 30%, transparent 70%)",
        }}
      >
        <img
          src={heroBackground}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{ objectPosition: "50% 15%", filter: "contrast(1.15) brightness(0.9) saturate(0.85)" }}
          decoding="async"
        />
      </div>
      {/* Soft-glow / Diffusion layer — glättet Hauttöne */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          mixBlendMode: "soft-light",
          opacity: 0.35,
          WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 50% 40%, black 30%, transparent 70%)",
          maskImage: "radial-gradient(ellipse 70% 80% at 50% 40%, black 30%, transparent 70%)",
        }}
      >
        <img
          src={heroBackground}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{ objectPosition: "50% 15%", filter: "blur(4px) brightness(1.1) saturate(0.7)" }}
          decoding="async"
        />
      </div>
      {/* Gradient overlays for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.7) 20%, hsl(var(--background) / 0.15) 45%, transparent 65%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-transparent" />

      {/* Floating minimal nav area */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6 pb-4">
        <div 
          className={`${logoAnimating ? 'fixed z-[200]' : 'relative'} ${showStickyHeader ? 'opacity-0' : 'opacity-100'}`} 
          style={{
            ...(logoAnimating ? {
              top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
              left: 'calc(1.5rem + env(safe-area-inset-left, 0px))',
              maxWidth: '210px',
            } : {}),
            transition: 'opacity 0.7s ease-in-out',
          }}
          data-testid="hero-logo"
        >
          <img 
            src={logoImage} 
            alt="Pater Brown - Das Live-Hörspiel" 
            className="h-14 md:h-20 lg:h-28 w-auto"
            loading="eager" 
            decoding="async" 
            fetchPriority="high"
            width={800}
            height={200}
          />
        </div>
        <a
          href={EVENTIM_AFFILIATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-105 transition-transform"
        >
          <img
            src={ticketButton}
            alt="Tickets sichern"
            className="h-[56px] md:h-[96px] lg:h-[140px] w-auto mix-blend-screen"
            loading="eager"
            decoding="async"
          />
        </a>
      </div>

      {/* Main hero content – Mousetrap-style: huge centered typography */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-end px-6 text-center pb-0">
        
        <div className="cinematic-enter max-w-5xl">
          {isBlackWeek ? (
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[9rem] font-heading text-foreground leading-[0.85] tracking-tight uppercase">
              Black Week
              <span className="block text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.15em] text-foreground/60 mt-4 normal-case">
                30% auf alle Tickets
              </span>
            </h1>
          ) : (
            <>
              <p className="neon-gold-subtle text-xs md:text-sm uppercase tracking-[0.4em] mb-6 cinematic-enter" style={{ animationDelay: '0.1s' }}>
                Das Live-Hörspiel
              </p>
              <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[11rem] font-heading leading-[0.85] tracking-tight uppercase cinematic-enter neon-gold neon-breathe" style={{ animationDelay: '0.2s' }}>
                Pater<br />Brown
              </h1>
              <p className="text-lg md:text-xl text-foreground/50 font-light mt-8 tracking-wide cinematic-enter" style={{ animationDelay: '0.4s' }}>
                Mit <span className="neon-gold-subtle">Antoine Monot</span> & <span className="neon-gold-subtle">Wanja Mues</span>
              </p>
            </>
          )}
        </div>

        {/* CTA Button */}
        <div className="mt-12 cinematic-enter" style={{ animationDelay: '0.6s' }}>
          <a 
            href={EVENTIM_AFFILIATE_URL} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <button 
              className="text-sm md:text-base uppercase tracking-[0.25em] font-semibold px-10 md:px-14 py-4 md:py-5 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300"
              type="button"
            >
              {isBlackWeek ? 'Jetzt Tickets sichern' : 'Tickets sichern'}
            </button>
          </a>
        </div>
      </div>

      {/* Bottom tour info – clean, minimal */}
      <div className="relative z-10 pb-0 px-6 -mb-6">
        <HeroTourInfo previewEvents={previewEvents} tour2026Events={tour2026Events} />
      </div>
    </section>
  </>;
};

export default HeroSection;
