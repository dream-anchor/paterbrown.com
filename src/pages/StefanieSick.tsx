import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";
import CinematicPortrait from "@/components/CinematicPortrait";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import TicketCTA from "@/components/shared/TicketCTA";

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
    jobTitle: "Künstlerische Leitung",
    description: "Stefanie Sick verantwortet die künstlerische Leitung des Pater Brown Live-Hörspiels.",
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
      heroImage="/images/buehne/af-duo-marvelin-nahaufnahme.webp"
      heroTitle="Stefanie Sick"
      heroSubtitle="Künstlerische Leitung & Produktion"
      heroCTA
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
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
            <CinematicPortrait
              src="/images/portraits/stefanie-sick-kuenstlerische-leitung-pb.webp"
              srcSet="/images/portraits/stefanie-sick-kuenstlerische-leitung-pb-480.webp 480w, /images/portraits/stefanie-sick-kuenstlerische-leitung-pb-768.webp 768w, /images/portraits/stefanie-sick-kuenstlerische-leitung-pb-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 55vw"
              alt="Stefanie Sick – Künstlerische Leitung des Pater Brown Live-Hörspiels"
              loading="eager"
              fadeEdges
            />
            <div>
              <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Künstlerische Leitung</p>
              <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
                Stefanie Sick
              </h2>
              <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
              <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
                Als Creative Producerin verantwortet Stefanie Sick die künstlerische
                Leitung, Gesamtkonzeption und Kommunikationsstrategie von{" "}
                <Link to="/live-hoerspiel" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  „Pater Brown – Das Live-Hörspiel"
                </Link>.
              </p>
              <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
                Mit ihrer Expertise in den Bereichen Produktion und Öffentlichkeitsarbeit
                führt sie kreative, organisatorische und mediale Prozesse zusammen –
                von der ersten Idee bis zum publikumswirksamen Bühnenerlebnis.
              </p>
              <p className="text-foreground/70 leading-relaxed text-lg font-light">
                Das Ergebnis: Klassische Krimispannung aus den Geschichten von{" "}
                <Link to="/pater-brown" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  Pater Brown
                </Link>
                , verbunden mit moderner Performance-Kunst.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TicketCTA variant="personal" />

      {/* Werdegang */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Werdegang</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
            Von der Idee zur Bühne
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Stefanie Sick verbindet strategisches Denken mit künstlerischem Gespür.
            Ihre Erfahrung in Projektmanagement, Öffentlichkeitsarbeit und kreativem Producing
            macht sie zur Schlüsselfigur hinter dem{" "}
            <Link to="/live-hoerspiel" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Pater Brown Live-Hörspiel
            </Link>.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Vom Aufbau der Marke über die Inszenierung bis zur Kommunikation mit
            Veranstaltern, Presse und Ticketpartnern: Stefanie Sick führt alle Fäden
            zusammen. Jede Tour-Station wird unter ihrer Leitung geplant, von der
            Spielstätten-Akquise bis zum reibungslosen Showabend.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Dabei geht es ihr nicht nur um Logistik, sondern um Qualität: Die Show soll
            an jedem Abend und in jeder Stadt auf höchstem Niveau funktionieren –
            für ein Publikum, das die Geschichten von{" "}
            <Link to="/g-k-chesterton" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              G.K. Chesterton
            </Link>
            {" "}verdient.
          </p>
        </div>
      </section>

      <TicketCTA variant="emotional" />

      {/* Vision */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Die Vision</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
            Hinter der Show
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Stefanie Sick sorgt dafür, dass aus einer Idee ein Gesamterlebnis wird.
            Sie koordiniert die Zusammenarbeit zwischen den Darstellern{" "}
            <Link to="/antoine-monot" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Antoine Monot
            </Link>
            ,{" "}
            <Link to="/wanja-mues" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Wanja Mues
            </Link>
            {" "}und{" "}
            <Link to="/marvelin" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Marvelin
            </Link>
            , verantwortet die Inszenierung und steuert die Kommunikation –
            von der Pressearbeit bis zum Ticketverkauf.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Ihr Anspruch: Jeder Besucher soll das Theater mit dem Gefühl verlassen,
            etwas Besonderes erlebt zu haben – nicht einfach eine Lesung, sondern
            ein immersives Krimi-Erlebnis, bei dem die Grenze zwischen Bühne und
            Zuschauerraum verschwimmt.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Als Mitgesellschafterin der Dream &amp; Anchor Handelsgesellschaft mbH
            bringt sie unternehmerisches Denken und kreative Vision zusammen.
          </p>
        </div>
      </section>

      {/* Zusammenarbeit */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Das Team</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
            Ein Ensemble, ein Ziel
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Das Pater Brown Live-Hörspiel lebt von der Chemie zwischen den
            Künstlern.{" "}
            <Link to="/antoine-monot" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Antoine Monot
            </Link>
            {" "}und{" "}
            <Link to="/wanja-mues" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Wanja Mues
            </Link>
            , die seit 2014 gemeinsam in „Ein Fall für zwei" vor der Kamera stehen,
            bringen eine eingespieltes Zusammenspiel auf die Bühne.{" "}
            <Link to="/marvelin" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Beatboxer Marvelin
            </Link>
            {" "}ergänzt das Duo mit einer Klangwelt, die jede Szene lebendig macht.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Stefanie Sick gibt diesem Zusammenspiel den Rahmen: Sie entwickelt das
            dramaturgische Konzept, steuert Proben und Abläufe und stellt sicher,
            dass der einzigartige Charakter der Show – Spannung, Humor und
            Gänsehaut-Momente – an jedem Spielort zur Geltung kommt.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer"><button className="btn-premium" type="button">Tickets sichern</button></a>
            <Link to="/termine" className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block">Alle Termine</Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default StefanieSick;
