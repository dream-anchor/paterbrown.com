import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";
import FAQSection from "@/components/landing/FAQSection";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const BREADCRUMBS = [
  { label: "Startseite", href: "/" },
  { label: "Marvelin" },
];

const CAREER_MILESTONES = [
  { year: "2019", text: "Durchbruch in Australien (Byron Bay), erste Album-Veröffentlichung" },
  { year: "2020", text: "Pioniererarbeit in Beatbox-Bildung: Erste strukturierte deutsche Beatbox-Tutorial-Reihe auf YouTube" },
  { year: "2020–2022", text: "Hauptberuflich als Beatbox-Coach" },
  { year: "seit 2021", text: "Teil von Razzz Beatbox Entertainment – Kindermusical und Konzertshows mit The Razzzones" },
  { year: "2022", text: "Deutscher Beatbox-Meistertitel (Team-Wettbewerb)" },
  { year: "2023", text: "Grand Beatbox Battle in Tokyo – größte Beatbox-Bühne der Welt" },
  { year: "2024", text: "Organisation der Deutschen Beatbox-Meisterschaften – größte und qualitativ hochwertigste bisher" },
  { year: "2025", text: "Performance bei Google's RCS World Tour in Berlin und Gamescom" },
];

const FAQ_ITEMS = [
  {
    question: "Was ist Beatboxing?",
    answer: "Beatboxing ist eine Kunstform, bei der mit Mund, Zunge, Lippen und Stimme rhythmische Klänge und Geräusche imitiert werden. Die Ursprünge liegen in der Hip-Hop-Szene der 1980er Jahre in den USA.",
  },
  {
    question: "Wie erzeugt Marvelin die Geräusche im Live-Hörspiel?",
    answer: "Marvelin erzeugt alle Geräusche und Soundeffekte ausschließlich mit Mund, Zunge, Lippen und Stimme – ohne Technik, ohne Playback. Schritte auf Kies, knarrende Türen, Kirchenglocken, Regen, Wind – alles entsteht live auf der Bühne.",
  },
  {
    question: "Kann man Beatboxing lernen?",
    answer: "Ja! Marvelin bietet als CEO von Beatbox Germany auch Workshops und Tutorials an. Drei Grundlaute reichen für einen ersten Beat: B (Bassdrum), K (Snare), TZ (Hi-Hat).",
  },
  {
    question: "Was sind die Razzzones?",
    answer: `The Razzzones sind Deutschlands erfolgreichste Beatbox-Band. 2018 Deutsche Beatbox-Meister, 2021 Halbfinale bei „The Voice of Germany“. Marvelin ist Mitglied seit 2021.`,
  },
];

const Marvelin = () => {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Marvelin",
    alternateName: "Marvin Pöttgen",
    url: "https://paterbrown.com/marvelin",
    image: "https://paterbrown.com/images/buehne/pater-brown-buehne-ensemble-marvelin-af-1200.webp",
    jobTitle: "Beatboxer, Coach, Veranstalter",
    description: "Beatboxer Marvelin erzeugt live alle Geräusche im Pater Brown Live-Hörspiel. CEO von Beatbox Germany, Mitglied der Razzzones.",
    performerIn: {
      "@type": "TheaterEvent",
      name: "Pater Brown – Das Live-Hörspiel",
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
      heroImage="/images/buehne/pater-brown-buehne-ensemble-marvelin-af.webp"
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
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
            <div>
              <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Beatboxer</p>
              <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
                Marvelin
              </h2>
              <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
              <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
                Marvin Pöttgen, Künstlername Marvelin, ist gebürtiger Saarländer und
                lebt in Berlin. Er ist CEO und Co-Founder von Beatbox Germany und
                Mitglied von The Razzzones – der erfolgreichsten Beatbox-Band Deutschlands.
              </p>
              <p className="text-foreground/70 leading-relaxed text-lg font-light">
                2022 gewann er mit seinem Team den Deutschen Beatbox-Meistertitel.
                Begonnen hat alles als Straßenmusiker in Berlin.
              </p>
            </div>
            <div className="overflow-hidden border border-foreground/10">
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
        </div>
      </section>

      {/* Was ist Beatboxing? */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Die Kunstform</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
            Was ist Beatboxing?
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Beatboxing ist eine Kunstform, bei der mit Mund, Zunge, Lippen und Stimme
            rhythmische Klänge und Geräusche imitiert werden. Die Ursprünge liegen in der
            Hip-Hop-Szene der 1980er Jahre in den USA, wo Künstler begannen, Rhythmen
            von Drum-Maschinen mit dem Mund nachzuahmen.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Heute reicht Beatboxing von Straßenmusik bis auf die großen Bühnen der Welt,
            mit internationalen Competitions und Weltmeisterschaften. Pioniere wie
            Doug E. Fresh, Biz Markie und Rahzel ebneten den Weg in den 80ern und 90ern.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            <div className="border border-foreground/10 p-5 text-center">
              <p className="text-4xl font-heading text-gold mb-2">B</p>
              <p className="text-foreground/50 text-sm">Bassdrum</p>
            </div>
            <div className="border border-foreground/10 p-5 text-center">
              <p className="text-4xl font-heading text-gold mb-2">K</p>
              <p className="text-foreground/50 text-sm">Snare</p>
            </div>
            <div className="border border-foreground/10 p-5 text-center">
              <p className="text-4xl font-heading text-gold mb-2">TZ</p>
              <p className="text-foreground/50 text-sm">Hi-Hat</p>
            </div>
          </div>
          <p className="text-foreground/50 mt-4 text-center leading-relaxed text-base">
            Drei Grundlaute reichen für einen ersten Beat.
            Fortgeschrittene Techniken: Liprolls, Inward-Sounds, Polyphonics, Loopstation-Kombination.
          </p>
        </div>
      </section>

      {/* Karriere */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-6xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Karriere</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
            Marvelins Weg
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-12" aria-hidden="true" />
          <div className="space-y-3">
            {CAREER_MILESTONES.map((milestone) => (
              <div
                key={milestone.year}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 px-5 py-4 border border-foreground/10 bg-card/10 hover:border-gold/20 transition-all"
              >
                <span className="text-gold font-heading text-sm whitespace-nowrap min-w-[100px]">
                  {milestone.year}
                </span>
                <span className="text-foreground/70">{milestone.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Im Live-Hörspiel */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
            <div className="overflow-hidden border border-foreground/10">
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
              <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Pater Brown</p>
              <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
                Im Live-Hörspiel
              </h2>
              <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
              <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
                Im{" "}
                <Link to="/live-hoerspiel" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  Pater Brown Live-Hörspiel
                </Link>
                {" "}übernimmt Marvelin das komplette Live-Sounddesign. Alle Geräusche und
                Soundeffekte werden ausschließlich mit dem Mund erzeugt.
              </p>
              <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
                Schritte auf Kies, knarrende Türen, Kirchenglocken, Regen, Wind,
                Schüsse, Pferdehufe, Kutschenfahrten – alles entsteht live auf der Bühne.
              </p>
              <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
                Das{" "}
                <Link to="/pater-brown" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  Hörspiel
                </Link>
                {" "}lebt von Klang – und hier entsteht jeder Klang organisch, menschlich, live.
                Die Verbindung von Hip-Hop-Kultur und viktorianischer Kriminalliteratur
                schafft einen einzigartigen Kontrast.
              </p>
              <p className="text-foreground/70 leading-relaxed text-lg font-light">
                Gemeinsam mit{" "}
                <Link to="/antoine-monot" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  Antoine Monot
                </Link>
                {" "}und{" "}
                <Link to="/wanja-mues" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  Wanja Mues
                </Link>
                {" "}entsteht ein Krimi-Erlebnis, das es so nur auf der Bühne gibt.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer">
              <button className="btn-premium" type="button">Tickets sichern</button>
            </a>
            <Link to="/termine" className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block">Alle Termine</Link>
          </div>
        </div>
      </section>

      {/* Beatboxing als Kunstform */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Szene</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
            Beatboxing in Deutschland
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Beatboxing hat in Deutschland eine lebendige Szene. Robeat machte 2007 bei
            „Das Supertalent" die Kunstform einem Millionenpublikum bekannt. Heute zählen
            The Razzzones, Madox und Alberto zu den bekanntesten deutschen Beatboxern.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Loopstation-Beatboxing kombiniert die Stimmkunst mit Loop-Geräten für einen
            One-Man-Band-Effekt. Und auch in der Bildung spielt Beatboxing eine wachsende
            Rolle – Workshops an Schulen und Teambuilding-Events bringen die Kunstform
            einem neuen Publikum nahe.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-4xl">
          <FAQSection items={FAQ_ITEMS} label="FAQ" title="Häufige Fragen zu Marvelin & Beatboxing" />
        </div>
      </section>
    </LandingLayout>
  );
};

export default Marvelin;
