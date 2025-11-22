import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logoImage from "@/assets/pater-brown-logo.png";
import heroBackground from "@/assets/hero-background.jpg";
import antoineHeaderBg from "@/assets/antoine-header-bg.png";
import wanjaHeaderBg from "@/assets/wanja-header-bg.png";
import StickyHeader from "@/components/StickyHeader";
import { EVENTIM_AFFILIATE_URL, SCROLL_THRESHOLD_STICKY_HEADER } from "@/lib/constants";
import { throttle } from "@/lib/scroll-utils";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";
import { BlackWeekBanner } from "@/components/BlackWeekBanner";

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
    const throttledScroll = throttle(handleScroll, 16); // ~60fps
    window.addEventListener("scroll", throttledScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  }, [handleScroll]);
  return <>
      {showStickyHeader && <StickyHeader />}
      {isBlackWeek && <BlackWeekBanner />}
      
      <section className="relative min-h-screen flex flex-col overflow-hidden max-w-full">
        <div 
          className="absolute inset-0 bg-cover bg-top bg-no-repeat" 
          style={{
            backgroundImage: `url(${heroBackground})`,
            backgroundPositionY: '-200px'
          }} 
          role="img" 
          aria-label="Atmosphärischer Hintergrund für Pater Brown Live-Hörspiel" 
        />
        <div className="absolute inset-0 hero-overlay" />
        

        <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-6 pb-20 pt-8">
          <div className="w-full max-w-4xl mb-12 cinematic-enter relative h-[180px]">
            <div 
              className={`absolute w-full ${logoAnimating ? 'fixed top-3 left-6 max-w-[210px] z-[200]' : 'relative'} ${showStickyHeader ? 'opacity-0' : 'opacity-100'}`} 
              style={{
                transition: 'opacity 0.7s ease-in-out'
              }}
              data-testid="hero-logo"
            >
              <img 
                src={logoImage} 
                alt="Pater Brown - Das Live-Hörspiel" 
                className="w-full h-auto drop-shadow-[0_0_60px_rgba(234,179,8,0.3)]" 
                loading="eager" 
                decoding="async" 
                fetchPriority="high"
                width={800}
                height={200}
              />
            </div>
          </div>

          <div 
            className="flex justify-center gap-8 mb-8 mt-16 md:mt-64 cinematic-enter" 
            style={{
              animationDelay: "0.2s",
              opacity: 0.3
            }}
          >
            <div className="w-[200px] md:w-[280px] h-auto relative group">
              <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/60 pointer-events-none rounded-lg" />
              <img 
                src={antoineHeaderBg} 
                alt="Antoine Monot als Pater Brown" 
                className="w-full h-auto object-contain transition-all duration-500" 
                style={{
                  filter: 'drop-shadow(0 0 40px rgba(234, 179, 8, 0.2))',
                  mixBlendMode: 'lighten'
                }} 
                loading="eager" 
                decoding="async" 
                fetchPriority="high"
                width={280}
                height={400}
              />
            </div>
            <div className="w-[200px] md:w-[280px] h-auto relative group">
              <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/60 pointer-events-none rounded-lg" />
              <img 
                src={wanjaHeaderBg} 
                alt="Wanja Mues als Flambeau" 
                className="w-full h-auto object-contain transition-all duration-500" 
                style={{
                  filter: 'drop-shadow(0 0 40px rgba(234, 179, 8, 0.2))',
                  mixBlendMode: 'lighten'
                }} 
                loading="eager" 
                decoding="async" 
                fetchPriority="high"
                width={280}
                height={400}
              />
            </div>
          </div>

          <div className="max-w-4xl text-center space-y-6 cinematic-enter" style={{
          animationDelay: "0.3s"
        }}>
            {isBlackWeek ? (
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-wider text-foreground/95 leading-tight mt-16">
                Nur diese Woche: Das Live-Hörspiel,<br />
                das Deutschland begeistert – jetzt 30% günstiger
              </h1>
            ) : (
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-wider text-foreground/95 leading-tight mt-16">
                Pater Brown LIVE –<br />Krimi, Klang & Gänsehaut
              </h1>
            )}
            
            <div className="divider-gold w-32 mx-auto my-8" aria-hidden="true" />
            
            <div className="space-y-4">
              <p className="text-xl md:text-2xl text-gold/90 font-light leading-relaxed">
                Mit <span className="font-medium">Antoine Monot</span> und <span className="font-medium">Wanja Mues</span>,<br />
                bekannt aus der ZDF-Serie „Ein Fall für Zwei"
              </p>
              <p className="text-lg md:text-xl text-muted-foreground/80 font-light">
                Mit Beatboxer & Loop Artist <span className="font-medium text-gold/80">Marvelin</span>
              </p>
            </div>

            <div className="py-8">
              <div className="relative inline-block">
                <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer" aria-label="Tickets für Pater Brown Live-Hörspiel bei Eventim kaufen">
                  <button 
                    className="btn-premium text-base md:text-xl px-10 md:px-16 py-6 md:py-8 rounded-full shadow-2xl relative overflow-hidden group cinematic-enter focus:outline-none focus:ring-4 focus:ring-neon-gold/50 focus:ring-offset-2 focus:ring-offset-background"
                    style={{
                      animationDelay: "0.6s"
                    }}
                    type="button" 
                    aria-label="Jetzt Tickets bei Eventim sichern"
                  >
                    <span className="relative z-10 flex flex-col items-center gap-1">
                      {isBlackWeek && (
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-black/80">
                          Black Week Deal
                        </span>
                      )}
                      <span className={isBlackWeek ? "text-lg font-black uppercase tracking-[0.15em]" : ""}>
                        {isBlackWeek ? 'JETZT TICKETS SICHERN' : 'Tickets sichern'}
                      </span>
                    </span>
                  </button>
                </a>
              </div>
            </div>

            <div className="divider-gold w-16 mx-auto opacity-40" aria-hidden="true" />

            <div className="flex flex-col gap-6 pt-4 cinematic-enter max-w-2xl mx-auto" style={{
            animationDelay: "0.8s"
          }}>
              {previewEvents.length > 0 && (
                <div className="w-full bg-card/30 backdrop-blur-sm px-6 pt-10 pb-4 rounded-lg text-center">
                  <p className="text-gold/70 text-xs uppercase tracking-widest mb-2">
                    🤫 Preview 2025
                  </p>
                  <div className="text-base text-foreground/90">
                    {previewEvents.map(event => (
                      <a 
                        key={event.id}
                        href={event.ticket_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:text-gold transition-colors"
                        aria-label={`Tickets für ${event.city}`}
                      >
                        {event.city}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {tour2026Events.length > 0 && (
                <div className="w-full bg-card/30 backdrop-blur-sm px-6 py-4 rounded-lg text-center">
                  <p className="text-gold/70 text-xs uppercase tracking-widest mb-3">
                    📍 Erste Tour 2026
                  </p>
                  <div className="text-base text-foreground/90 space-y-1.5">
                    {tour2026Events.map((event, index) => {
                      const isEven = index % 2 === 0;
                      const nextEvent = tour2026Events[index + 1];
                      
                      if (isEven && nextEvent) {
                        return (
                          <p key={event.id}>
                            <a 
                              href={event.ticket_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-gold transition-colors"
                              aria-label={`Tickets für ${event.city}`}
                            >
                              {event.city}
                            </a>
                            {' • '}
                            <a 
                              href={nextEvent.ticket_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-gold transition-colors"
                              aria-label={`Tickets für ${nextEvent.city}`}
                            >
                              {nextEvent.city}
                            </a>
                          </p>
                        );
                      } else if (isEven) {
                        return (
                          <p key={event.id}>
                            <a 
                              href={event.ticket_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-gold transition-colors"
                              aria-label={`Tickets für ${event.city}`}
                            >
                              {event.city}
                            </a>
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>;
};
export default HeroSection;