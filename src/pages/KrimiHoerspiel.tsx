import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";
import Section from "@/components/ui/Section";
import SerifText from "@/components/ui/SerifText";
import GhostButton from "@/components/ui/GhostButton";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const BREADCRUMBS = [
  { label: "Startseite", href: "/" },
  { label: "Krimi-Hörspiel" },
];

const SERIES = [
  {
    title: "Die drei ???",
    desc: "Der H\u00F6rspiel-Klassiker schlechthin \u2013 seit 1979, \u00FCber 200 Folgen. Justus Jonas, Peter Shaw und Bob Andrews l\u00F6sen F\u00E4lle in Rocky Beach.",
  },
  {
    title: "Sherlock Holmes (Maritim)",
    desc: "Christian Rode und Peter Groeger als Holmes und Watson \u2013 die legend\u00E4re deutsche H\u00F6rspielfassung der Conan-Doyle-Geschichten.",
  },
  {
    title: "Pater Brown (Maritim)",
    desc: "Volker Brandt als Pater Brown \u2013 48+ Folgen nach G.K. Chesterton. Ruhig, atmosph\u00E4risch, psychologisch tiefgr\u00FCndig.",
    highlight: true,
  },
  {
    title: "TKKG",
    desc: "Tim, Karl, Klößchen und Gaby ermitteln seit 1981 in Jugendkrimis \u2013 mehr Action, weniger Psychologie.",
  },
  {
    title: "Die gr\u00F6\u00DFten F\u00E4lle von Scotland Yard",
    desc: "Spannende Kriminalgeschichten aus der Perspektive der Londoner Polizei.",
  },
  {
    title: "Gruselkabinett",
    desc: "Klassische Horror- und Mysteryliteratur als H\u00F6rspiel \u2013 von Edgar Allan Poe bis H.P. Lovecraft.",
  },
];

const QUALITIES = [
  { label: "Story", text: "Spannende Handlung mit \u00FCberraschender Aufl\u00F6sung" },
  { label: "Sound", text: "Atmosph\u00E4rische Ger\u00E4uschkulisse, die das Kopfkino anregt" },
  { label: "Stimmen", text: "\u00DCberzeugende Sprecher, die Figuren zum Leben erwecken" },
  { label: "Tempo", text: "Die richtige Balance zwischen Spannung und Ruhe" },
  { label: "Musik", text: "Soundtrack, der Stimmung erzeugt und verst\u00E4rkt" },
];

const KrimiHoerspiel = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Die besten Krimi-H\u00F6rspiele \u2013 Von Sherlock Holmes bis Pater Brown",
    url: "https://paterbrown.com/krimi-hoerspiel",
    image: "https://paterbrown.com/images/og/krimi-hoerspiel-live-buehne-og.webp",
    author: { "@type": "Organization", name: "paterbrown.com" },
    publisher: { "@type": "Organization", name: "Dream & Anchor Handelsgesellschaft mbH" },
    description: "Entdecke die Welt der Krimi-H\u00F6rspiele: Von den drei ??? \u00FCber Sherlock Holmes bis Pater Brown.",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: "https://paterbrown.com" },
      { "@type": "ListItem", position: 2, name: "Krimi-H\u00F6rspiel", item: "https://paterbrown.com/krimi-hoerspiel" },
    ],
  };

  return (
    <LandingLayout
      breadcrumbs={BREADCRUMBS}
      heroTitle="Krimi-Hörspiel"
      heroSubtitle="Die besten Serien – und wie man Krimi live erlebt"
    >
      <SEO
        title={`Die besten Krimi-H\u00F6rspiele \u2013 Von Sherlock Holmes bis Pater Brown | paterbrown.com`}
        description={`Entdecke die Welt der Krimi-H\u00F6rspiele: Von den drei ??? \u00FCber Sherlock Holmes bis Pater Brown. Plus: Pater Brown jetzt als Live-H\u00F6rspiel erleben!`}
        canonical="/krimi-hoerspiel"
        keywords="krimi hörspiel, detektiv hörspiel, hörspiel detektiv, hörspiele detektive, klassische hörspiele, tolle hörspiele"
        ogImage="/images/og/krimi-hoerspiel-live-buehne-og.webp"
        schema={[articleSchema, breadcrumbSchema]}
      />

      {/* Warum Krimi-Hörspiele */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Kopfkino</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Warum Krimi-Hörspiele so beliebt sind
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Kopfkino: Das Gehirn erzeugt die spannendsten Bilder selbst.
          Kein Film kann so gruselig sein wie die eigene Vorstellungskraft,
          wenn man eine knarrende Tür hört und nicht weiß, wer dahinter steht.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Krimi-Hörspiele sind perfekt für unterwegs, beim Einschlafen, auf
          langen Autofahrten. Deutschland ist Hörspielland Nr. 1 – nirgendwo
          sonst auf der Welt gibt es eine vergleichbare Tradition und Vielfalt.
        </SerifText>
      </Section>

      {/* Die großen Serien */}
      <Section container="wide" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Klassiker</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Die großen Krimi-Serien
        </h2>
        <div className="divider-gold mb-12 max-w-xs" aria-hidden="true" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERIES.map((series) => (
            <div
              key={series.title}
              className={`card-glow rounded-[3px] p-5 ${
                series.highlight ? "border-primary/40 bg-primary/5" : ""
              }`}
            >
              <p className="font-heading text-foreground text-lg">{series.title}</p>
              {series.highlight && (
                <Link
                  to="/hoerspiel"
                  className="text-primary text-sm font-heading hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                >
                  Mehr erfahren →
                </Link>
              )}
              <p className="text-foreground/50 text-sm font-serif mt-2">{series.desc}</p>
            </div>
          ))}
        </div>
        <SerifText size="base" className="text-foreground/50 mt-6">
          Pater Brown ist eine von vielen großen Krimi-Hörspiel-Serien – aber einzigartig
          durch die psychologische Tiefe. Nicht Logik löst die Fälle, sondern Empathie.
          Mehr zur Figur:{" "}
          <Link to="/pater-brown" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
            Wer ist Pater Brown?
          </Link>
        </SerifText>
      </Section>

      {/* Was macht ein gutes Krimi-Hörspiel aus */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Qualität</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Was macht ein gutes Krimi-Hörspiel aus?
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
        <div className="space-y-3">
          {QUALITIES.map((q) => (
            <div key={q.label} className="flex items-start gap-4 px-5 py-4 border border-border/30 rounded-[3px] bg-card/20">
              <span className="text-primary font-heading text-sm uppercase tracking-[0.1em] min-w-[80px]">
                {q.label}
              </span>
              <span className="text-foreground/70 font-serif">{q.text}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Live erleben */}
      <Section container="wide" className="py-20 md:py-32">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
          <div className="card-glow rounded-[3px] overflow-hidden">
            <img
              src="/images/buehne/pater-brown-buehne-ensemble-marvelin-af.webp"
              srcSet="/images/buehne/pater-brown-buehne-ensemble-marvelin-af-480.webp 480w, /images/buehne/pater-brown-buehne-ensemble-marvelin-af-768.webp 768w, /images/buehne/pater-brown-buehne-ensemble-marvelin-af-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 55vw"
              alt="Pater Brown Live-Hörspiel – Krimi live auf der Bühne erleben"
              className="w-full aspect-[16/10] object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Live</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
              Krimi live erleben
            </h2>
            <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Was wäre, wenn man alle fünf Qualitäten eines guten Krimi-Hörspiels
              nicht nur hört, sondern live miterlebt? Das{" "}
              <Link to="/live-hoerspiel" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Pater Brown Live-Hörspiel
              </Link>
              {" "}vereint alles auf der Bühne.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Professionelle Schauspieler{" "}
              <Link to="/antoine-monot" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Antoine Monot
              </Link>
              {" "}&amp;{" "}
              <Link to="/wanja-mues" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Wanja Mues
              </Link>
              {" "}sprechen die Rollen live.{" "}
              <Link to="/marvelin" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Beatboxer Marvelin
              </Link>
              {" "}erzeugt alle Geräusche nur mit dem Mund.
              Das Ergebnis: Krimi-Spannung, die unter die Haut geht.
            </SerifText>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <GhostButton href={EVENTIM_AFFILIATE_URL}>Tickets sichern</GhostButton>
              <GhostButton to="/termine" className="bg-transparent">Alle Termine</GhostButton>
            </div>
          </div>
        </div>
      </Section>
    </LandingLayout>
  );
};

export default KrimiHoerspiel;
