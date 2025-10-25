import { Instagram } from "lucide-react";
import { EVENTIM_AFFILIATE_URL, INSTAGRAM_URL } from "@/lib/constants";

const Footer = () => {
  return (
    <footer className="py-20 px-6 border-t border-gold/10 bg-background" role="contentinfo">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-12 text-center md:text-left mb-16">
          <div>
            <h3 className="text-gold text-xs mb-4 tracking-[0.3em] uppercase font-bold">
              Kontakt
            </h3>
            <address className="text-foreground/80 text-sm leading-relaxed not-italic">
              <a href="mailto:info@paterbrown-live.de" className="hover:text-gold transition-colors">
                info@paterbrown-live.de
              </a>
              <br />
              +49 123 456 789
            </address>
          </div>

          <div>
            <h3 className="text-gold text-xs mb-4 tracking-[0.3em] uppercase font-bold">
              Social
            </h3>
            <nav aria-label="Social Media Links">
              <div className="flex gap-6 justify-center md:justify-start">
                <a 
                  href={INSTAGRAM_URL} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-gold transition-colors flex items-center gap-2"
                  aria-label="Besuche uns auf Instagram"
                >
                  <Instagram className="w-5 h-5" aria-hidden="true" />
                  <span className="text-sm">Instagram</span>
                </a>
              </div>
            </nav>
          </div>

          <div>
            <h3 className="text-gold text-xs mb-4 tracking-[0.3em] uppercase font-bold">
              Rechtliches
            </h3>
            <nav aria-label="Rechtliche Links">
              <div className="flex flex-col gap-2 text-sm">
                <a href="/impressum" className="text-foreground/80 hover:text-gold transition-colors">
                  Impressum
                </a>
                <a href="/datenschutz" className="text-foreground/80 hover:text-gold transition-colors">
                  Datenschutz
                </a>
                <a href="/agb" className="text-foreground/80 hover:text-gold transition-colors">
                  AGB
                </a>
              </div>
            </nav>
          </div>
        </div>

        <div className="divider-gold mb-8" aria-hidden="true" />

        <div className="text-center space-y-4">
          <p className="text-foreground/60 text-sm">
            Eine Produktion der Dream & Anchor.
          </p>
          <p className="text-muted-foreground text-xs tracking-wider">
            © 2025 Pater Brown Live-Hörspiel
          </p>
          <div className="mt-6">
            <a 
              href={EVENTIM_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold/80 transition-colors text-sm font-medium tracking-wide"
              aria-label="Noch keine Tickets? Jetzt bei Eventim sichern"
            >
              Noch keine Tickets? Jetzt sichern →
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
