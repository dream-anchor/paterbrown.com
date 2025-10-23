import { useEffect, useState } from "react";
import StickyHeader from "@/components/StickyHeader";
import HeroSection from "@/components/HeroSection";
import CastSection from "@/components/CastSection";
import ShowConceptSection from "@/components/ShowConceptSection";
import TourDatesSection from "@/components/TourDatesSection";
import ProjectConceptSection from "@/components/ProjectConceptSection";
import TeamSection from "@/components/TeamSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import { SCROLL_THRESHOLD_STICKY_HEADER } from "@/lib/constants";

const Index = () => {
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  useEffect(() => {
    let rafId: number;
    
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        setShowStickyHeader(window.scrollY > SCROLL_THRESHOLD_STICKY_HEADER);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold focus:text-primary-foreground">
        Zum Hauptinhalt springen
      </a>
      
      <h1 className="sr-only">Pater Brown - Das Live-Hörspiel: Tickets für 2025 sichern</h1>
      
      {showStickyHeader && <StickyHeader />}
      
      <main id="main-content" role="main">
        <HeroSection />
        <CastSection />
        <ShowConceptSection />
        <TourDatesSection />
        <ProjectConceptSection />
        <TeamSection />
        <NewsletterSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
