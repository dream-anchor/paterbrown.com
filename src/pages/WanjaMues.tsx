import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";
import Section from "@/components/ui/Section";
import SerifText from "@/components/ui/SerifText";
import GhostButton from "@/components/ui/GhostButton";
import wanjaHeaderBg from "@/assets/wanja-header-bg.png";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const BREADCRUMBS = [
  { label: "Startseite", href: "/" },
  { label: "Wanja Mues" },
];

const FILMOGRAPHY = [
  { title: "Der Pianist", year: "2001", info: "Regie: Roman Pola\u0144ski \u2013 neben Adrien Brody (Oscar-pr\u00E4miert)" },
  { title: "Die Bourne Verschw\u00F6rung", year: "2004", info: "neben Matt Damon" },
  { title: "Yella", year: "2007", info: "Regie: Christian Petzold \u2013 neben Nina Hoss" },
  { title: "Blueprint", year: "2004", info: "neben Franka Potente" },
  { title: "Mein letzter Film", year: "", info: "Regie: Oliver Hirschbiegel \u2013 mit Hannelore Elsner" },
];

const TV_ROLES = [
  { title: "Ein Fall f\u00FCr zwei", year: "seit 2014", role: "Privatdetektiv Leo Oswald", highlight: true },
  { title: "Stubbe \u2013 Von Fall zu Fall", year: "2009\u20132014/2025", role: "Helge Kleinert" },
  { title: "Tage, die es nicht gab", year: "2022/2025", role: "ORF/ARD" },
  { title: "Martha Liebermann \u2013 Ein gestohlenes Leben", year: "2022", role: "TV-Film" },
  { title: "D\u00FCrer", year: "2021", role: "Albrecht D\u00FCrer \u2013 neben Hannah Herzsprung" },
  { title: "Unsere Hagenbecks", year: "1991\u20131994", role: "" },
  { title: "GSG 9 \u2013 Die Elite-Einheit", year: "", role: "" },
  { title: "Die Heiland: Wir sind Anwalt", year: "", role: "" },
];

const WanjaMues = () => {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Wanja Mues",
    url: "https://paterbrown.com/wanja-mues",
    image: "https://paterbrown.com/images/portraits/wanja-mues-portrait-pater-brown-gl-1200.webp",
    jobTitle: "Schauspieler",
    birthDate: "1973-12-27",
    birthPlace: { "@type": "Place", name: "Hamburg, Deutschland" },
    description: "Wanja Mues ist ein deutscher Schauspieler, bekannt aus ZDF Ein Fall f\u00FCr zwei und dem Pater Brown Live-H\u00F6rspiel.",
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
      { "@type": "ListItem", position: 2, name: "Wanja Mues", item: "https://paterbrown.com/wanja-mues" },
    ],
  };

  return (
    <LandingLayout
      breadcrumbs={BREADCRUMBS}
      heroImage={wanjaHeaderBg}
      heroTitle="Wanja Mues"
      heroSubtitle="Schauspieler, Hörbuchsprecher, Bühnenkünstler"
    >
      <SEO
        title={`Wanja Mues als Pater Brown \u2013 Der Star aus \u201EEin Fall f\u00FCr zwei\u201C live | paterbrown.com`}
        description={`Wanja Mues bringt Pater Brown als Live-H\u00F6rspiel auf die B\u00FChne. Der Schauspieler aus \u201EEin Fall f\u00FCr zwei\u201C & \u201EDer Pianist\u201C in einer neuen Rolle. Termine & Tickets.`}
        canonical="/wanja-mues"
        keywords="pater brown wanja mues, wanja mues pater brown, wanja mues, wanja mues schauspieler"
        ogImage="/images/og/wanja-mues-schauspieler-og.webp"
        schema={[personSchema, breadcrumbSchema]}
      />

      {/* Biografie */}
      <Section container="wide" className="py-20 md:py-32">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
          <div>
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Biografie</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
              Der Schauspieler
            </h2>
            <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Wanja Mues wurde am 27. Dezember 1973 in Hamburg geboren – in eine Familie,
              der die Kunst im Blut liegt. Sein Vater Dietmar Mues war Schauspieler,
              Drehbuchautor und Schriftsteller. Seine Brüder Jona (Schauspieler) und
              Woody (Regisseur) sind ebenfalls in der Branche.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Seine Schauspielausbildung absolvierte Mues am renommierten Actors' Studio
              MFA-Program in New York (Robert Lewis Theatre Workshop). Von 1993 bis 1999
              lebte er in den USA und stand auf den Theaterbühnen New Yorks.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70">
              Seinen ersten Auftritt vor der Kamera hatte er 1986 als 13-Jähriger in
              „Jokehnen" neben Armin Mueller-Stahl.
            </SerifText>
          </div>
          <div className="card-glow rounded-[3px] overflow-hidden">
            <img
              src="/images/portraits/wanja-mues-portrait-pater-brown-gl.webp"
              srcSet="/images/portraits/wanja-mues-portrait-pater-brown-gl-480.webp 480w, /images/portraits/wanja-mues-portrait-pater-brown-gl-768.webp 768w, /images/portraits/wanja-mues-portrait-pater-brown-gl-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="Wanja Mues – Schauspieler im Pater Brown Live-Hörspiel"
              className="w-full aspect-[3/4] object-cover object-top"
              loading="eager"
            />
          </div>
        </div>
      </Section>

      {/* Film & Fernsehen */}
      <Section container="wide" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Karriere</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Film &amp; Fernsehen
        </h2>
        <div className="divider-gold mb-12 max-w-xs" aria-hidden="true" />

        {/* Kino */}
        <h3 className="text-xl font-heading text-foreground uppercase tracking-[0.1em] mb-6">Internationale Kinofilme</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {FILMOGRAPHY.map((film) => (
            <div key={film.title} className="card-glow rounded-[3px] p-5">
              <p className="font-heading text-foreground text-lg">{film.title}</p>
              {film.year && <p className="text-primary text-sm font-heading mt-1">{film.year}</p>}
              <p className="text-foreground/50 text-sm font-serif mt-2">{film.info}</p>
            </div>
          ))}
        </div>

        {/* TV */}
        <h3 className="text-xl font-heading text-foreground uppercase tracking-[0.1em] mb-6">TV-Serien &amp; Filme</h3>
        <div className="space-y-3">
          {TV_ROLES.map((role) => (
            <div
              key={role.title}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4 border rounded-[3px] transition-all ${
                role.highlight
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/30 bg-card/20 hover:border-primary/20"
              }`}
            >
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-foreground">{role.title}</span>
                {role.year && <span className="text-primary text-sm font-heading">{role.year}</span>}
              </div>
              {role.role && <span className="text-foreground/50 text-sm font-serif">{role.role}</span>}
            </div>
          ))}
        </div>
        <SerifText size="base" className="text-foreground/50 mt-6">
          Darüber hinaus zahlreiche Tatort- und Polizeiruf-110-Auftritte.
        </SerifText>
      </Section>

      {/* Theater */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Bühne</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">Theater</h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Sein Theaterdebüt in Deutschland gab Wanja Mues 2007 am Renaissance-Theater Berlin.
          Es folgten Engagements an renommierten Häusern.
        </SerifText>
        <div className="space-y-4 mb-6">
          <div className="card-glow rounded-[3px] p-5">
            <p className="font-heading text-foreground">„Männergespräche"</p>
            <p className="text-foreground/50 text-sm font-serif mt-1">
              Uraufführung mit Alexander Schröder und Ronald Zehrfeld
            </p>
          </div>
          <div className="card-glow rounded-[3px] p-5">
            <p className="font-heading text-foreground">„Heilig Abend" von Daniel Kehlmann</p>
            <p className="text-primary text-sm font-heading mt-1">2. INTHEGA-Preis „Die Neuberin"</p>
          </div>
          <div className="card-glow rounded-[3px] p-5">
            <p className="font-heading text-foreground">„Wir lieben und wissen nichts"</p>
            <p className="text-foreground/50 text-sm font-serif mt-1">
              Hamburger Kammerspiele – von Moritz Rinke
            </p>
          </div>
        </div>
      </Section>

      {/* Hörbuchsprecher */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Stimme</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">Hörbuchsprecher</h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Wanja Mues arbeitet regelmäßig als Hörbuchsprecher. Seine markante Stimme,
          die man aus dem Fernsehen kennt, verleiht Hörbüchern von Ian McEwan,
          Haruki Murakami und Christian Kracht besonderen Tiefgang.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70">
          Genau diese Stimmarbeit macht ihn zum idealen Interpreten für das{" "}
          <Link to="/live-hoerspiel" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
            Pater Brown Live-Hörspiel
          </Link>
          {" "}– wo er die Geschichten von{" "}
          <Link to="/pater-brown" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
            Pater Brown
          </Link>
          {" "}zum Leben erweckt.
        </SerifText>
      </Section>

      {/* Bühnenfoto Fullbleed */}
      <Section container="wide" className="py-20 md:py-32">
        <div className="card-glow rounded-[3px] overflow-hidden">
          <img
            src="/images/buehne/pater-brown-dialog-szene-monot-mues-af.webp"
            srcSet="/images/buehne/pater-brown-dialog-szene-monot-mues-af-480.webp 480w, /images/buehne/pater-brown-dialog-szene-monot-mues-af-768.webp 768w, /images/buehne/pater-brown-dialog-szene-monot-mues-af-1200.webp 1200w"
            sizes="(max-width: 768px) 100vw, 80vw"
            alt="Wanja Mues und Antoine Monot in einer Dialog-Szene des Pater Brown Live-Hörspiels"
            className="w-full aspect-[21/9] object-cover"
            loading="lazy"
          />
        </div>
      </Section>

      {/* Wanja Mues & Pater Brown */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Live auf der Bühne</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Wanja Mues &amp; Pater Brown
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Die Verbindung liegt nahe: Vom TV-Detektiv zum Hörspiel-Ermittler.
          In „Ein Fall für zwei" ermittelt Wanja Mues als Privatdetektiv Leo Oswald
          an der Seite von{" "}
          <Link to="/antoine-monot" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
            Antoine Monot
          </Link>
          . Im Pater Brown Live-Hörspiel stehen die beiden erneut gemeinsam auf der Bühne.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Was Mues zur Rolle bringt: jahrelange Erfahrung mit Krimirollen,
          professionelle Stimmarbeit als Hörbuchsprecher und eine Bühnenpräsenz,
          die das Publikum sofort in den Bann zieht.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Zusammen mit{" "}
          <Link to="/marvelin" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
            Beatboxer Marvelin
          </Link>
          , der alle Geräusche live mit dem Mund erzeugt, entsteht ein
          Krimi-Erlebnis, das es so nur auf der Bühne gibt.
        </SerifText>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <GhostButton href={EVENTIM_AFFILIATE_URL}>Tickets sichern</GhostButton>
          <GhostButton to="/termine" className="bg-transparent">Alle Termine</GhostButton>
        </div>
      </Section>

      {/* Engagement */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Engagement</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">Abseits der Bühne</h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
        <SerifText size="lg" className="text-foreground/70">
          Wanja Mues engagiert sich für den Verein „Orang-Utans in Not" und setzt sich
          aktiv für den Klimaschutz ein. Er lebt in Berlin.
        </SerifText>
      </Section>
    </LandingLayout>
  );
};

export default WanjaMues;
