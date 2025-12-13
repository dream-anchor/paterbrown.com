import logoImage from "@/assets/pater-brown-logo.png";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

const NewsletterSent = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <SEO 
        title="E-Mail bestätigen"
        description="Bitte bestätigen Sie Ihre Newsletter-Anmeldung per E-Mail."
        robots="noindex, nofollow"
        canonical="/newsletter-gesendet"
      />
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

          {/* Icon */}
          <div className="cinematic-enter inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/30 mb-8" style={{ animationDelay: "0.1s" }}>
            <Mail className="w-10 h-10 text-gold" />
          </div>

          {/* Bestätigungstext */}
          <div className="space-y-8 mb-16 cinematic-enter" style={{ animationDelay: "0.2s" }}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-[0.1em] text-foreground/95 leading-tight">
              Fast geschafft!
            </h1>
            
            <div className="divider-gold w-32 mx-auto my-8" aria-hidden="true" />
            
            <div className="space-y-4 max-w-2xl mx-auto">
              <p className="text-xl md:text-2xl text-gold/90 font-light leading-relaxed">
                Wir haben dir eine Bestätigungs-E-Mail gesendet.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Bitte überprüfe dein Postfach und klicke auf den Bestätigungslink, um deine Anmeldung abzuschließen.
              </p>
              <p className="text-sm text-muted-foreground/70 mt-6">
                Keine E-Mail erhalten? Überprüfe auch deinen Spam-Ordner.
              </p>
            </div>
          </div>

          {/* Zurück zur Startseite */}
          <Link 
            to="/"
            className="cinematic-enter inline-block"
            style={{ animationDelay: "0.4s" }}
          >
            <button className="btn-premium">
              Zurück zur Startseite
            </button>
          </Link>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default NewsletterSent;
