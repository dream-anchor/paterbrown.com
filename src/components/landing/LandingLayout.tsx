import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Breadcrumb from "./Breadcrumb";
import paterbrown from "@/assets/pater-brown-logo.png";

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
}

const LandingLayout = ({
  children,
  breadcrumbs,
  heroImage,
  heroTitle,
  heroSubtitle,
  showCTA = true,
}: LandingLayoutProps) => (
  <div className="min-h-screen flex flex-col bg-background">
    {/* Floating Nav */}
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-gradient-to-b from-background/90 to-transparent">
      <Link
        to="/"
        className="hover:opacity-80 transition-opacity"
      >
        <img
          src={paterbrown}
          alt="Pater Brown Logo"
          className="h-12 md:h-16 w-auto"
        />
      </Link>
      <Link
        to="/termine"
        className="text-foreground/90 hover:text-gold transition-colors text-sm uppercase tracking-[0.2em] font-medium border border-foreground/20 hover:border-gold/50 px-5 py-2.5"
      >
        Tickets
      </Link>
    </nav>

    {/* Full-Viewport Hero */}
    {heroImage && (
      <section className="relative h-screen min-h-[600px] flex items-end justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="relative z-10 text-center pb-16 md:pb-24 px-6 w-full max-w-5xl mx-auto">
          {heroTitle && (
            <h1 className="text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] font-heading font-black text-foreground leading-[0.85] tracking-tight uppercase">
              {heroTitle}
            </h1>
          )}
          {heroSubtitle && (
            <p className="text-lg md:text-2xl text-foreground/70 font-light mt-6 tracking-wide">
              {heroSubtitle}
            </p>
          )}
        </div>
      </section>
    )}

    {/* Content - Full Width Sections */}
    <main className="flex-1">
      <div className="px-6 md:px-12 py-8 max-w-6xl mx-auto">
        <Breadcrumb items={breadcrumbs} />
      </div>
      {children}
    </main>

    <Footer />
  </div>
);

export default LandingLayout;
