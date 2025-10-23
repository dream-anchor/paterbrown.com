import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";
import logoImage from "@/assets/pater-brown-logo.png";
import ticketsNeon from "@/assets/tickets-sichern-neon.png";
import jetztBuchenNeon from "@/assets/jetzt-buchen-neon.png";
import menuNeon from "@/assets/menu-neon.png";
import { EVENTIM_AFFILIATE_URL, SCROLL_THRESHOLD_LOGO_FADE_START, SCROLL_THRESHOLD_LOGO_FADE_END, SCROLL_THRESHOLD_IMAGE_OPACITY_START, SCROLL_THRESHOLD_IMAGE_OPACITY_END, SCROLL_THRESHOLD_IMAGE_BRIGHTNESS_END, LOGO_SCALE_MIN, LOGO_SCALE_MAX, IMAGE_OPACITY_MIN, IMAGE_OPACITY_MAX, IMAGE_BRIGHTNESS_MIN, IMAGE_BRIGHTNESS_MAX } from "@/lib/constants";

const HeroSection = () => {
  const [logoAnimating, setLogoAnimating] = useState(false);
  const [imageOpacity, setImageOpacity] = useState(IMAGE_OPACITY_MAX);
  const [imageBrightness, setImageBrightness] = useState(IMAGE_BRIGHTNESS_MAX);

  useEffect(() => {
    const timer = setTimeout(() => setLogoAnimating(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      
      // Image opacity and brightness effects
      if (scrolled <= SCROLL_THRESHOLD_IMAGE_OPACITY_END) {
        const opacityProgress = scrolled / SCROLL_THRESHOLD_IMAGE_OPACITY_END;
        setImageOpacity(IMAGE_OPACITY_MAX - (opacityProgress * (IMAGE_OPACITY_MAX - IMAGE_OPACITY_MIN)));
      }

      if (scrolled <= SCROLL_THRESHOLD_IMAGE_BRIGHTNESS_END) {
        const brightnessProgress = scrolled / SCROLL_THRESHOLD_IMAGE_BRIGHTNESS_END;
        setImageBrightness(IMAGE_BRIGHTNESS_MAX - (brightnessProgress * (IMAGE_BRIGHTNESS_MAX - IMAGE_BRIGHTNESS_MIN)));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getLogoStyle = () => {
    const scrolled = window.scrollY;
    if (scrolled < SCROLL_THRESHOLD_LOGO_FADE_START) return {};
    if (scrolled > SCROLL_THRESHOLD_LOGO_FADE_END) return { opacity: 0, transform: `scale(${LOGO_SCALE_MIN})` };

    const progress = (scrolled - SCROLL_THRESHOLD_LOGO_FADE_START) / (SCROLL_THRESHOLD_LOGO_FADE_END - SCROLL_THRESHOLD_LOGO_FADE_START);
    const opacity = 1 - progress;
    const scale = LOGO_SCALE_MAX - (progress * (LOGO_SCALE_MAX - LOGO_SCALE_MIN));

    return { opacity, transform: `scale(${scale})` };
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroBackground})`,
          opacity: imageOpacity,
          filter: `brightness(${imageBrightness})`
        }}
        role="img"
        aria-label="Pater Brown Live-Hörspiel Hintergrundbild"
      />
      
      {/* Overlay */}
      <div className="hero-overlay" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 py-20 max-w-6xl mx-auto">
        {/* Logo */}
        <div 
          className={`mb-12 transition-all duration-1000 ${logoAnimating ? 'cinematic-enter' : 'opacity-0'}`}
          style={getLogoStyle()}
        >
          <img 
            src={logoImage} 
            alt="Pater Brown - Das Live-Hörspiel Logo" 
            className="w-full max-w-3xl mx-auto h-auto"
            loading="eager"
          />
        </div>

        {/* Neon Images */}
        <div className="space-y-8 animate-fade-in">
          <img 
            src={ticketsNeon} 
            alt="Tickets sichern" 
            className="w-full max-w-2xl mx-auto h-auto mix-blend-screen"
            loading="lazy"
          />
          
          <a 
            href={EVENTIM_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block hover:scale-105 transition-transform"
            aria-label="Jetzt Tickets buchen bei Eventim"
          >
            <img 
              src={jetztBuchenNeon} 
              alt="Jetzt buchen" 
              className="w-full max-w-md mx-auto h-auto mix-blend-screen"
              loading="lazy"
            />
          </a>
          
          <img 
            src={menuNeon} 
            alt="Menü" 
            className="w-full max-w-xs mx-auto h-auto mix-blend-screen"
            loading="lazy"
          />
        </div>

        {/* Scroll Indicator */}
        <div className="mt-20 animate-float" role="button" aria-label="Nach unten scrollen">
          <ChevronDown className="w-12 h-12 mx-auto text-gold animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
