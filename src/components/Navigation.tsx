import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoImage from "@/assets/pater-brown-logo.png";
import GhostButton from "@/components/ui/GhostButton";

interface NavLink {
  label: string;
  href: string;
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
  { label: "Termine", href: "/termine" },
  {
    label: "Darsteller",
    href: "/wanja-mues",
    children: [
      { label: "Wanja Mues", href: "/wanja-mues" },
      { label: "Antoine Monot", href: "/antoine-monot" },
      { label: "Marvelin", href: "/marvelin" },
      { label: "Stefanie Sick", href: "/stefanie-sick" },
    ],
  },
];

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Schließe Mobile-Menu bei Routenwechsel
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  // Body-Scroll verhindern wenn Off-Canvas offen
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
      {/* Fixed Nav Bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled
            ? "hsl(var(--background) / 0.95)"
            : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled
            ? "1px solid hsl(var(--gold) / 0.1)"
            : "1px solid transparent",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="w-[88%] max-w-[1400px] mx-auto flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            to="/"
            className="hover:opacity-80 transition-opacity shrink-0"
            aria-label="Startseite"
          >
            <img
              src={logoImage}
              alt="Pater Brown Logo"
              className="h-10 md:h-14 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden lg:flex items-center gap-8"
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
                  className="text-xs font-heading uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-colors py-2"
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
                          className="block px-5 py-2.5 text-xs font-heading uppercase tracking-[0.15em] text-foreground/60 hover:text-foreground hover:bg-primary/5 transition-colors"
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

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <GhostButton to="/termine" size="sm">
              Tickets
            </GhostButton>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="lg:hidden p-2 text-foreground/70 hover:text-foreground transition-colors"
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
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Gradient-Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, hsl(var(--background) / 0.95) 80%, transparent)",
            }}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Off-Canvas Panel */}
          <nav
            className="relative w-[85%] max-w-sm h-full bg-background flex flex-col pt-20 px-8 pb-8 overflow-y-auto"
            style={{
              animation: "slideInLeft 500ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            aria-label="Mobile Navigation"
          >
            {/* Schließen */}
            <button
              type="button"
              className="absolute top-6 right-6 p-2 text-foreground/50 hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(false)}
              aria-label="Menü schließen"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Nav Links */}
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
              <GhostButton to="/termine" size="lg" className="w-full justify-center">
                Tickets
              </GhostButton>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Navigation;
