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
      {/* Fixed Nav Bar — smooth slide-down */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: "hsl(var(--background) / 0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid hsl(var(--gold) / 0.15)",
          boxShadow: "0 1px 30px rgba(0, 0, 0, 0.6)",
          paddingTop: "env(safe-area-inset-top)",
          transform: visible ? "translateY(0)" : "translateY(-100%)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
          willChange: "transform, opacity",
        }}
      >
        <div className="w-[92%] max-w-[1400px] mx-auto flex items-center justify-between py-3 md:py-4">
          {/* Logo */}
          <Link
            to="/"
            className="hover:opacity-80 transition-opacity duration-300 shrink-0"
            aria-label="Startseite"
          >
            <img
              src={logoImage}
              alt="Pater Brown Logo"
              className="h-12 md:h-20 lg:h-28 w-auto"
              loading="lazy"
              decoding="async"
            />
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-12"
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
                  className={`relative text-sm uppercase tracking-[0.25em] font-heading transition-colors duration-300 py-2 group ${
                    link.highlight
                      ? "neon-gold"
                      : "text-foreground/50 hover:text-foreground/90"
                  }`}
                >
                  {link.label}
                  {link.children && (
                    <span className="ml-1.5 text-[0.55em] opacity-40 group-hover:opacity-70 transition-opacity" aria-hidden="true">
                      &#9662;
                    </span>
                  )}
                  <span
                    className={`absolute bottom-0 left-0 h-[1px] transition-all duration-300 ${
                      link.highlight
                        ? "w-full bg-gold/40"
                        : "w-0 group-hover:w-full bg-foreground/30"
                    }`}
                  />
                </Link>

                {/* Dropdown */}
                {link.children && openDropdown === link.label && (
                  <div
                    className="absolute top-full left-0 pt-3 min-w-[220px]"
                    onMouseEnter={() => handleDropdownEnter(link.label)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div
                      className="border border-foreground/10 py-2"
                      style={{
                        backgroundColor: "hsl(var(--background) / 0.97)",
                        backdropFilter: "blur(16px)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                      }}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block px-6 py-3 text-xs font-heading uppercase tracking-[0.2em] text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all duration-200"
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

          {/* Ticket Button */}
          <a
            href={EVENTIM_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block hover:scale-105 transition-transform duration-300 shrink-0"
          >
            <img
              src={ticketButton}
              alt="Tickets sichern"
              className="h-[96px] md:h-[140px] w-auto mix-blend-screen"
              loading="lazy"
              decoding="async"
            />
          </a>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="md:hidden p-3 text-foreground/50 hover:text-foreground transition-colors duration-300"
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
