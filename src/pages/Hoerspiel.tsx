import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";
import FAQSection from "@/components/landing/FAQSection";
import CinematicPortrait from "@/components/CinematicPortrait";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import TicketCTA from "@/components/shared/TicketCTA";

const BREADCRUMBS = [
  { label: "Startseite", href: "/" },
  { label: "Pater Brown", href: "/pater-brown" },
  { label: "Hörspiel" },
];

const MARITIM_EPISODES = [
  "Das Geheimnis im Garten",
  "Der Hammer Gottes",
  "Die fliegenden Sterne",
  "Die drei Todeswerkzeuge",
  "Das Auge des Apoll",
  "Die Sünden des Prinzen Saradin",
  "Das Paradies der Diebe",
  "Die falsche Form",
];

const FAQ_ITEMS = [
  {
    question: "Welcher Sprecher spricht Pater Brown?",
    answer: "In den Maritim-Hörspielen spricht Volker Brandt die Rolle des Pater Brown. Im Live-Hörspiel auf der Bühne übernehmen Antoine Monot und Wanja Mues die Sprechrollen.",
  },
  {
    question: "In welcher Reihenfolge sollte man die Pater Brown Hörspiele hören?",
    answer: "Die Pater-Brown-Geschichten sind in sich abgeschlossen und können in beliebiger Reihenfolge gehört werden. Für Puristen empfiehlt sich die chronologische Reihenfolge nach G.K. Chestertons Sammlungen.",
  },
  {
    question: "Wo kann man Pater Brown Hörspiele hören?",
    answer: "Die Maritim-Hörspiele sind als CD, MP3 und auf Streaming-Plattformen erhältlich. Oder: Pater Brown LIVE auf der Bühne erleben – alle Termine unter paterbrown.com/termine.",
  },
  {
    question: "Was ist ein Live-Hörspiel?",
    answer: "Ein Live-Hörspiel wird live vor Publikum aufgeführt. Die Schauspieler sprechen ihre Rollen, alle Geräusche werden live erzeugt. Mehr dazu unter paterbrown.com/live-hoerspiel.",
  },
];

const Hoerspiel = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Pater Brown Hörspiel – Alle Hörspiele & das Live-Erlebnis",
    url: "https://paterbrown.com/hoerspiel",
    image: "https://paterbrown.com/images/historisch/father-brown-wisdom-buchillustration-original-1200.webp",
    author: { "@type": "Organization", name: "paterbrown.com" },
    publisher: { "@type": "Organization", name: "Dream & Anchor Handelsgesellschaft mbH" },
    description: "Pater Brown Hörspiele: Von den Maritim-Klassikern mit Volker Brandt bis zum Live-Hörspiel auf der Bühne.",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: "https://paterbrown.com" },
      { "@type": "ListItem", position: 2, name: "Pater Brown", item: "https://paterbrown.com/pater-brown" },
      { "@type": "ListItem", position: 3, name: "Hörspiel", item: "https://paterbrown.com/hoerspiel" },
    ],
  };

  return (
    <LandingLayout
      breadcrumbs={BREADCRUMBS}
      heroImage="/images/buehne/pater-brown-szene-gestik-nahaufnahme-af"
      heroTitle="Hörspiel"
      heroSubtitle="Von den Maritim-Klassikern zum Live-Erlebnis"
      heroCTA
    >
      <SEO
        title={`Pater Brown Hörspiel – Alle Hörspiele & das Live-Erlebnis | paterbrown.com`}
        description={`Pater Brown Hörspiele: Von den Maritim-Klassikern mit Volker Brandt bis zum Live-Hörspiel auf der Bühne. Alle Folgen, Sprecher & Reihenfolge im Überblick.`}
        canonical="/hoerspiel"
        keywords="pater brown hörspiel, pater brown hörspiele, pater brown hörspiel reihenfolge, pater brown maritim, volker brandt pater brown"
        ogImage="/images/og/pater-brown-live-hoerspiel-buehne-og.webp"
        schema={[articleSchema, breadcrumbSchema]}
      />

      {/* Tradition */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Tradition</p>
            <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
              Pater Brown als Hörspiel
            </h2>
            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
            <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
              Die Geschichten von{" "}
              <Link to="/pater-brown" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Pater Brown
              </Link>
              {" "}eignen sich wie kaum ein anderer Stoff für das Hörspiel: Dialog-lastig,
              atmosphärisch, voller Spannung durch Worte statt Action.
            </p>
            <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
              Seit den 1970er Jahren gibt es deutsche Hörspieladaptionen der
              Kriminalgeschichten von{" "}
              <Link to="/g-k-chesterton" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                G.K. Chesterton
              </Link>
              . Die bekannteste Produktion stammt vom Maritim Verlag.
            </p>
            <p className="text-foreground/70 leading-relaxed text-lg font-light">
              Was die Pater-Brown-Geschichten so hörspieltauglich macht: Chesterton
              erzählt seine Krimis fast ausschließlich über Dialoge und innere Monologe.
              Die Spannung entsteht nicht durch Verfolgungsjagden, sondern durch das
              Zusammenspiel der Figuren – perfekt für ein Medium, das von Stimmen
              und Atmosphäre lebt.
            </p>
          </div>
          <div className="relative overflow-hidden aspect-[4/3]">
            <img
              src="/images/historisch/father-brown-wisdom-buchillustration-original.webp"
              srcSet="/images/historisch/father-brown-wisdom-buchillustration-original-480.webp 480w, /images/historisch/father-brown-wisdom-buchillustration-original-768.webp 768w, /images/historisch/father-brown-wisdom-buchillustration-original-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="Father Brown – historische Buchillustration der Originalausgabe"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div></section>

      {/* Maritim Hörspiele */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Maritim Verlag</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Die Maritim Hörspiele
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
        <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
          Der Maritim Verlag produzierte die größte deutschsprachige Hörspieladaption
          der Pater-Brown-Geschichten: Über 48 Episoden, erhältlich als 6 MP3-CD Box.
        </p>

        <div className="border border-foreground/10 p-6 mb-8">
          <h3 className="font-heading text-foreground text-lg uppercase tracking-[0.1em] mb-4">Sprecher</h3>
          <div className="space-y-2">
            <p className="text-foreground/70">
              <span className="text-gold font-heading text-sm">Pater Brown</span> — Volker Brandt
            </p>
            <p className="text-foreground/70">
              <span className="text-gold font-heading text-sm">Flambeau</span> — Hans Georg Panczak
            </p>
            <p className="text-foreground/70">
              <span className="text-gold font-heading text-sm">Weitere</span> — Udo Schenk, Peer Augustinski, Gerd Baltus
            </p>
          </div>
        </div>

        <p className="text-foreground/50 leading-relaxed text-base mb-6">
          Die ersten 24 Episoden basieren auf Chesterton-Originalen, danach wurden Geschichten
          von neuen Autoren ergänzt. Genre: Krimi-Hörspiel mit ruhiger, atmosphärischer Erzählweise.
        </p>

        <h3 className="font-heading text-foreground text-lg uppercase tracking-[0.1em] mb-4 mt-10">
          Bekannte Folgen
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {MARITIM_EPISODES.map((ep) => (
            <div key={ep} className="px-4 py-3 border border-foreground/10 bg-card/10">
              <span className="text-foreground/70">{ep}</span>
            </div>
          ))}
        </div>
      </div></section>

      <TicketCTA variant="emotional" />

      {/* Reihenfolge */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Empfehlung</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Hörspiel-Reihenfolge
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
        <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
          Die Pater-Brown-Geschichten sind in sich abgeschlossen – jede Episode erzählt
          einen eigenständigen Kriminalfall. Es gibt keine fortlaufende Handlung,
          daher kann man die Hörspiele in beliebiger Reihenfolge genießen.
        </p>
        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Für Puristen empfiehlt sich die chronologische Reihenfolge nach Chestertons
          fünf Sammlungen: „The Innocence of Father Brown" (1911), „The Wisdom" (1914),
          „The Incredulity" (1926), „The Secret" (1927), „The Scandal" (1935).
        </p>
      </div></section>

      {/* Weitere Produktionen */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Formate</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Weitere Produktionen
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
        <div className="space-y-4">
          <div className="border border-foreground/10 p-5">
            <p className="font-heading text-foreground">Hörbücher</p>
            <p className="text-foreground/50 text-sm mt-1">
              Vorgelesene Fassungen der Originalgeschichten – ein Sprecher, keine Geräusche.
              Ideal für Chesterton-Puristen.
            </p>
          </div>
          <div className="border border-foreground/10 p-5">
            <p className="font-heading text-foreground">BBC Radio-Adaptionen</p>
            <p className="text-foreground/50 text-sm mt-1">
              Englischsprachige Hörspiele der BBC – nah am Original, mit britischem Flair.
            </p>
          </div>
          <div className="border border-foreground/10 p-5 border-gold/40 bg-gold/5">
            <p className="font-heading text-foreground">Das Live-Hörspiel</p>
            <p className="text-gold text-sm font-heading mt-1">Die nächste Stufe</p>
            <p className="text-foreground/50 text-sm mt-2">
              Professionelle Schauspieler, alle Geräusche live erzeugt durch Beatboxing –
              ein Hörspiel, das man mit allen Sinnen erlebt.
            </p>
          </div>
        </div>
        <p className="text-foreground/50 leading-relaxed text-base mt-6 mb-6">
          Unterschied: Ein Hörspiel ist eine szenische Produktion mit verteilten Rollen
          und Geräuschkulisse. Ein Hörbuch wird von einem einzelnen Sprecher vorgelesen.
        </p>
        <p className="text-foreground/50 leading-relaxed text-base">
          Was alle Formate gemeinsam haben: Die Geschichten von{" "}
          <Link to="/father-brown" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
            Father Brown
          </Link>
          {" "}funktionieren über Sprache und Atmosphäre. Gerade deshalb eignen sie sich
          so hervorragend für auditive Medien – vom klassischen Hörspiel über das
          Hörbuch bis zum Live-Erlebnis auf der Bühne, wo die Geräuschkulisse
          durch{" "}
          <Link to="/marvelin" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
            Beatboxer Marvelin
          </Link>
          {" "}live erzeugt wird.
        </p>
      </div></section>

      {/* Live-Hörspiel Überleitung */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
          <CinematicPortrait
            src="/images/buehne/pater-brown-ensemble-monot-mues-marvelin-af.webp"
            srcSet="/images/buehne/pater-brown-ensemble-monot-mues-marvelin-af-480.webp 480w, /images/buehne/pater-brown-ensemble-monot-mues-marvelin-af-768.webp 768w, /images/buehne/pater-brown-ensemble-monot-mues-marvelin-af-1200.webp 1200w"
            sizes="(max-width: 768px) 100vw, 55vw"
            alt="Antoine Monot, Wanja Mues und Marvelin im Pater Brown Live-Hörspiel"
            aspectRatio="aspect-[4/3]"
            objectPosition="50% 50%"
            fadeEdges
          />
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Live erleben</p>
            <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
              Das Live-Hörspiel
            </h2>
            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
            <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
              Was wäre, wenn man ein Hörspiel nicht nur hört, sondern live miterlebt?
              Im{" "}
              <Link to="/live-hoerspiel" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Pater Brown Live-Hörspiel
              </Link>
              {" "}sprechen{" "}
              <Link to="/antoine-monot" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Antoine Monot
              </Link>
              {" "}und{" "}
              <Link to="/wanja-mues" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Wanja Mues
              </Link>
              {" "}(bekannt aus „Ein Fall für zwei") die Rollen live.
            </p>
            <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
              <Link to="/marvelin" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Beatboxer Marvelin
              </Link>
              {" "}erzeugt alle Geräusche nur mit dem Mund – von knarrender Tür
              bis Kirchenglocke. Zwei Geschichten pro Abend, ca. 2 Stunden, ab 34,90 €.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer"><button className="btn-premium" type="button">Tickets sichern</button></a>
              <Link to="/termine" className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block">Alle Termine</Link>
            </div>
          </div>
        </div>
      </div></section>

      <TicketCTA variant="concrete" />

      {/* FAQ */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <FAQSection items={FAQ_ITEMS} label="FAQ" title="Häufige Fragen zum Pater Brown Hörspiel" />
      </div></section>
    </LandingLayout>
  );
};

export default Hoerspiel;
