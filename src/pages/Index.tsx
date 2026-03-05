import { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import SkipLink from "@/components/SkipLink";
import { FAQStructuredData } from "@/components/StructuredData";
import { SEO } from "@/components/SEO";
import StickyMobileCTA from "@/components/shared/StickyMobileCTA";
import { getSEOTourYear } from "@/lib/dateUtils";
import FAQSection from "@/components/landing/FAQSection";

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

const HOME_FAQ_ITEMS = [
  {
    question: "Was ist das Pater Brown Live-Hörspiel?",
    answer:
      "Das Pater Brown Live-Hörspiel ist ein literarisches Bühnenerlebnis nach den Kriminalgeschichten von G.K. Chesterton. Antoine Monot und Wanja Mues schlüpfen live in alle Rollen, während Beatboxer Marvelin sämtliche Geräusche und Soundeffekte ausschließlich mit dem Mund erzeugt – ganz ohne Playback. Pro Abend werden zwei Geschichten gespielt: 'Das blaue Kreuz' und 'Die fallenden Brüder'. Die Gesamtdauer beträgt ca. 2 Stunden inkl. 15 Minuten Pause.",
  },
  {
    question: "Wer spielt Pater Brown im Live-Hörspiel?",
    answer:
      "Antoine Monot spielt die Titelrolle des Pater Brown. Er ist bekannt als Rechtsanwalt Benni Hornberg in der ZDF-Serie 'Ein Fall für zwei' und als 'Tech-Nick' in den Saturn-Werbespots. Wanja Mues übernimmt die Rollen von Flambeau und Erzähler – ebenfalls bekannt aus 'Ein Fall für zwei' als Leo Oswald. Marvelin, CEO von Beatbox Germany und Mitglied der Razzzones (Deutsche Meister 2022, WM Bronze 2023), verantwortet das gesamte Live-Sound-Design.",
  },
  {
    question: "Wo findet das Pater Brown Live-Hörspiel statt?",
    answer:
      "Die Tour 2026/2027 gastiert in elf deutschen und schweizerischen Städten: München (Alte Kongresshalle, 05.09.2026), Hamburg (Friedrich-Ebert-Halle, 23.10.2026), Zürich (Volkshaus Weisser Saal, 16.12.2026), Baunatal (Stadthalle, 20.01.2027), Gießen (Kongresshalle, 21.01.2027), Stuttgart (Theaterhaus am Pragsattel, 17.11.2027), Köln (Volksbühne am Rudolfplatz, 16.11.2027), Kempten (Kornhaus, 02.12.2027), Erding (Stadthalle, 03.12.2027), Leipzig (Kupfersaal, 21.12.2027) und Berlin (DIE WÜHLMÄUSE, 22.12.2027).",
  },
  {
    question: "Was kosten Tickets für das Pater Brown Live-Hörspiel?",
    answer:
      "Tickets sind ab 34,90 € erhältlich (Zürich ab CHF 45). Tickets für Deutschland und Österreich gibt es auf Eventim, Tickets für die Schweiz bei Ticketcorner. Eine Übersicht aller Termine und Preiskategorien finden Sie unter paterbrown.com/termine.",
  },
  {
    question: "Was unterscheidet das Pater Brown Live-Hörspiel von einem normalen Theaterbesuch?",
    answer:
      "Das Pater Brown Live-Hörspiel verbindet die Intimität eines Hörspiels mit dem Erlebnis eines Live-Auftritts. Zwei Schauspieler übernehmen sämtliche Rollen – ohne Kostümwechsel, ohne Bühnenbild. Die gesamte Klang- und Geräuschkulisse, von der knarzenden Tür bis zur Kirchenglocke, erzeugt Beatboxer Marvelin ausschließlich mit Loop-Station und Stimme. Das Ergebnis ist ein cineastisches Klangerlebnis live vor Publikum.",
  },
  {
    question: "Auf welchen Geschichten basiert das Live-Hörspiel?",
    answer:
      "Das Live-Hörspiel basiert auf den Kriminalgeschichten von G.K. Chesterton (1874–1936), dem britischen Schriftsteller und Erfinder der Figur Pater Brown. Gespielt werden zwei Fälle pro Abend: 'Das blaue Kreuz' (aus 'The Innocence of Father Brown', 1911) und 'Die fallenden Brüder'. Chesterton veröffentlichte zwischen 1911 und 1935 insgesamt 49 Kurzgeschichten mit Pater Brown.",
  },
  {
    question: "Für wen ist das Pater Brown Live-Hörspiel geeignet?",
    answer:
      "Das Live-Hörspiel ist für Krimi-Fans, Hörspiel-Liebhaber, Theaterbesucher und alle geeignet, die ein besonderes Live-Erlebnis suchen. Fans der ZDF-Serie 'Ein Fall für zwei' erleben Antoine Monot und Wanja Mues in einem völlig neuen Format. Empfohlen ab ca. 12 Jahren. Die Veranstaltung ist für Erwachsene und Familien gleichsam geeignet.",
  },
  {
    question: "Wer produziert das Pater Brown Live-Hörspiel?",
    answer:
      "Das Pater Brown Live-Hörspiel ist eine Produktion der Dream & Anchor Handelsgesellschaft mbH aus München. Die künstlerische Leitung hat Stefanie Sick inne, die als Creative Producerin das Projekt verantwortet. Antoine Monot ist neben seiner Rolle als Schauspieler auch Co-Produzent des Projekts.",
  },
];

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
    <div className="min-h-screen bg-background overflow-x-hidden pb-14 md:pb-0">
      <SEO 
        title={`Pater Brown Live-Hörspiel | Tickets & Termine ${seoYear}`}
        description="Pater Brown als Live-Hörspiel: Antoine Monot & Wanja Mues auf Tournee 2026/27. Live-Beatboxing, zwei Krimifälle, ein Abend. Jetzt Tickets sichern!"
        keywords="Pater Brown, Live-Hörspiel, Wanja Mues, Antoine Monot, Ein Fall für Zwei, Marvelin, Theater, Krimi, G.K. Chesterton"
        canonical="/"
        ogTitle="Pater Brown – Das Live-Hörspiel"
        ogDescription="Mit Wanja Mues und Antoine Monot. Jetzt Tickets sichern!"
        ogImage="/images/og/pater-brown-live-hoerspiel-tour-og.webp"
      />
      <FAQStructuredData />
      <SkipLink />

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

        {/* FAQ-Sektion für GEO-Tauglichkeit und Rich Results */}
        <section className="py-24 px-6" aria-labelledby="faq-heading">
          <div className="container mx-auto max-w-4xl">
            <FAQSection
              items={HOME_FAQ_ITEMS}
              label="Häufige Fragen"
              title="Alles über Pater Brown – Das Live-Hörspiel"
            />
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
      
      <StickyMobileCTA />
    </div>
  );
};

export default Index;
