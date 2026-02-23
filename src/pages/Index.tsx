import { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import SkipLink from "@/components/SkipLink";
import { FAQStructuredData } from "@/components/StructuredData";
import { SEO } from "@/components/SEO";
import { StickyBlackWeekCTA } from "@/components/StickyBlackWeekCTA";
import { getSEOTourYear } from "@/lib/dateUtils";

// Lazy load non-critical sections for better performance
const CastSection = lazy(() => import("@/components/CastSection"));
const TrailerSection = lazy(() => import("@/components/TrailerSection"));
const ShowConceptSection = lazy(() => import("@/components/ShowConceptSection"));
const ProjectConceptSection = lazy(() => import("@/components/ProjectConceptSection"));
const TourDatesSection = lazy(() => import("@/components/TourDatesSection"));
const SocialProofSection = lazy(() => import("@/components/SocialProofSection"));

const TeamSection = lazy(() => import("@/components/TeamSection"));
const NewsletterSection = lazy(() => import("@/components/NewsletterSection"));

const SectionLoader = () => (
  <div className="py-12 text-center">
    <div className="animate-pulse text-gold">Lädt...</div>
  </div>
);

const Index = () => {
  // Fetch tour events to determine dynamic year for SEO
  const { data: tourEvents = [] } = useQuery({
    queryKey: ['seo-tour-year'],
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const { data } = await supabase
        .from('tour_events')
        .select('event_date')
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString().split('T')[0]);
      return data || [];
    }
  });

  const seoYear = getSEOTourYear(tourEvents);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO 
        title={`Pater Brown Live-Hörspiel | Tickets & Termine ${seoYear}`}
        description="Erleben Sie Pater Brown live auf der Bühne mit Wanja Mues und Antoine Monot. Ein einzigartiges Live-Hörspiel-Erlebnis mit Beatboxer Marvelin."
        keywords="Pater Brown, Live-Hörspiel, Wanja Mues, Antoine Monot, Ein Fall für Zwei, Marvelin, Theater, Krimi, G.K. Chesterton"
        canonical="/"
        ogTitle="Pater Brown – Das Live-Hörspiel"
        ogDescription="Mit Wanja Mues und Antoine Monot. Jetzt Tickets sichern!"
        ogImage="/images/og/pater-brown-live-hoerspiel-tour-og.webp"
      />
      <FAQStructuredData />
      <SkipLink />
      
      {/* h1 is now rendered inside HeroSection */}
      
      <HeroSection />
      
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<SectionLoader />}>
          <CastSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <TrailerSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ShowConceptSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ProjectConceptSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <TourDatesSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <SocialProofSection />
        </Suspense>
        
        <section className="py-28 md:py-36 px-6" aria-labelledby="project-heading">
          <div className="container mx-auto max-w-5xl text-center space-y-8">
            <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium">
              Die Geschichte dahinter
            </p>
            <h2 id="project-heading" className="text-5xl md:text-7xl lg:text-[6rem] font-heading text-foreground leading-tight">
              Kult trifft Innovation
            </h2>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent max-w-md mx-auto" aria-hidden="true" />
            <p className="text-xl md:text-2xl text-foreground/70 leading-relaxed font-light max-w-3xl mx-auto">
              Die modernen Adaptionen der G. K. Chesterton-Vorlagen bewahren deren 
              literarischen Reiz und verleihen ihnen zugleich eine frische, zeitgemäße Form.
            </p>
          </div>
        </section>


        <Suspense fallback={<SectionLoader />}>
          <TeamSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <NewsletterSection />
        </Suspense>
      </main>
      
      <Footer />
      
      {/* Sticky CTA Button */}
      <StickyBlackWeekCTA />
    </div>
  );
};

export default Index;
