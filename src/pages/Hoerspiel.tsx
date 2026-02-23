import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";
import Section from "@/components/ui/Section";
import SerifText from "@/components/ui/SerifText";
import GhostButton from "@/components/ui/GhostButton";
import FAQSection from "@/components/landing/FAQSection";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

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
  "Die S\u00FCnden des Prinzen Saradin",
  "Das Paradies der Diebe",
  "Die falsche Form",
];

const FAQ_ITEMS = [
  {
    question: "Welcher Sprecher spricht Pater Brown?",
    answer: "In den Maritim-H\u00F6rspielen spricht Volker Brandt die Rolle des Pater Brown. Im Live-H\u00F6rspiel auf der B\u00FChne \u00FCbernehmen Antoine Monot und Wanja Mues die Sprechrollen.",
  },
  {
    question: "In welcher Reihenfolge sollte man die Pater Brown H\u00F6rspiele h\u00F6ren?",
    answer: "Die Pater-Brown-Geschichten sind in sich abgeschlossen und k\u00F6nnen in beliebiger Reihenfolge geh\u00F6rt werden. F\u00FCr Puristen empfiehlt sich die chronologische Reihenfolge nach G.K. Chestertons Sammlungen.",
  },
  {
    question: "Wo kann man Pater Brown H\u00F6rspiele h\u00F6ren?",
    answer: "Die Maritim-H\u00F6rspiele sind als CD, MP3 und auf Streaming-Plattformen erh\u00E4ltlich. Oder: Pater Brown LIVE auf der B\u00FChne erleben \u2013 alle Termine unter paterbrown.com/termine.",
  },
  {
    question: "Was ist ein Live-H\u00F6rspiel?",
    answer: "Ein Live-H\u00F6rspiel wird live vor Publikum aufgef\u00FChrt. Die Schauspieler sprechen ihre Rollen, alle Ger\u00E4usche werden live erzeugt. Mehr dazu unter paterbrown.com/live-hoerspiel.",
  },
];

const Hoerspiel = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Pater Brown H\u00F6rspiel \u2013 Alle H\u00F6rspiele & das Live-Erlebnis",
    url: "https://paterbrown.com/hoerspiel",
    image: "https://paterbrown.com/images/historisch/father-brown-wisdom-buchillustration-original-1200.webp",
    author: { "@type": "Organization", name: "paterbrown.com" },
    publisher: { "@type": "Organization", name: "Dream & Anchor Handelsgesellschaft mbH" },
    description: "Pater Brown H\u00F6rspiele: Von den Maritim-Klassikern mit Volker Brandt bis zum Live-H\u00F6rspiel auf der B\u00FChne.",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: "https://paterbrown.com" },
      { "@type": "ListItem", position: 2, name: "Pater Brown", item: "https://paterbrown.com/pater-brown" },
      { "@type": "ListItem", position: 3, name: "H\u00F6rspiel", item: "https://paterbrown.com/hoerspiel" },
    ],
  };

  return (
    <LandingLayout
      breadcrumbs={BREADCRUMBS}
      heroTitle="Hörspiel"
      heroSubtitle="Von den Maritim-Klassikern zum Live-Erlebnis"
    >
      <SEO
        title={`Pater Brown H\u00F6rspiel \u2013 Alle H\u00F6rspiele & das Live-Erlebnis | paterbrown.com`}
        description={`Pater Brown H\u00F6rspiele: Von den Maritim-Klassikern mit Volker Brandt bis zum Live-H\u00F6rspiel auf der B\u00FChne. Alle Folgen, Sprecher & Reihenfolge im \u00DCberblick.`}
        canonical="/hoerspiel"
        keywords="pater brown hörspiel, pater brown hörspiele, pater brown hörspiel reihenfolge, pater brown maritim, volker brandt pater brown"
        ogImage="/images/og/pater-brown-live-hoerspiel-buehne-og.webp"
        schema={[articleSchema, breadcrumbSchema]}
      />

      {/* Tradition */}
      <Section container="wide" className="py-20 md:py-32">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
          <div>
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Tradition</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
              Pater Brown als Hörspiel
            </h2>
            <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Die Geschichten von{" "}
              <Link to="/pater-brown" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Pater Brown
              </Link>
              {" "}eignen sich wie kaum ein anderer Stoff für das Hörspiel: Dialog-lastig,
              atmosphärisch, voller Spannung durch Worte statt Action.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70">
              Seit den 1970er Jahren gibt es deutsche Hörspieladaptionen der
              Kriminalgeschichten von{" "}
              <Link to="/g-k-chesterton" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                G.K. Chesterton
              </Link>
              . Die bekannteste Produktion stammt vom Maritim Verlag.
            </SerifText>
          </div>
          <div className="card-glow rounded-[3px] overflow-hidden">
            <img
              src="/images/historisch/father-brown-wisdom-buchillustration-original.webp"
              srcSet="/images/historisch/father-brown-wisdom-buchillustration-original-480.webp 480w, /images/historisch/father-brown-wisdom-buchillustration-original-768.webp 768w, /images/historisch/father-brown-wisdom-buchillustration-original-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="Father Brown – historische Buchillustration der Originalausgabe"
              className="w-full aspect-[4/3] object-cover"
              loading="eager"
            />
          </div>
        </div>
      </Section>

      {/* Maritim Hörspiele */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Maritim Verlag</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Die Maritim Hörspiele
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Der Maritim Verlag produzierte die größte deutschsprachige Hörspieladaption
          der Pater-Brown-Geschichten: Über 48 Episoden, erhältlich als 6 MP3-CD Box.
        </SerifText>

        <div className="card-glow rounded-[3px] p-6 mb-8">
          <h3 className="font-heading text-foreground text-lg uppercase tracking-[0.1em] mb-4">Sprecher</h3>
          <div className="space-y-2">
            <p className="font-serif text-foreground/70">
              <span className="text-primary font-heading text-sm">Pater Brown</span> — Volker Brandt
            </p>
            <p className="font-serif text-foreground/70">
              <span className="text-primary font-heading text-sm">Flambeau</span> — Hans Georg Panczak
            </p>
            <p className="font-serif text-foreground/70">
              <span className="text-primary font-heading text-sm">Weitere</span> — Udo Schenk, Peer Augustinski, Gerd Baltus
            </p>
          </div>
        </div>

        <SerifText size="base" className="text-foreground/50 mb-6">
          Die ersten 24 Episoden basieren auf Chesterton-Originalen, danach wurden Geschichten
          von neuen Autoren ergänzt. Genre: Krimi-Hörspiel mit ruhiger, atmosphärischer Erzählweise.
        </SerifText>

        <h3 className="font-heading text-foreground text-lg uppercase tracking-[0.1em] mb-4 mt-10">
          Bekannte Folgen
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {MARITIM_EPISODES.map((ep) => (
            <div key={ep} className="px-4 py-3 border border-border/30 rounded-[3px] bg-card/20">
              <span className="font-serif text-foreground/70">{ep}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Reihenfolge */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Empfehlung</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Hörspiel-Reihenfolge
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Die Pater-Brown-Geschichten sind in sich abgeschlossen – jede Episode erzählt
          einen eigenständigen Kriminalfall. Es gibt keine fortlaufende Handlung,
          daher kann man die Hörspiele in beliebiger Reihenfolge genießen.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70">
          Für Puristen empfiehlt sich die chronologische Reihenfolge nach Chestertons
          fünf Sammlungen: „The Innocence of Father Brown" (1911), „The Wisdom" (1914),
          „The Incredulity" (1926), „The Secret" (1927), „The Scandal" (1935).
        </SerifText>
      </Section>

      {/* Weitere Produktionen */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Formate</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Weitere Produktionen
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
        <div className="space-y-4">
          <div className="card-glow rounded-[3px] p-5">
            <p className="font-heading text-foreground">Hörbücher</p>
            <p className="text-foreground/50 text-sm font-serif mt-1">
              Vorgelesene Fassungen der Originalgeschichten – ein Sprecher, keine Geräusche.
              Ideal für Chesterton-Puristen.
            </p>
          </div>
          <div className="card-glow rounded-[3px] p-5">
            <p className="font-heading text-foreground">BBC Radio-Adaptionen</p>
            <p className="text-foreground/50 text-sm font-serif mt-1">
              Englischsprachige Hörspiele der BBC – nah am Original, mit britischem Flair.
            </p>
          </div>
          <div className="card-glow rounded-[3px] p-5 border-primary/40 bg-primary/5">
            <p className="font-heading text-foreground">Das Live-Hörspiel</p>
            <p className="text-primary text-sm font-heading mt-1">Die nächste Stufe</p>
            <p className="text-foreground/50 text-sm font-serif mt-2">
              Professionelle Schauspieler, alle Geräusche live erzeugt durch Beatboxing –
              ein Hörspiel, das man mit allen Sinnen erlebt.
            </p>
          </div>
        </div>
        <SerifText size="base" className="text-foreground/50 mt-6">
          Unterschied: Ein Hörspiel ist eine szenische Produktion mit verteilten Rollen
          und Geräuschkulisse. Ein Hörbuch wird von einem einzelnen Sprecher vorgelesen.
        </SerifText>
      </Section>

      {/* Live-Hörspiel Überleitung */}
      <Section container="wide" className="py-20 md:py-32">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
          <div className="card-glow rounded-[3px] overflow-hidden">
            <img
              src="/images/buehne/pater-brown-ensemble-monot-mues-marvelin-af.webp"
              srcSet="/images/buehne/pater-brown-ensemble-monot-mues-marvelin-af-480.webp 480w, /images/buehne/pater-brown-ensemble-monot-mues-marvelin-af-768.webp 768w, /images/buehne/pater-brown-ensemble-monot-mues-marvelin-af-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 55vw"
              alt="Antoine Monot, Wanja Mues und Marvelin im Pater Brown Live-Hörspiel"
              className="w-full aspect-[4/3] object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Live erleben</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
              Das Live-Hörspiel
            </h2>
            <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Was wäre, wenn man ein Hörspiel nicht nur hört, sondern live miterlebt?
              Im{" "}
              <Link to="/live-hoerspiel" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Pater Brown Live-Hörspiel
              </Link>
              {" "}sprechen{" "}
              <Link to="/antoine-monot" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Antoine Monot
              </Link>
              {" "}und{" "}
              <Link to="/wanja-mues" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Wanja Mues
              </Link>
              {" "}(bekannt aus „Ein Fall für zwei") die Rollen live.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70 mb-6">
              <Link to="/marvelin" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Beatboxer Marvelin
              </Link>
              {" "}erzeugt alle Geräusche nur mit dem Mund – von knarrender Tür
              bis Kirchenglocke. Zwei Geschichten pro Abend, ca. 2 Stunden, ab 34,90 €.
            </SerifText>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <GhostButton href={EVENTIM_AFFILIATE_URL}>Tickets sichern</GhostButton>
              <GhostButton to="/termine" className="bg-transparent">Alle Termine</GhostButton>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section container="narrow" className="py-20 md:py-32">
        <FAQSection items={FAQ_ITEMS} label="FAQ" title="Häufige Fragen zum Pater Brown Hörspiel" />
      </Section>
    </LandingLayout>
  );
};

export default Hoerspiel;
