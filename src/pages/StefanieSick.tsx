import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";
import Section from "@/components/ui/Section";
import SerifText from "@/components/ui/SerifText";
import GhostButton from "@/components/ui/GhostButton";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const BREADCRUMBS = [
  { label: "Startseite", href: "/" },
  { label: "Stefanie Sick" },
];

const StefanieSick = () => {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Stefanie Sick",
    url: "https://paterbrown.com/stefanie-sick",
    image: "https://paterbrown.com/images/portraits/stefanie-sick-kuenstlerische-leitung-pb-1200.webp",
    jobTitle: "K\u00FCnstlerische Leitung",
    description: "Stefanie Sick verantwortet die k\u00FCnstlerische Leitung des Pater Brown Live-H\u00F6rspiels.",
    worksFor: {
      "@type": "Organization",
      name: "Dream & Anchor Handelsgesellschaft mbH",
    },
    sameAs: [],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: "https://paterbrown.com" },
      { "@type": "ListItem", position: 2, name: "Stefanie Sick", item: "https://paterbrown.com/stefanie-sick" },
    ],
  };

  return (
    <LandingLayout
      breadcrumbs={BREADCRUMBS}
      heroTitle="Stefanie Sick"
      heroSubtitle="Künstlerische Leitung & Produktion"
    >
      <SEO
        title="Stefanie Sick – Künstlerische Leitung Pater Brown Live-Hörspiel | paterbrown.com"
        description="Stefanie Sick verantwortet die künstlerische Leitung des Pater Brown Live-Hörspiels. Erfahren Sie mehr über die kreative Kraft hinter der Show."
        canonical="/stefanie-sick"
        keywords="pater brown stefanie sick, stefanie sick"
        ogImage="/images/og/stefanie-sick-produzentin-og.webp"
        schema={[personSchema, breadcrumbSchema]}
      />

      {/* Biografie */}
      <Section container="wide" className="py-20 md:py-32">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
          <div className="card-glow rounded-[3px] overflow-hidden">
            <img
              src="/images/portraits/stefanie-sick-kuenstlerische-leitung-pb.webp"
              srcSet="/images/portraits/stefanie-sick-kuenstlerische-leitung-pb-480.webp 480w, /images/portraits/stefanie-sick-kuenstlerische-leitung-pb-768.webp 768w, /images/portraits/stefanie-sick-kuenstlerische-leitung-pb-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 55vw"
              alt="Stefanie Sick – Künstlerische Leitung des Pater Brown Live-Hörspiels"
              className="w-full aspect-[3/4] object-cover object-top"
              loading="eager"
            />
          </div>
          <div>
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Künstlerische Leitung</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
              Stefanie Sick
            </h2>
            <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Als Creative Producerin verantwortet Stefanie Sick die künstlerische
              Leitung, Gesamtkonzeption und Kommunikationsstrategie von{" "}
              <Link to="/live-hoerspiel" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                „Pater Brown – Das Live-Hörspiel"
              </Link>.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Mit ihrer Expertise in den Bereichen Produktion und Öffentlichkeitsarbeit
              führt sie kreative, organisatorische und mediale Prozesse zusammen –
              von der ersten Idee bis zum publikumswirksamen Bühnenerlebnis.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70">
              Das Ergebnis: Klassische Krimispannung aus den Geschichten von{" "}
              <Link to="/pater-brown" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Pater Brown
              </Link>
              , verbunden mit moderner Performance-Kunst.
            </SerifText>
          </div>
        </div>
      </Section>

      {/* Vision */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Die Vision</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Hinter der Show
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Stefanie Sick sorgt dafür, dass aus einer Idee ein Gesamterlebnis wird.
          Sie koordiniert die Zusammenarbeit zwischen den Darstellern{" "}
          <Link to="/antoine-monot" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
            Antoine Monot
          </Link>
          ,{" "}
          <Link to="/wanja-mues" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
            Wanja Mues
          </Link>
          {" "}und{" "}
          <Link to="/marvelin" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
            Marvelin
          </Link>
          , verantwortet die Inszenierung und steuert die Kommunikation –
          von der Pressearbeit bis zum Ticketverkauf.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Als Mitgesellschafterin der Dream &amp; Anchor Handelsgesellschaft mbH
          bringt sie unternehmerisches Denken und kreative Vision zusammen.
        </SerifText>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <GhostButton href={EVENTIM_AFFILIATE_URL}>Tickets sichern</GhostButton>
          <GhostButton to="/termine" className="bg-transparent">Alle Termine</GhostButton>
        </div>
      </Section>
    </LandingLayout>
  );
};

export default StefanieSick;
