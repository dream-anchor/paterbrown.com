import { type ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CTABlock from "@/components/shared/CTABlock";

const DEFAULT_HERO = "/images/hero/pater-brown-buehne-ensemble-nebel-dd";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface LandingLayoutProps {
  children: ReactNode;
  breadcrumbs: BreadcrumbItem[];
  /** Basispfad ohne Größen-Suffix, z.B. "/images/hero/mein-bild" */
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

  const heroBase = heroImage || DEFAULT_HERO;
  const isResponsiveHero = !heroImage || !heroImage.includes(".");

  // Default variant — Full-Viewport Hero + Content
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Full-Viewport Hero */}
      <section className="relative min-h-screen flex items-end justify-center overflow-hidden pb-12 md:pb-16">
        <div className="absolute inset-0">
          {isResponsiveHero ? (
            <img
              src={`${heroBase}-1200.webp`}
              srcSet={[
                `${heroBase}-480.webp 480w`,
                `${heroBase}-768.webp 768w`,
                `${heroBase}-1200.webp 1200w`,
                `${heroBase}-2000.webp 2000w`,
                `${heroBase}.webp 3817w`,
              ].join(", ")}
              sizes="100vw"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              style={{ objectPosition: "50% 25%" }}
              loading="eager"
              decoding="async"
            />
          ) : (
            <img
              src={heroImage}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              style={{ objectPosition: "50% 25%" }}
              loading="eager"
              decoding="async"
            />
          )}
        </div>
        {/* Gradient nur untere ~40% — Köpfe/Gesichter bleiben frei */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.7) 20%, hsl(var(--background) / 0.15) 45%, transparent 65%)",
          }}
        />

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
