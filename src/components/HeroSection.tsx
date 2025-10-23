import { useState, useEffect } from "react";
import heroBackground from "@/assets/hero-background.jpg";
import logoImage from "@/assets/pater-brown-logo.png";
import ticketsNeon from "@/assets/tickets-sichern-neon.png";
import jetztBuchenNeon from "@/assets/jetzt-buchen-neon.png";
import menuNeon from "@/assets/menu-neon.png";
import { EVENTIM_AFFILIATE_URL, LOGO_SCALE_MIN, LOGO_SCALE_MAX, SCROLL_THRESHOLD_LOGO_FADE_START, SCROLL_THRESHOLD_LOGO_FADE_END, IMAGE_OPACITY_MIN, IMAGE_OPACITY_MAX, SCROLL_THRESHOLD_IMAGE_OPACITY_START, SCROLL_THRESHOLD_IMAGE_OPACITY_END, IMAGE_BRIGHTNESS_MIN, IMAGE_BRIGHTNESS_MAX, SCROLL_THRESHOLD_IMAGE_BRIGHTNESS_END } from "@/lib/constants";

const HeroSection = () => {
  const [logoAnimated, setLogoAnimated] = useState(false);
  const [imageOpacity, setImageOpacity] = useState(IMAGE_OPACITY_MAX);
  const [imageBrightness, setImageBrightness] = useState(IMAGE_BRIGHTNESS_MAX);

  useEffect(() => {
    const timer = setTimeout(() => setLogoAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let rafId: number;
    
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        
        // Image opacity
        const opacity = Math.max(
          IMAGE_OPACITY_MIN,
          IMAGE_OPACITY_MAX - (scrollY - SCROLL_THRESHOLD_IMAGE_OPACITY_START) / 
          (SCROLL_THRESHOLD_IMAGE_OPACITY_END - SCROLL_THRESHOLD_IMAGE_OPACITY_START) * 
          (IMAGE_OPACITY_MAX - IMAGE_OPACITY_MIN)
        );
        setImageOpacity(opacity);

        // Image brightness
        const brightness = Math.max(
          IMAGE_BRIGHTNESS_MIN,
          IMAGE_BRIGHTNESS_MAX - scrollY / SCROLL_THRESHOLD_IMAGE_BRIGHTNESS_END * 
          (IMAGE_BRIGHTNESS_MAX - IMAGE_BRIGHTNESS_MIN)
        );
        setImageBrightness(brightness);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const getLogoStyle = () => {
    const scrollY = window.scrollY;
    
    if (scrollY < SCROLL_THRESHOLD_LOGO_FADE_START) {
      return { opacity: 1, transform: `scale(${LOGO_SCALE_MAX})` };
    }
    
    if (scrollY > SCROLL_THRESHOLD_LOGO_FADE_END) {
      return { opacity: 0, transform: `scale(${LOGO_SCALE_MIN})` };
    }
    
    const progress = (scrollY - SCROLL_THRESHOLD_LOGO_FADE_START) / 
                    (SCROLL_THRESHOLD_LOGO_FADE_END - SCROLL_THRESHOLD_LOGO_FADE_START);
    
    return {
      opacity: 1 - progress,
      transform: `scale(${LOGO_SCALE_MAX - (LOGO_SCALE_MAX - LOGO_SCALE_MIN) * progress})`,
    };
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-300"
        style={{ 
          backgroundImage: `url(${heroBackground})`,
          opacity: imageOpacity,
          filter: `brightness(${imageBrightness})`,
        }}
        role="presentation"
        aria-hidden="true"
      />
      
      <div className="hero-overlay absolute inset-0" aria-hidden="true" />
      
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div 
          className={`transition-all duration-1000 ease-out ${
            logoAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={getLogoStyle()}
        >
          <img 
            src={logoImage} 
            alt="" 
            className="mx-auto mb-8 max-w-md w-full h-auto"
            loading="eager"
            decoding="async"
            role="presentation"
            aria-hidden="true"
          />
        </div>

        <div className="space-y-8 mt-12">
          <a 
            href={EVENTIM_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block hover:scale-105 transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Tickets für Pater Brown Live-Hörspiel sichern"
          >
            <img 
              src={ticketsNeon} 
              alt="" 
              className="mx-auto h-20 md:h-28 w-auto mix-blend-screen"
              loading="eager"
              decoding="async"
              role="presentation"
              aria-hidden="true"
            />
          </a>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <a 
              href={EVENTIM_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-105 transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Jetzt Tickets buchen"
            >
              <img 
                src={jetztBuchenNeon} 
                alt="" 
                className="h-16 md:h-20 w-auto mix-blend-screen"
                loading="eager"
                decoding="async"
                role="presentation"
                aria-hidden="true"
              />
            </a>
            
            <img 
              src={menuNeon} 
              alt="" 
              className="h-16 md:h-20 w-auto mix-blend-screen"
              loading="eager"
              decoding="async"
              role="presentation"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
        aria-hidden="true"
      >
        <div className="w-6 h-10 border-2 border-gold/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-gold/70 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
