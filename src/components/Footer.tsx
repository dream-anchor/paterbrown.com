import { Instagram, Flame } from "lucide-react";
import { EVENTIM_AFFILIATE_URL, INSTAGRAM_URL } from "@/lib/constants";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const isBlackWeek = isBlackWeekActive();
  
  return (
    <footer className="py-20 px-6 border-t border-gold/10 bg-background" role="contentinfo">
      <div className="container mx-auto max-w-6xl">
        
        {/* Black Week CTA */}
        {isBlackWeek && (
          <div className="flex items-center justify-center my-16">
            <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer">
              <button 
                className="stoerer-badge px-10 py-4 rounded-full inline-flex items-center gap-3 hover:scale-105 transition-transform"
                type="button"
              >
                <Flame className="w-6 h-6 text-black fill-neon-gold" />
                <span className="text-black font-black text-lg uppercase tracking-wide">
                  🔥 Jetzt letzte Tickets sichern – 30% bis 1.12.
                </span>
                <Flame className="w-6 h-6 text-black fill-neon-gold" />
              </button>
            </a>
          </div>
        )}


        <div className="grid md:grid-cols-3 gap-12 text-center mb-12 justify-items-center">
          <div>
            <h3 className="text-gold text-xs mb-4 tracking-[0.3em] uppercase font-bold">
              Kontakt
            </h3>
            <address className="text-foreground/80 text-sm leading-relaxed not-italic">
              <a href="mailto:hallo@paterbrown.com" className="hover:text-gold transition-colors">
                hallo@paterbrown.com
              </a>
              <br />
              <a href="tel:+498990901539433" className="hover:text-gold transition-colors">
                +49 89 909015 3943
              </a>
            </address>
          </div>

          <div>
            <h3 className="text-gold text-xs mb-4 tracking-[0.3em] uppercase font-bold">
              Social
            </h3>
            <nav aria-label="Social Media Links">
              <div className="flex gap-6 justify-center">
              <a 
                href={INSTAGRAM_URL} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/80 hover:text-gold transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background rounded"
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
                <a href="/impressum" className="text-foreground/80 hover:text-gold transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background rounded">
                  Impressum
                </a>
                <a href="/datenschutz" className="text-foreground/80 hover:text-gold transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background rounded">
                  Datenschutz
                </a>
              </div>
            </nav>
          </div>
        </div>

        <div className="text-center mb-16 px-4">
          <h3 className="text-foreground text-xs mb-4 tracking-[0.3em] uppercase font-bold">
            Ticketservice
          </h3>
          <p className="text-foreground/80 text-sm leading-relaxed max-w-3xl mx-auto">
            Unser Ticketpartner <a href="https://www.eventim.de" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold/80 transition-colors font-semibold">eventim.de</a> hilft dir gern weiter –<br />
            telefonisch Montag bis Freitag von <strong>10–16 Uhr</strong> unter{" "}
            <a href="tel:+4942120315511" className="hover:text-gold transition-colors">
              +49 421 20 31 55 11
            </a>{" "}
            oder jederzeit im{" "}
            <a 
              href="https://www.eventim.de/faq/de_de/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              Helpcenter
            </a>.
          </p>
        </div>

        <div className="divider-gold mb-8" aria-hidden="true" />

        <div className="text-center space-y-4">
          <p className="text-foreground/60 text-sm">
            Eine Produktion der Dream & Anchor
          </p>
          <p className="text-muted-foreground text-xs tracking-wider">
            © {currentYear} Pater Brown Live-Hörspiel
          </p>
          <div className="mt-6">
            <a 
              href={EVENTIM_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold/80 transition-colors text-sm font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background rounded"
              aria-label="Noch keine Tickets? Jetzt bei Eventim sichern"
            >
              Noch keine Tickets? Jetzt sichern <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
