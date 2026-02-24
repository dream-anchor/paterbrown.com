import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";
import CinematicPortrait from "@/components/CinematicPortrait";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import TicketCTA from "@/components/shared/TicketCTA";

const BREADCRUMBS = [
  { label: "Startseite", href: "/" },
  { label: "Krimi-Hörspiel" },
];

const SERIES = [
  {
    title: "Die drei ???",
    desc: "Der Hörspiel-Klassiker schlechthin – seit 1979, über 200 Folgen. Justus Jonas, Peter Shaw und Bob Andrews lösen Fälle in Rocky Beach.",
  },
  {
    title: "Sherlock Holmes (Maritim)",
    desc: "Christian Rode und Peter Groeger als Holmes und Watson – die legendäre deutsche Hörspielfassung der Conan-Doyle-Geschichten.",
  },
  {
    title: "Pater Brown (Maritim)",
    desc: "Volker Brandt als Pater Brown – 48+ Folgen nach G.K. Chesterton. Ruhig, atmosphärisch, psychologisch tiefgründig.",
    highlight: true,
  },
  {
    title: "TKKG",
    desc: "Tim, Karl, Klößchen und Gaby ermitteln seit 1981 in Jugendkrimis – mehr Action, weniger Psychologie.",
  },
  {
    title: "Die größten Fälle von Scotland Yard",
    desc: "Spannende Kriminalgeschichten aus der Perspektive der Londoner Polizei.",
  },
  {
    title: "Gruselkabinett",
    desc: "Klassische Horror- und Mysteryliteratur als Hörspiel – von Edgar Allan Poe bis H.P. Lovecraft.",
  },
];

const QUALITIES = [
  { label: "Story", text: "Spannende Handlung mit überraschender Auflösung" },
  { label: "Sound", text: "Atmosphärische Geräuschkulisse, die das Kopfkino anregt" },
  { label: "Stimmen", text: "Überzeugende Sprecher, die Figuren zum Leben erwecken" },
  { label: "Tempo", text: "Die richtige Balance zwischen Spannung und Ruhe" },
  { label: "Musik", text: "Soundtrack, der Stimmung erzeugt und verstärkt" },
];

const KrimiHoerspiel = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Die besten Krimi-Hörspiele – Von Sherlock Holmes bis Pater Brown",
    url: "https://paterbrown.com/krimi-hoerspiel",
    image: "https://paterbrown.com/images/og/krimi-hoerspiel-live-buehne-og.webp",
    author: { "@type": "Organization", name: "paterbrown.com" },
    publisher: { "@type": "Organization", name: "Dream & Anchor Handelsgesellschaft mbH" },
    description: "Entdecke die Welt der Krimi-Hörspiele: Von den drei ??? über Sherlock Holmes bis Pater Brown.",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: "https://paterbrown.com" },
      { "@type": "ListItem", position: 2, name: "Krimi-Hörspiel", item: "https://paterbrown.com/krimi-hoerspiel" },
    ],
  };

  return (
    <LandingLayout
      breadcrumbs={BREADCRUMBS}
      heroImage="/images/buehne/dd-dialog-intensiv-closeup.webp"
      heroTitle="Krimi-Hörspiel"
      heroSubtitle="Die besten Serien – und wie man Krimi live erlebt"
      heroCTA
    >
      <SEO
        title={`Die besten Krimi-Hörspiele – Von Sherlock Holmes bis Pater Brown | paterbrown.com`}
        description={`Entdecke die Welt der Krimi-Hörspiele: Von den drei ??? über Sherlock Holmes bis Pater Brown. Plus: Pater Brown jetzt als Live-Hörspiel erleben!`}
        canonical="/krimi-hoerspiel"
        keywords="krimi hörspiel, detektiv hörspiel, hörspiel detektiv, hörspiele detektive, klassische hörspiele, tolle hörspiele"
        ogImage="/images/og/krimi-hoerspiel-live-buehne-og.webp"
        schema={[articleSchema, breadcrumbSchema]}
      />

      {/* Warum Krimi-Hörspiele */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Kopfkino</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Warum Krimi-Hörspiele so beliebt sind
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
        <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
          Kopfkino: Das Gehirn erzeugt die spannendsten Bilder selbst.
          Kein Film kann so gruselig sein wie die eigene Vorstellungskraft,
          wenn man eine knarrende Tür hört und nicht weiß, wer dahinter steht.
        </p>
        <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
          Krimi-Hörspiele sind perfekt für unterwegs, beim Einschlafen, auf
          langen Autofahrten. Deutschland ist Hörspielland Nr. 1 – nirgendwo
          sonst auf der Welt gibt es eine vergleichbare Tradition und Vielfalt.
        </p>
      </div></section>

      <TicketCTA variant="emotional" />

      {/* Die großen Serien */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-6xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Klassiker</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Die großen Krimi-Serien
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-12" aria-hidden="true" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERIES.map((series) => (
            <div
              key={series.title}
              className={`border border-foreground/10 bg-card/10 p-5 ${
                series.highlight ? "border-gold/40 bg-gold/5" : ""
              }`}
            >
              <p className="font-heading text-foreground text-lg">{series.title}</p>
              {series.highlight && (
                <Link
                  to="/hoerspiel"
                  className="text-gold text-sm font-heading hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
                >
                  Mehr erfahren →
                </Link>
              )}
              <p className="text-foreground/50 text-sm mt-2">{series.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-foreground/50 leading-relaxed text-base mt-6">
          Pater Brown ist eine von vielen großen Krimi-Hörspiel-Serien – aber einzigartig
          durch die psychologische Tiefe. Nicht Logik löst die Fälle, sondern Empathie.
          Mehr zur Figur:{" "}
          <Link to="/pater-brown" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
            Wer ist Pater Brown?
          </Link>
        </p>
      </div></section>

      {/* Was macht ein gutes Krimi-Hörspiel aus */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Qualität</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Was macht ein gutes Krimi-Hörspiel aus?
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
        <div className="space-y-3">
          {QUALITIES.map((q) => (
            <div key={q.label} className="flex items-start gap-4 px-5 py-4 border border-foreground/10 bg-card/10">
              <span className="text-gold font-heading text-sm uppercase tracking-[0.1em] min-w-[80px]">
                {q.label}
              </span>
              <span className="text-foreground/70">{q.text}</span>
            </div>
          ))}
        </div>
      </div></section>

      <TicketCTA variant="concrete" />

      {/* Live erleben */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
          <CinematicPortrait
            src="/images/buehne/pater-brown-buehne-ensemble-marvelin-af.webp"
            srcSet="/images/buehne/pater-brown-buehne-ensemble-marvelin-af-480.webp 480w, /images/buehne/pater-brown-buehne-ensemble-marvelin-af-768.webp 768w, /images/buehne/pater-brown-buehne-ensemble-marvelin-af-1200.webp 1200w"
            sizes="(max-width: 768px) 100vw, 55vw"
            alt="Pater Brown Live-Hörspiel – Krimi live auf der Bühne erleben"
            aspectRatio="aspect-[16/10]"
            objectPosition="50% 50%"
            className="border border-foreground/10"
          />
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Live</p>
            <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
              Krimi live erleben
            </h2>
            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
            <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
              Was wäre, wenn man alle fünf Qualitäten eines guten Krimi-Hörspiels
              nicht nur hört, sondern live miterlebt? Das{" "}
              <Link to="/live-hoerspiel" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Pater Brown Live-Hörspiel
              </Link>
              {" "}vereint alles auf der Bühne.
            </p>
            <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
              Professionelle Schauspieler{" "}
              <Link to="/antoine-monot" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Antoine Monot
              </Link>
              {" "}&amp;{" "}
              <Link to="/wanja-mues" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Wanja Mues
              </Link>
              {" "}sprechen die Rollen live.{" "}
              <Link to="/marvelin" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Beatboxer Marvelin
              </Link>
              {" "}erzeugt alle Geräusche nur mit dem Mund.
              Das Ergebnis: Krimi-Spannung, die unter die Haut geht.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer"><button className="btn-premium" type="button">Tickets sichern</button></a>
              <Link to="/termine" className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block">Alle Termine</Link>
            </div>
          </div>
        </div>
      </div></section>
    </LandingLayout>
  );
};

export default KrimiHoerspiel;
