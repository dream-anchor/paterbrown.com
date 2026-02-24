import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";

import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const BREADCRUMBS = [
  { label: "Startseite", href: "/" },
  { label: "Wanja Mues" },
];

const FILMOGRAPHY = [
  { title: "Der Pianist", year: "2001", info: "Regie: Roman Polański – neben Adrien Brody (Oscar-prämiert)" },
  { title: "Die Bourne Verschwörung", year: "2004", info: "neben Matt Damon" },
  { title: "Yella", year: "2007", info: "Regie: Christian Petzold – neben Nina Hoss" },
  { title: "Blueprint", year: "2004", info: "neben Franka Potente" },
  { title: "Mein letzter Film", year: "", info: "Regie: Oliver Hirschbiegel – mit Hannelore Elsner" },
];

const TV_ROLES = [
  { title: "Ein Fall für zwei", year: "seit 2014", role: "Privatdetektiv Leo Oswald", highlight: true },
  { title: "Stubbe – Von Fall zu Fall", year: "2009–2014/2025", role: "Helge Kleinert" },
  { title: "Tage, die es nicht gab", year: "2022/2025", role: "ORF/ARD" },
  { title: "Martha Liebermann – Ein gestohlenes Leben", year: "2022", role: "TV-Film" },
  { title: "Dürer", year: "2021", role: "Albrecht Dürer – neben Hannah Herzsprung" },
  { title: "Unsere Hagenbecks", year: "1991–1994", role: "" },
  { title: "GSG 9 – Die Elite-Einheit", year: "", role: "" },
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
    description: "Wanja Mues ist ein deutscher Schauspieler, bekannt aus ZDF Ein Fall für zwei und dem Pater Brown Live-Hörspiel.",
    performerIn: {
      "@type": "TheaterEvent",
      name: "Pater Brown – Das Live-Hörspiel",
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
      heroImage="/images/buehne/wanja-mues-portrait-gl.webp"
      heroTitle="Wanja Mues"
      heroSubtitle="Schauspieler, Hörbuchsprecher, Bühnenkünstler"
      variant="portrait"
    >
      <SEO
        title={`Wanja Mues als Pater Brown – Der Star aus „Ein Fall für zwei“ live | paterbrown.com`}
        description={`Wanja Mues bringt Pater Brown als Live-Hörspiel auf die Bühne. Der Schauspieler aus „Ein Fall für zwei“ & „Der Pianist“ in einer neuen Rolle. Termine & Tickets.`}
        canonical="/wanja-mues"
        keywords="pater brown wanja mues, wanja mues pater brown, wanja mues, wanja mues schauspieler"
        ogImage="/images/og/wanja-mues-schauspieler-og.webp"
        schema={[personSchema, breadcrumbSchema]}
      />

      {/* Biografie */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
            <div>
              <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Biografie</p>
              <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
                Der Schauspieler
              </h2>
              <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
              <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
                Wanja Mues wurde am 27. Dezember 1973 in Hamburg geboren – in eine Familie,
                der die Kunst im Blut liegt. Sein Vater Dietmar Mues war Schauspieler,
                Drehbuchautor und Schriftsteller. Seine Brüder Jona (Schauspieler) und
                Woody (Regisseur) sind ebenfalls in der Branche.
              </p>
              <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
                Seine Schauspielausbildung absolvierte Mues am renommierten Actors' Studio
                MFA-Program in New York (Robert Lewis Theatre Workshop). Von 1993 bis 1999
                lebte er in den USA und stand auf den Theaterbühnen New Yorks.
              </p>
              <p className="text-foreground/70 leading-relaxed text-lg font-light">
                Seinen ersten Auftritt vor der Kamera hatte er 1986 als 13-Jähriger in
                „Jokehnen" neben Armin Mueller-Stahl.
              </p>
            </div>
            <div className="overflow-hidden border border-foreground/10">
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
        </div>
      </section>

      {/* Film & Fernsehen */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-6xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Karriere</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
            Film &amp; Fernsehen
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-12" aria-hidden="true" />

          {/* Kino */}
          <h3 className="text-xl font-heading text-foreground uppercase tracking-[0.1em] mb-6">Internationale Kinofilme</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {FILMOGRAPHY.map((film) => (
              <div key={film.title} className="border border-foreground/10 p-5">
                <p className="font-heading text-foreground text-lg">{film.title}</p>
                {film.year && <p className="text-gold text-sm font-heading mt-1">{film.year}</p>}
                <p className="text-foreground/50 text-sm mt-2">{film.info}</p>
              </div>
            ))}
          </div>

          {/* TV */}
          <h3 className="text-xl font-heading text-foreground uppercase tracking-[0.1em] mb-6">TV-Serien &amp; Filme</h3>
          <div className="space-y-3">
            {TV_ROLES.map((role) => (
              <div
                key={role.title}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4 border transition-all ${
                  role.highlight
                    ? "border-gold/40 bg-gold/5"
                    : "border-border/30 bg-card/20 hover:border-gold/20"
                }`}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-heading text-foreground">{role.title}</span>
                  {role.year && <span className="text-gold text-sm font-heading">{role.year}</span>}
                </div>
                {role.role && <span className="text-foreground/50 text-sm">{role.role}</span>}
              </div>
            ))}
          </div>
          <p className="text-foreground/50 leading-relaxed text-base mt-6">
            Darüber hinaus zahlreiche Tatort- und Polizeiruf-110-Auftritte.
          </p>
        </div>
      </section>

      {/* Theater */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Bühne</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">Theater</h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Sein Theaterdebüt in Deutschland gab Wanja Mues 2007 am Renaissance-Theater Berlin.
            Es folgten Engagements an renommierten Häusern.
          </p>
          <div className="space-y-4 mb-6">
            <div className="border border-foreground/10 p-5">
              <p className="font-heading text-foreground">„Männergespräche"</p>
              <p className="text-foreground/50 text-sm mt-1">
                Uraufführung mit Alexander Schröder und Ronald Zehrfeld
              </p>
            </div>
            <div className="border border-foreground/10 p-5">
              <p className="font-heading text-foreground">„Heilig Abend" von Daniel Kehlmann</p>
              <p className="text-gold text-sm font-heading mt-1">2. INTHEGA-Preis „Die Neuberin"</p>
            </div>
            <div className="border border-foreground/10 p-5">
              <p className="font-heading text-foreground">„Wir lieben und wissen nichts"</p>
              <p className="text-foreground/50 text-sm mt-1">
                Hamburger Kammerspiele – von Moritz Rinke
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hörbuchsprecher */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Stimme</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">Hörbuchsprecher</h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Wanja Mues arbeitet regelmäßig als Hörbuchsprecher. Seine markante Stimme,
            die man aus dem Fernsehen kennt, verleiht Hörbüchern von Ian McEwan,
            Haruki Murakami und Christian Kracht besonderen Tiefgang.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Genau diese Stimmarbeit macht ihn zum idealen Interpreten für das{" "}
            <Link to="/live-hoerspiel" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Pater Brown Live-Hörspiel
            </Link>
            {" "}– wo er die Geschichten von{" "}
            <Link to="/pater-brown" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Pater Brown
            </Link>
            {" "}zum Leben erweckt.
          </p>
        </div>
      </section>

      {/* Bühnenfoto Fullbleed */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="overflow-hidden border border-foreground/10">
            <img
              src="/images/buehne/pater-brown-dialog-szene-monot-mues-af.webp"
              srcSet="/images/buehne/pater-brown-dialog-szene-monot-mues-af-480.webp 480w, /images/buehne/pater-brown-dialog-szene-monot-mues-af-768.webp 768w, /images/buehne/pater-brown-dialog-szene-monot-mues-af-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 80vw"
              alt="Wanja Mues und Antoine Monot in einer Dialog-Szene des Pater Brown Live-Hörspiels"
              className="w-full aspect-[21/9] object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Wanja Mues & Pater Brown */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Live auf der Bühne</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
            Wanja Mues &amp; Pater Brown
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Die Verbindung liegt nahe: Vom TV-Detektiv zum Hörspiel-Ermittler.
            In „Ein Fall für zwei" ermittelt Wanja Mues als Privatdetektiv Leo Oswald
            an der Seite von{" "}
            <Link to="/antoine-monot" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Antoine Monot
            </Link>
            . Im Pater Brown Live-Hörspiel stehen die beiden erneut gemeinsam auf der Bühne.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Was Mues zur Rolle bringt: jahrelange Erfahrung mit Krimirollen,
            professionelle Stimmarbeit als Hörbuchsprecher und eine Bühnenpräsenz,
            die das Publikum sofort in den Bann zieht.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Zusammen mit{" "}
            <Link to="/marvelin" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Beatboxer Marvelin
            </Link>
            , der alle Geräusche live mit dem Mund erzeugt, entsteht ein
            Krimi-Erlebnis, das es so nur auf der Bühne gibt.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer"><button className="btn-premium" type="button">Tickets sichern</button></a>
            <Link to="/termine" className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block">Alle Termine</Link>
          </div>
        </div>
      </section>

      {/* Engagement */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Engagement</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">Abseits der Bühne</h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Wanja Mues engagiert sich für den Verein „Orang-Utans in Not" und setzt sich
            aktiv für den Klimaschutz ein. Er lebt in Berlin.
          </p>
        </div>
      </section>
    </LandingLayout>
  );
};

export default WanjaMues;
