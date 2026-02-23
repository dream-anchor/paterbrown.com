import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";
import Section from "@/components/ui/Section";
import SerifText from "@/components/ui/SerifText";
import GhostButton from "@/components/ui/GhostButton";
import antoineHeaderBg from "@/assets/antoine-header-bg.png";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const BREADCRUMBS = [
  { label: "Startseite", href: "/" },
  { label: "Antoine Monot" },
];

const AntoineMonot = () => {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Antoine Monot",
    url: "https://paterbrown.com/antoine-monot",
    image: "https://paterbrown.com/images/portraits/antoine-monot-portrait-pater-brown-gl-1200.webp",
    jobTitle: "Schauspieler, Drehbuchautor, Produzent",
    description: "Antoine Monot ist Schauspieler, Drehbuchautor und Co-Produzent des Pater Brown Live-H\u00F6rspiels. Bekannt als Benni Hornberg in Ein Fall f\u00FCr zwei (ZDF).",
    performerIn: {
      "@type": "TheaterEvent",
      name: "Pater Brown \u2013 Das Live-H\u00F6rspiel",
      url: "https://paterbrown.com/live-hoerspiel",
    },
    sameAs: [],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: "https://paterbrown.com" },
      { "@type": "ListItem", position: 2, name: "Antoine Monot", item: "https://paterbrown.com/antoine-monot" },
    ],
  };

  return (
    <LandingLayout
      breadcrumbs={BREADCRUMBS}
      heroImage={antoineHeaderBg}
      heroTitle="Antoine Monot"
      heroSubtitle="Schauspieler, Drehbuchautor, Produzent"
    >
      <SEO
        title={`Antoine Monot & Pater Brown \u2013 Der Star aus \u201EEin Fall f\u00FCr zwei\u201C | paterbrown.com`}
        description={`Antoine Monot bringt Pater Brown als Live-H\u00F6rspiel auf die B\u00FChne. Bekannt als Anwalt Benni Hornberg in \u201EEin Fall f\u00FCr zwei\u201C und Tech-Nick bei Saturn.`}
        canonical="/antoine-monot"
        keywords="pater brown antoine monot, antoine monot pater brown, antoine monot, antoine monot wanja mues, monot schauspieler"
        ogImage="/images/og/antoine-monot-schauspieler-og.webp"
        schema={[personSchema, breadcrumbSchema]}
      />

      {/* Biografie */}
      <Section container="wide" className="py-20 md:py-32">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
          <div className="card-glow rounded-[3px] overflow-hidden">
            <img
              src="/images/portraits/antoine-monot-portrait-pater-brown-gl.webp"
              srcSet="/images/portraits/antoine-monot-portrait-pater-brown-gl-480.webp 480w, /images/portraits/antoine-monot-portrait-pater-brown-gl-768.webp 768w, /images/portraits/antoine-monot-portrait-pater-brown-gl-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 55vw"
              alt="Antoine Monot – Schauspieler und Co-Produzent des Pater Brown Live-Hörspiels"
              className="w-full aspect-[3/4] object-cover object-top"
              loading="eager"
            />
          </div>
          <div>
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Biografie</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
              Der Schauspieler
            </h2>
            <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Antoine Monot ist Schauspieler, Drehbuchautor und Produzent. Einem breiten
              Publikum wurde er als Rechtsanwalt Benni Hornberg in der ZDF-Serie
              „Ein Fall für zwei" bekannt, in der er seit 2014 an der Seite von{" "}
              <Link to="/wanja-mues" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Wanja Mues
              </Link>
              {" "}vor der Kamera steht.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Große Bekanntheit erlangte er auch als „Tech-Nick" in den Saturn-Werbespots
              (2013–2017) – einer der ikonischsten deutschen Werbekampagnen der 2010er Jahre.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70">
              Neben seiner Schauspielkarriere ist Monot ein vielseitiger Künstler:
              Er schreibt Drehbücher, führt Regie und programmiert seit 1996.
            </SerifText>
          </div>
        </div>
      </Section>

      {/* Karriere */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Karriere</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Film &amp; Fernsehen
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />

        <div className="space-y-4 mb-8">
          <div className="card-glow rounded-[3px] p-5 border-primary/40 bg-primary/5">
            <p className="font-heading text-foreground text-lg">„Ein Fall für zwei"</p>
            <p className="text-primary text-sm font-heading mt-1">ZDF – seit 2014</p>
            <p className="text-foreground/50 text-sm font-serif mt-2">
              Als Rechtsanwalt Benni Hornberg an der Seite von Wanja Mues (Leo Oswald)
            </p>
          </div>
          <div className="card-glow rounded-[3px] p-5">
            <p className="font-heading text-foreground text-lg">Saturn „Tech-Nick"</p>
            <p className="text-primary text-sm font-heading mt-1">2013–2017</p>
            <p className="text-foreground/50 text-sm font-serif mt-2">
              Eine der bekanntesten deutschen Werbekampagnen der 2010er Jahre
            </p>
          </div>
          <div className="card-glow rounded-[3px] p-5">
            <p className="font-heading text-foreground text-lg">Behringer und die Toten</p>
            <p className="text-primary text-sm font-heading mt-1">RTL</p>
            <p className="text-foreground/50 text-sm font-serif mt-2">
              Als unkonventioneller Kommissar Behringer
            </p>
          </div>
        </div>

        <SerifText size="lg" className="text-foreground/70">
          Weitere Film- und TV-Rollen sowie Drehbucharbeiten ergänzen sein vielseitiges
          Portfolio.
        </SerifText>
      </Section>

      {/* Bühnenfoto */}
      <Section container="wide" className="py-20 md:py-32">
        <div className="card-glow rounded-[3px] overflow-hidden">
          <img
            src="/images/buehne/pater-brown-antoine-monot-buehne-solo-af.webp"
            srcSet="/images/buehne/pater-brown-antoine-monot-buehne-solo-af-480.webp 480w, /images/buehne/pater-brown-antoine-monot-buehne-solo-af-768.webp 768w, /images/buehne/pater-brown-antoine-monot-buehne-solo-af-1200.webp 1200w"
            sizes="(max-width: 768px) 100vw, 80vw"
            alt="Antoine Monot auf der Bühne im Pater Brown Live-Hörspiel"
            className="w-full aspect-[21/9] object-cover"
            loading="lazy"
          />
        </div>
      </Section>

      {/* Antoine Monot & Pater Brown */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Das Projekt</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Antoine Monot &amp; Pater Brown
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Antoine Monot ist nicht nur Sprecher im{" "}
          <Link to="/live-hoerspiel" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
            Pater Brown Live-Hörspiel
          </Link>
          {" "}– er ist Co-Produzent und eine der treibenden Kräfte hinter dem Projekt.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Die Idee: Die zeitlosen Kriminalgeschichten von{" "}
          <Link to="/pater-brown" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
            G.K. Chestertons Pater Brown
          </Link>
          {" "}nicht einfach vorlesen, sondern als immersives Bühnenerlebnis inszenieren –
          mit Live-Sounddesign von{" "}
          <Link to="/marvelin" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
            Beatboxer Marvelin
          </Link>
          , der alle Geräusche nur mit dem Mund erzeugt.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Gemeinsam mit{" "}
          <Link to="/stefanie-sick" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
            Stefanie Sick
          </Link>
          {" "}(Künstlerische Leitung) und der Dream &amp; Anchor Handelsgesellschaft mbH
          produziert Monot die Tournee, die durch Deutschlands große Bühnen tourt.
        </SerifText>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <GhostButton href={EVENTIM_AFFILIATE_URL}>Tickets sichern</GhostButton>
          <GhostButton to="/termine" className="bg-transparent">Alle Termine</GhostButton>
        </div>
      </Section>
    </LandingLayout>
  );
};

export default AntoineMonot;
