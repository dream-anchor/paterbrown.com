import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { INSTAGRAM_URL } from "@/lib/constants";

const FOOTER_NAV = [
  {
    heading: "Pater Brown",
    links: [
      { label: "Pater Brown", href: "/pater-brown" },
      { label: "Das Live-Hörspiel", href: "/live-hoerspiel" },
      { label: "Krimi-Hörspiel", href: "/krimi-hoerspiel" },
    ],
  },
  {
    heading: "Darsteller",
    links: [
      { label: "Wanja Mues", href: "/wanja-mues" },
      { label: "Antoine Monot", href: "/antoine-monot" },
      { label: "Marvelin", href: "/marvelin" },
    ],
  },
  {
    heading: "Termine",
    links: [
      { label: "Alle Termine", href: "/termine" },
      { label: "München", href: "/muenchen" },
      { label: "Hamburg", href: "/hamburg" },
      { label: "Köln", href: "/koeln" },
      { label: "Berlin", href: "/berlin" },
    ],
  },
  {
    heading: "Mehr",
    links: [
      { label: "G.K. Chesterton", href: "/g-k-chesterton" },
      { label: "Das Hörspiel", href: "/hoerspiel" },
      { label: "Father Brown", href: "/father-brown" },
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
    ],
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-16 pb-12 bg-background border-t border-border/30" role="contentinfo">
      <div className="w-[88%] max-w-[1400px] mx-auto">
        {/* 4-Spalten Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {FOOTER_NAV.map((col) => (
            <div key={col.heading}>
              <h3 className="text-primary text-xs font-heading uppercase tracking-[0.2em] mb-5">
                {col.heading}
              </h3>
              <nav aria-label={col.heading}>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-foreground/50 hover:text-foreground text-sm font-heading uppercase tracking-[0.1em] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>

        {/* Kontakt-Zeile */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <address className="not-italic font-serif text-foreground/60 text-sm tracking-[0.05em]">
            <a href="mailto:hallo@paterbrown.com" className="hover:text-primary transition-colors">
              hallo@paterbrown.com
            </a>
            <span className="mx-3 text-primary/30">|</span>
            <a href="tel:+498990901539433" className="hover:text-primary transition-colors">
              +49 89 909015 3943
            </a>
          </address>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/50 hover:text-primary transition-colors flex items-center gap-2"
            aria-label="Besuche uns auf Instagram"
          >
            <Instagram className="w-4 h-4" aria-hidden="true" />
            <span className="text-xs font-heading uppercase tracking-[0.15em]">Instagram</span>
          </a>
        </div>

        {/* Divider */}
        <div className="divider-gold mb-8" aria-hidden="true" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-foreground/40 text-xs font-heading uppercase tracking-[0.1em]">
              Eine Produktion der Dream &amp; Anchor
            </p>
            <p className="text-muted-foreground text-xs tracking-wider">
              &copy; {currentYear} Pater Brown Live-Hörspiel
            </p>
          </div>

          <p className="text-foreground/25 text-[10px] tracking-wider">
            Fotos: &copy; Alexander Frank, Gio Löwe
          </p>
        </div>

        {/* Admin Link */}
        <div className="text-center mt-8">
          <a
            href="/admin"
            className="text-muted-foreground/30 hover:text-foreground/40 transition-colors text-[10px]"
          >
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
