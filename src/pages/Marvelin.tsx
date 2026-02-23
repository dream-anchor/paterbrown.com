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
  { label: "Marvelin" },
];

const CAREER_MILESTONES = [
  { year: "2019", text: "Durchbruch in Australien (Byron Bay), erste Album-Ver\u00F6ffentlichung" },
  { year: "2020", text: "Pioniererarbeit in Beatbox-Bildung: Erste strukturierte deutsche Beatbox-Tutorial-Reihe auf YouTube" },
  { year: "2020\u20132022", text: "Hauptberuflich als Beatbox-Coach" },
  { year: "seit 2021", text: "Teil von Razzz Beatbox Entertainment \u2013 Kindermusical und Konzertshows mit The Razzzones" },
  { year: "2022", text: "Deutscher Beatbox-Meistertitel (Team-Wettbewerb)" },
  { year: "2023", text: "Grand Beatbox Battle in Tokyo \u2013 gr\u00F6\u00DFte Beatbox-B\u00FChne der Welt" },
  { year: "2024", text: "Organisation der Deutschen Beatbox-Meisterschaften \u2013 gr\u00F6\u00DFte und qualitativ hochwertigste bisher" },
  { year: "2025", text: "Performance bei Google's RCS World Tour in Berlin und Gamescom" },
];

const FAQ_ITEMS = [
  {
    question: "Was ist Beatboxing?",
    answer: "Beatboxing ist eine Kunstform, bei der mit Mund, Zunge, Lippen und Stimme rhythmische Kl\u00E4nge und Ger\u00E4usche imitiert werden. Die Urspr\u00FCnge liegen in der Hip-Hop-Szene der 1980er Jahre in den USA.",
  },
  {
    question: "Wie erzeugt Marvelin die Ger\u00E4usche im Live-H\u00F6rspiel?",
    answer: "Marvelin erzeugt alle Ger\u00E4usche und Soundeffekte ausschlie\u00DFlich mit Mund, Zunge, Lippen und Stimme \u2013 ohne Technik, ohne Playback. Schritte auf Kies, knarrende T\u00FCren, Kirchenglocken, Regen, Wind \u2013 alles entsteht live auf der B\u00FChne.",
  },
  {
    question: "Kann man Beatboxing lernen?",
    answer: "Ja! Marvelin bietet als CEO von Beatbox Germany auch Workshops und Tutorials an. Drei Grundlaute reichen f\u00FCr einen ersten Beat: B (Bassdrum), K (Snare), TZ (Hi-Hat).",
  },
  {
    question: "Was sind die Razzzones?",
    answer: "The Razzzones sind Deutschlands erfolgreichste Beatbox-Band. 2018 Deutsche Beatbox-Meister, 2021 Halbfinale bei \u201EThe Voice of Germany\u201C. Marvelin ist Mitglied seit 2021.",
  },
];

const Marvelin = () => {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Marvelin",
    alternateName: "Marvin P\u00F6ttgen",
    url: "https://paterbrown.com/marvelin",
    image: "https://paterbrown.com/images/buehne/pater-brown-buehne-ensemble-marvelin-af-1200.webp",
    jobTitle: "Beatboxer, Coach, Veranstalter",
    description: "Beatboxer Marvelin erzeugt live alle Ger\u00E4usche im Pater Brown Live-H\u00F6rspiel. CEO von Beatbox Germany, Mitglied der Razzzones.",
    performerIn: {
      "@type": "TheaterEvent",
      name: "Pater Brown \u2013 Das Live-H\u00F6rspiel",
      url: "https://paterbrown.com/live-hoerspiel",
    },
    sameAs: ["https://www.beatboxgermany.de"],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: "https://paterbrown.com" },
      { "@type": "ListItem", position: 2, name: "Marvelin", item: "https://paterbrown.com/marvelin" },
    ],
  };

  return (
    <LandingLayout
      breadcrumbs={BREADCRUMBS}
      heroTitle="Marvelin"
      heroSubtitle="Beatboxer, Coach, Veranstalter"
    >
      <SEO
        title="Marvelin – Beatboxer im Pater Brown Live-Hörspiel | paterbrown.com"
        description="Beatboxer Marvelin erzeugt live alle Geräusche im Pater Brown Live-Hörspiel. CEO von Beatbox Germany, Mitglied der Razzzones. Erlebe Beatboxing live!"
        canonical="/marvelin"
        keywords="pater brown marvelin, marvelin beatbox, beatboxer, beatbox loopstation, beatbox germany"
        ogImage="/images/og/marvelin-beatboxer-pater-brown-og.webp"
        schema={[personSchema, breadcrumbSchema]}
      />

      {/* Intro */}
      <Section container="wide" className="py-20 md:py-32">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
          <div>
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Beatboxer</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
              Marvelin
            </h2>
            <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Marvin Pöttgen, Künstlername Marvelin, ist gebürtiger Saarländer und
              lebt in Berlin. Er ist CEO und Co-Founder von Beatbox Germany und
              Mitglied von The Razzzones – der erfolgreichsten Beatbox-Band Deutschlands.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70">
              2022 gewann er mit seinem Team den Deutschen Beatbox-Meistertitel.
              Begonnen hat alles als Straßenmusiker in Berlin.
            </SerifText>
          </div>
          <div className="card-glow rounded-[3px] overflow-hidden">
            <img
              src="/images/buehne/pater-brown-buehne-ensemble-marvelin-af.webp"
              srcSet="/images/buehne/pater-brown-buehne-ensemble-marvelin-af-480.webp 480w, /images/buehne/pater-brown-buehne-ensemble-marvelin-af-768.webp 768w, /images/buehne/pater-brown-buehne-ensemble-marvelin-af-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="Marvelin – Beatboxer im Pater Brown Live-Hörspiel"
              className="w-full aspect-[3/4] object-cover object-top"
              loading="eager"
            />
          </div>
        </div>
      </Section>

      {/* Was ist Beatboxing? */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Die Kunstform</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Was ist Beatboxing?
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Beatboxing ist eine Kunstform, bei der mit Mund, Zunge, Lippen und Stimme
          rhythmische Klänge und Geräusche imitiert werden. Die Ursprünge liegen in der
          Hip-Hop-Szene der 1980er Jahre in den USA, wo Künstler begannen, Rhythmen
          von Drum-Maschinen mit dem Mund nachzuahmen.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Heute reicht Beatboxing von Straßenmusik bis auf die großen Bühnen der Welt,
          mit internationalen Competitions und Weltmeisterschaften. Pioniere wie
          Doug E. Fresh, Biz Markie und Rahzel ebneten den Weg in den 80ern und 90ern.
        </SerifText>

        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          <div className="card-glow rounded-[3px] p-5 text-center">
            <p className="text-4xl font-heading text-primary mb-2">B</p>
            <p className="text-foreground/50 text-sm font-serif">Bassdrum</p>
          </div>
          <div className="card-glow rounded-[3px] p-5 text-center">
            <p className="text-4xl font-heading text-primary mb-2">K</p>
            <p className="text-foreground/50 text-sm font-serif">Snare</p>
          </div>
          <div className="card-glow rounded-[3px] p-5 text-center">
            <p className="text-4xl font-heading text-primary mb-2">TZ</p>
            <p className="text-foreground/50 text-sm font-serif">Hi-Hat</p>
          </div>
        </div>
        <SerifText size="base" className="text-foreground/50 mt-4 text-center">
          Drei Grundlaute reichen für einen ersten Beat.
          Fortgeschrittene Techniken: Liprolls, Inward-Sounds, Polyphonics, Loopstation-Kombination.
        </SerifText>
      </Section>

      {/* Karriere */}
      <Section container="wide" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Karriere</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Marvelins Weg
        </h2>
        <div className="divider-gold mb-12 max-w-xs" aria-hidden="true" />
        <div className="space-y-3">
          {CAREER_MILESTONES.map((milestone) => (
            <div
              key={milestone.year}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 px-5 py-4 border border-border/30 rounded-[3px] bg-card/20 hover:border-primary/20 transition-all"
            >
              <span className="text-primary font-heading text-sm whitespace-nowrap min-w-[100px]">
                {milestone.year}
              </span>
              <span className="text-foreground/70 font-serif">{milestone.text}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Im Live-Hörspiel */}
      <Section container="wide" className="py-20 md:py-32">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
          <div className="card-glow rounded-[3px] overflow-hidden">
            <img
              src="/images/buehne/pater-brown-ensemble-monot-mues-marvelin-af.webp"
              srcSet="/images/buehne/pater-brown-ensemble-monot-mues-marvelin-af-480.webp 480w, /images/buehne/pater-brown-ensemble-monot-mues-marvelin-af-768.webp 768w, /images/buehne/pater-brown-ensemble-monot-mues-marvelin-af-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 55vw"
              alt="Marvelin, Antoine Monot und Wanja Mues gemeinsam auf der Bühne"
              className="w-full aspect-[4/3] object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Pater Brown</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
              Im Live-Hörspiel
            </h2>
            <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Im{" "}
              <Link to="/live-hoerspiel" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Pater Brown Live-Hörspiel
              </Link>
              {" "}übernimmt Marvelin das komplette Live-Sounddesign. Alle Geräusche und
              Soundeffekte werden ausschließlich mit dem Mund erzeugt.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Schritte auf Kies, knarrende Türen, Kirchenglocken, Regen, Wind,
              Schüsse, Pferdehufe, Kutschenfahrten – alles entsteht live auf der Bühne.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Das{" "}
              <Link to="/pater-brown" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Hörspiel
              </Link>
              {" "}lebt von Klang – und hier entsteht jeder Klang organisch, menschlich, live.
              Die Verbindung von Hip-Hop-Kultur und viktorianischer Kriminalliteratur
              schafft einen einzigartigen Kontrast.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70">
              Gemeinsam mit{" "}
              <Link to="/antoine-monot" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Antoine Monot
              </Link>
              {" "}und{" "}
              <Link to="/wanja-mues" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Wanja Mues
              </Link>
              {" "}entsteht ein Krimi-Erlebnis, das es so nur auf der Bühne gibt.
            </SerifText>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <GhostButton href={EVENTIM_AFFILIATE_URL}>Tickets sichern</GhostButton>
          <GhostButton to="/termine" className="bg-transparent">Alle Termine</GhostButton>
        </div>
      </Section>

      {/* Beatboxing als Kunstform */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Szene</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Beatboxing in Deutschland
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Beatboxing hat in Deutschland eine lebendige Szene. Robeat machte 2007 bei
          „Das Supertalent" die Kunstform einem Millionenpublikum bekannt. Heute zählen
          The Razzzones, Madox und Alberto zu den bekanntesten deutschen Beatboxern.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Loopstation-Beatboxing kombiniert die Stimmkunst mit Loop-Geräten für einen
          One-Man-Band-Effekt. Und auch in der Bildung spielt Beatboxing eine wachsende
          Rolle – Workshops an Schulen und Teambuilding-Events bringen die Kunstform
          einem neuen Publikum nahe.
        </SerifText>
      </Section>

      {/* FAQ */}
      <Section container="narrow" className="py-20 md:py-32">
        <FAQSection items={FAQ_ITEMS} label="FAQ" title="Häufige Fragen zu Marvelin & Beatboxing" />
      </Section>
    </LandingLayout>
  );
};

export default Marvelin;
