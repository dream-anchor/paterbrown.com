import logoImage from "@/assets/pater-brown-logo.png";
import Footer from "@/components/Footer";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import { Link } from "react-router-dom";

const NewsletterThankYou = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      
      <main className="flex-grow flex items-center justify-center px-6 py-20 relative z-10">
        <div className="max-w-4xl w-full text-center">
          {/* Logo */}
          <div className="mb-16 cinematic-enter">
            <Link to="/" aria-label="Zurück zur Startseite">
              <img 
                src={logoImage} 
                alt="Pater Brown - Das Live-Hörspiel" 
                className="w-full max-w-md mx-auto h-auto drop-shadow-[0_0_60px_rgba(234,179,8,0.3)] cursor-pointer hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Dankestext */}
          <div className="space-y-8 mb-16 cinematic-enter" style={{ animationDelay: "0.2s" }}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-[0.1em] text-foreground/95 leading-tight">
              Vielen Dank für deine Anmeldung!
            </h1>
            
            <div className="divider-gold w-32 mx-auto my-8" aria-hidden="true" />
            
            <p className="text-xl md:text-2xl text-gold/90 font-light leading-relaxed">
              Du erhältst ab sofort alle News und Updates direkt in dein Postfach.
            </p>
          </div>

          {/* CTA Button */}
          <a 
            href={EVENTIM_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cinematic-enter inline-block"
            style={{ animationDelay: "0.4s" }}
            aria-label="Tickets für Pater Brown Live-Hörspiel bei Eventim kaufen"
          >
            <button className="btn-premium">
              <span aria-hidden="true">🎟</span> Tickets sichern
            </button>
          </a>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default NewsletterThankYou;
