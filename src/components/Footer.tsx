import { Mail, Instagram, Facebook } from "lucide-react";
import { INSTAGRAM_URL, FACEBOOK_URL } from "@/lib/constants";

const Footer = () => {
  return (
    <footer className="bg-card/20 py-12 px-6 border-t border-border" role="contentinfo">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Contact */}
          <div>
            <h3 className="text-gold font-heading text-lg mb-4 uppercase tracking-wider">
              Kontakt
            </h3>
            <a 
              href="mailto:info@paterbrownlive.de" 
              className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:rounded"
              aria-label="E-Mail an info@paterbrownlive.de senden"
            >
              <Mail className="w-5 h-5" aria-hidden="true" />
              <span>info@paterbrownlive.de</span>
            </a>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-gold font-heading text-lg mb-4 uppercase tracking-wider">
              Social Media
            </h3>
            <div className="flex gap-4">
              <a 
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:rounded"
                aria-label="Folgen Sie uns auf Instagram"
              >
                <Instagram className="w-6 h-6" aria-hidden="true" />
              </a>
              <a 
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:rounded"
                aria-label="Folgen Sie uns auf Facebook"
              >
                <Facebook className="w-6 h-6" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-gold font-heading text-lg mb-4 uppercase tracking-wider">
              Rechtliches
            </h3>
            <nav aria-label="Rechtliche Informationen">
              <ul className="space-y-2">
                <li>
                  <a 
                    href="#impressum" 
                    className="text-muted-foreground hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:rounded"
                  >
                    Impressum
                  </a>
                </li>
                <li>
                  <a 
                    href="#datenschutz" 
                    className="text-muted-foreground hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:rounded"
                  >
                    Datenschutz
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2025 Pater Brown - Das Live-Hörspiel. Alle Rechte vorbehalten.</p>
          <p className="mt-2">Basierend auf den Geschichten von G.K. Chesterton</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
