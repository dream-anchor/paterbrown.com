import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoImage from "@/assets/pater-brown-logo.png";
import ticketButton from "@/assets/tickets-sichern-button.png";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

interface NavLink {
  label: string;
  href: string;
  highlight?: boolean;
  children?: { label: string; href: string }[];
}

const NAV_LINKS: NavLink[] = [
  {
    label: "Show",
    href: "/live-hoerspiel",
    children: [
      { label: "Das Live-Hörspiel", href: "/live-hoerspiel" },
      { label: "Pater Brown", href: "/pater-brown" },
      { label: "Das Hörspiel", href: "/hoerspiel" },
    ],
  },
  { label: "Termine", href: "/termine", highlight: true },
  {
    label: "Darsteller",
    href: "/wanja-mues",
    children: [
      { label: "Wanja Mues", href: "/wanja-mues" },
      { label: "Antoine Monot", href: "/antoine-monot" },
      { label: "Marvelin", href: "/marvelin" },
    ],
  },
];

const Navigation = () => {
  const [visible, setVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleDropdownEnter = useCallback((label: string) => {
    clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  }, []);

  return (
    <>
      {/* Fixed Nav Bar — identisch mit StickyHeader der Startseite */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: visible ? "hsl(var(--background) / 0.95)" : "transparent",
          backdropFilter: visible ? "blur(12px)" : "none",
          WebkitBackdropFilter: visible ? "blur(12px)" : "none",
          borderBottom: visible ? "1px solid hsl(var(--gold) / 0.2)" : "1px solid transparent",
          boxShadow: visible ? "0 4px 20px rgba(0, 0, 0, 0.5)" : "none",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          paddingTop: "env(safe-area-inset-top)",
          WebkitTransform: "translate3d(0,0,0)",
          transform: "translate3d(0,0,0)",
          willChange: "transform",
        }}
      >
        <div className="w-[92%] max-w-[1400px] mx-auto flex items-center justify-between py-3 md:py-4">
          {/* Logo */}
          <Link
            to="/"
            className="hover:opacity-80 transition-opacity shrink-0"
            aria-label="Startseite"
          >
            <img
              src={logoImage}
              alt="Pater Brown Logo"
              className="h-12 md:h-16 w-auto"
              loading="lazy"
              decoding="async"
            />
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-10"
            aria-label="Hauptnavigation"
          >
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() =>
                  link.children && handleDropdownEnter(link.label)
                }
                onMouseLeave={() => link.children && handleDropdownLeave()}
              >
                <Link
                  to={link.href}
                  className={`text-base uppercase tracking-[0.2em] font-heading transition-colors py-2 ${
                    link.highlight
                      ? "neon-gold"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {link.label}
                  {link.children && (
                    <span className="ml-1 text-[0.6em]" aria-hidden="true">
                      &#9662;
                    </span>
                  )}
                </Link>

                {/* Dropdown */}
                {link.children && openDropdown === link.label && (
                  <div
                    className="absolute top-full left-0 pt-2 min-w-[200px]"
                    onMouseEnter={() => handleDropdownEnter(link.label)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="bg-card/95 backdrop-blur-md border border-border rounded-[3px] py-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block px-5 py-2.5 text-sm font-heading uppercase tracking-[0.15em] text-foreground/60 hover:text-foreground hover:bg-primary/5 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Ticket Button — identisch mit StickyHeader */}
          <a
            href={EVENTIM_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform shrink-0"
          >
            <img
              src={ticketButton}
              alt="Tickets sichern"
              className="h-[48px] md:h-[64px] lg:h-[80px] w-auto mix-blend-screen"
              loading="lazy"
              decoding="async"
            />
          </a>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="md:hidden p-2 text-foreground/70 hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Menü öffnen"
            aria-expanded={mobileOpen}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Off-Canvas */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, hsl(var(--background) / 0.95) 80%, transparent)",
            }}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          <nav
            className="relative w-[85%] max-w-sm h-full bg-background flex flex-col pt-20 px-8 pb-8 overflow-y-auto"
            style={{
              animation: "slideInLeft 500ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            aria-label="Mobile Navigation"
          >
            <button
              type="button"
              className="absolute top-6 right-6 p-2 text-foreground/50 hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(false)}
              aria-label="Menü schließen"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-6">
              {NAV_LINKS.map((link) => (
                <div key={link.label}>
                  <Link
                    to={link.href}
                    className="block text-sm font-heading uppercase tracking-[0.2em] text-foreground/80 hover:text-primary transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="ml-4 mt-2 space-y-2 border-l border-border pl-4">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block text-xs font-heading uppercase tracking-[0.15em] text-foreground/50 hover:text-foreground transition-colors py-1"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="mt-auto pt-8">
              <a
                href={EVENTIM_AFFILIATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={ticketButton}
                  alt="Tickets sichern"
                  className="h-[64px] w-auto mix-blend-screen mx-auto"
                />
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Navigation;
