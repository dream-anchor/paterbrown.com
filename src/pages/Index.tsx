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
      />
      <FAQStructuredData />
      <SkipLink />
      
      <h1 className="sr-only">Pater Brown - Das Live-Hörspiel mit Wanja Mues und Antoine Monot</h1>
      
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
        
        <section className="py-24 px-6 bg-card/10" aria-labelledby="project-heading">
          <div className="container mx-auto max-w-4xl text-center space-y-8">
            <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium">
              Die Geschichte dahinter
            </p>
            <h2 id="project-heading" className="text-5xl md:text-7xl font-heading tracking-wider text-foreground uppercase">
              Kult trifft Innovation
            </h2>
            <div className="divider-gold w-32 mx-auto" aria-hidden="true" />
            <p className="text-xl text-foreground/90 leading-relaxed">
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
