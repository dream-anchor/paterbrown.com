import { type ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CTABlock from "@/components/shared/CTABlock";
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
  /** "immersive" entfernt Hero und erlaubt Fullbleed-Sections */
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
        <Navigation />

        <main className="flex-1">
          {children}
        </main>

        {showCTA && <CTABlock />}
        <Footer />
      </div>
    );
  }

  // Default variant — Full-Viewport Hero + Content
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Full-Viewport Hero */}
      <section className="relative min-h-screen flex items-end justify-center overflow-hidden pb-12 md:pb-16">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage || heroBackgroundModern})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        <div className="relative z-10 text-center px-6 w-full max-w-5xl mx-auto">
          {heroTitle && (
            <>
              <p className="neon-gold-subtle text-xs md:text-sm uppercase tracking-[0.4em] mb-6 font-heading cinematic-enter">
                Pater Brown Live
              </p>
              <h1
                className="text-5xl sm:text-7xl md:text-[8rem] lg:text-[10rem] font-heading text-foreground leading-[0.85] cinematic-enter neon-gold neon-breathe"
                style={{ animationDelay: "0.15s" }}
              >
                {heroTitle}
              </h1>
            </>
          )}
          {heroSubtitle && (
            <p
              className="text-lg md:text-xl text-foreground/50 font-light tracking-wide mt-8 cinematic-enter"
              style={{ animationDelay: "0.3s" }}
            >
              {heroSubtitle}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {showCTA && <CTABlock />}
      <Footer />
    </div>
  );
};

export default LandingLayout;
