import HeroSection from "@/components/HeroSection";
import CastSection from "@/components/CastSection";
import ShowConceptSection from "@/components/ShowConceptSection";
import ProjectConceptSection from "@/components/ProjectConceptSection";
import TourDatesSection from "@/components/TourDatesSection";
import TeamSection from "@/components/TeamSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import SkipLink from "@/components/SkipLink";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      
      <h1 className="sr-only">Pater Brown - Das Live-Hörspiel mit Wanja Mues und Antoine Monot</h1>
      
      <HeroSection />
      
      <main id="main-content" tabIndex={-1}>
        <CastSection />
        <ShowConceptSection />
        <ProjectConceptSection />
        <TourDatesSection />
        
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

        <TeamSection />
        <NewsletterSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
