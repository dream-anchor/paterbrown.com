import { Mail, Instagram, Facebook } from "lucide-react";
import { INSTAGRAM_URL, FACEBOOK_URL } from "@/lib/constants";

const Footer = () => {
  return (
    <footer className="bg-card/30 border-t border-gold/20 py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xl font-heading tracking-wider text-foreground">Kontakt</h3>
            <div className="space-y-2">
              <a 
                href="mailto:info@paterbrownlive.de" 
                className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors"
                aria-label="E-Mail an info@paterbrownlive.de senden"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                info@paterbrownlive.de
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-xl font-heading tracking-wider text-foreground">Social Media</h3>
            <div className="flex gap-4">
              <a 
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors"
                aria-label="Besuchen Sie uns auf Instagram"
              >
                <Instagram className="w-6 h-6" aria-hidden="true" />
              </a>
              <a 
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors"
                aria-label="Besuchen Sie uns auf Facebook"
              >
                <Facebook className="w-6 h-6" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-xl font-heading tracking-wider text-foreground">Rechtliches</h3>
            <div className="space-y-2">
              <a 
                href="/impressum" 
                className="block text-muted-foreground hover:text-gold transition-colors"
              >
                Impressum
              </a>
              <a 
                href="/datenschutz" 
                className="block text-muted-foreground hover:text-gold transition-colors"
              >
                Datenschutz
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gold/20 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Pater Brown - Das Live-Hörspiel. Alle Rechte vorbehalten.</p>
          <p className="mt-2">Basierend auf den Geschichten von G.K. Chesterton</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
