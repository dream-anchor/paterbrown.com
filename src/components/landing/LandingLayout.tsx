import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Breadcrumb from "./Breadcrumb";
import paterbrown from "@/assets/pater-brown-logo.png";
import heroBackgroundModern from "@/assets/hero-background-modern.jpg";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface LandingLayoutProps {
  children: ReactNode;
  breadcrumbs: BreadcrumbItem[];
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  showCTA?: boolean;
  /** "immersive" entfernt Hero/Nav und erlaubt Fullbleed-Sections */
  variant?: "default" | "immersive";
}

const LandingLayout = ({
  children,
  breadcrumbs,
  heroImage,
  heroTitle,
  heroSubtitle,
  showCTA = true,
  variant = "default",
}: LandingLayoutProps) => {
  if (variant === "immersive") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Immersive: Kein Hero-Header, die Seite hat eigenen Hero */}
        <main className="flex-1">
          {/* Logo + Breadcrumb als absolutes Overlay über dem Hero */}
          <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
            <div className="container mx-auto px-6 py-4 pointer-events-auto">
              <Link
                to="/"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <img
                  src={paterbrown}
                  alt="Pater Brown Logo"
                  className="h-12 md:h-16 w-auto"
                />
              </Link>
            </div>
            <div className="container mx-auto px-6 pointer-events-auto">
              <Breadcrumb items={breadcrumbs} />
            </div>
          </div>

          {/* Fullbleed Content — kein Wrapper, kein max-w, kein padding */}
          {children}
        </main>

        <Footer />
      </div>
    );
  }

  // Default variant — Lovable Mousetrap-Style mit Floating Nav + Full-Viewport Hero
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Floating Nav – minimal, Mousetrap-style */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img
            src={paterbrown}
            alt="Pater Brown Logo"
            className="h-12 md:h-16 w-auto"
          />
        </Link>
        <Link
          to="/termine"
          className="text-foreground/80 hover:text-foreground transition-colors text-xs uppercase tracking-[0.25em] font-medium border border-foreground/20 hover:border-foreground/40 px-5 py-2.5"
        >
          Tickets
        </Link>
      </nav>

      {/* Full-Viewport Hero with modern stage background */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage || heroBackgroundModern})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-transparent" />

        <div className="relative z-10 text-center px-6 w-full max-w-5xl mx-auto">
          {heroTitle && (
            <>
              <p className="text-foreground/40 text-xs md:text-sm uppercase tracking-[0.4em] mb-6 cinematic-enter">
                Pater Brown Live
              </p>
              <h1 className="text-6xl sm:text-8xl md:text-[10rem] lg:text-[13rem] font-heading text-foreground leading-[0.85] tracking-tight uppercase cinematic-enter" style={{ animationDelay: '0.15s' }}>
                {heroTitle}
              </h1>
            </>
          )}
          {heroSubtitle && (
            <p className="text-lg md:text-xl text-foreground/50 font-light mt-8 tracking-wide cinematic-enter" style={{ animationDelay: '0.3s' }}>
              {heroSubtitle}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <main className="flex-1">
        <div className="px-6 md:px-12 py-8 max-w-6xl mx-auto">
          <Breadcrumb items={breadcrumbs} />
        </div>
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default LandingLayout;
