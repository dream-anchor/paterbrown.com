import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import Footer from "@/components/Footer";
import heroBackground from "@/assets/hero-background.jpg";
import logo from "@/assets/pater-brown-logo.png";

const TicketThankYou = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Vielen Dank für Ihre Buchung"
        description="Vielen Dank für Ihren Ticketkauf. Wir freuen uns darauf, Sie beim Pater Brown Live-Hörspiel begrüßen zu dürfen."
        robots="noindex, nofollow"
        canonical="/danke-ticket"
      />
      
      <div 
        className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="cinematic-enter mb-8">
            <Link to="/" aria-label="Zur Startseite">
              <img 
                src={logo}
                alt="Pater Brown Logo"
                className="h-32 md:h-40 mx-auto hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Thank You Message */}
          <div className="space-y-6 cinematic-enter" style={{ animationDelay: "0.2s" }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading tracking-wider text-gold uppercase">
              Vielen Dank!
            </h1>
            
            <div className="divider-gold w-24 mx-auto" />
            
            <div className="space-y-4 max-w-2xl mx-auto">
              <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed">
                Ihre Buchung war erfolgreich.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Wir freuen uns darauf, Sie beim Pater Brown Live-Hörspiel begrüßen zu dürfen. 
                Sie erhalten in Kürze eine Bestätigung per E-Mail.
              </p>
              
              <p className="text-base text-muted-foreground/80 pt-4">
                Bereiten Sie sich auf einen unvergesslichen Abend voller Spannung und Rätsellösung vor!
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="cinematic-enter pt-8" style={{ animationDelay: "0.4s" }}>
            <Link
              to="/"
              className="btn-premium inline-block"
            >
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TicketThankYou;
