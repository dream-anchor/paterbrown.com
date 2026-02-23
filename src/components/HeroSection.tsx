import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logoImage from "@/assets/pater-brown-logo.png";
import heroBackground from "@/assets/hero-background-modern.jpg";
import StickyHeader from "@/components/StickyHeader";
import { EVENTIM_AFFILIATE_URL, SCROLL_THRESHOLD_STICKY_HEADER } from "@/lib/constants";
import { throttle } from "@/lib/scroll-utils";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";
import { BlackWeekBanner } from "@/components/BlackWeekBanner";
import { getTourYear } from "@/lib/dateUtils";
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
      {/* Modern cinematic background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: `url(${heroBackground})` }} 
        role="img" 
        aria-label="Atmosphärische Bühnenbeleuchtung für Pater Brown Live-Hörspiel" 
      />
      {/* Subtle dark overlay – no gold radial, just clean vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
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
            className="h-16 md:h-20 w-auto" 
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
          className="text-foreground/80 hover:text-foreground transition-colors text-xs uppercase tracking-[0.25em] font-medium border border-foreground/20 hover:border-foreground/40 px-5 py-2.5"
        >
          Tickets
        </a>
      </div>

      {/* Main hero content – Mousetrap-style: huge centered typography */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        
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
              <p className="text-gold/60 text-xs md:text-sm uppercase tracking-[0.4em] mb-6 cinematic-enter" style={{ animationDelay: '0.1s' }}>
                Das Live-Hörspiel
              </p>
              <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[11rem] font-heading text-foreground leading-[0.85] tracking-tight uppercase cinematic-enter" style={{ animationDelay: '0.2s' }}>
                Pater<br />Brown
              </h1>
              <p className="text-lg md:text-xl text-foreground/50 font-light mt-8 tracking-wide cinematic-enter" style={{ animationDelay: '0.4s' }}>
                Mit <span className="text-foreground/80">Antoine Monot</span> & <span className="text-foreground/80">Wanja Mues</span>
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
      <div className="relative z-10 pb-12 px-6">
        <HeroTourInfo previewEvents={previewEvents} tour2026Events={tour2026Events} />
      </div>
    </section>
  </>;
};

export default HeroSection;
