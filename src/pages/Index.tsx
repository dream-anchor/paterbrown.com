import { useState, useEffect } from "react";
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
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > SCROLL_THRESHOLD_STICKY_HEADER);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {showStickyHeader && <StickyHeader />}
      
      <main>
        <h1 className="sr-only">Pater Brown - Das Live-Hörspiel mit Wanja Mues und Antoine Monot Jr.</h1>
        
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
