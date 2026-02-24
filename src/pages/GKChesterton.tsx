import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import TicketCTA from "@/components/shared/TicketCTA";

const BREADCRUMBS = [
  { label: "Startseite", href: "/" },
  { label: "G.K. Chesterton" },
];

const WORKS = [
  { title: "The Innocence of Father Brown", year: "1911", desc: "Die erste Sammlung mit 12 Kurzgeschichten" },
  { title: "The Wisdom of Father Brown", year: "1914", desc: "Die zweite Sammlung" },
  { title: "The Incredulity of Father Brown", year: "1926", desc: "Die dritte Sammlung" },
  { title: "The Secret of Father Brown", year: "1927", desc: "Die vierte Sammlung" },
  { title: "The Scandal of Father Brown", year: "1935", desc: "Die fünfte und letzte Sammlung" },
];

const GKChesterton = () => {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Gilbert Keith Chesterton",
    alternateName: "G.K. Chesterton",
    url: "https://paterbrown.com/g-k-chesterton",
    image: "https://paterbrown.com/images/historisch/gk-chesterton-portrait-autor-father-brown-1200.webp",
    jobTitle: "Schriftsteller, Journalist, Apologet",
    birthDate: "1874-05-29",
    birthPlace: { "@type": "Place", name: "Kensington, London" },
    deathDate: "1936-06-14",
    deathPlace: { "@type": "Place", name: "Beaconsfield, Buckinghamshire" },
    description: "G.K. Chesterton (1874–1936): Britischer Schriftsteller und Erfinder der Figur Pater Brown. Autor von 49 Kurzgeschichten, ca. 80 Büchern und 4.000 Essays.",
    sameAs: ["https://de.wikipedia.org/wiki/Gilbert_Keith_Chesterton"],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: "https://paterbrown.com" },
      { "@type": "ListItem", position: 2, name: "G.K. Chesterton", item: "https://paterbrown.com/g-k-chesterton" },
    ],
  };

  return (
    <LandingLayout
      breadcrumbs={BREADCRUMBS}
      heroImage="/images/buehne/dd-dialog-nahaufnahme-intim.webp"
      heroTitle="G.K. Chesterton"
      heroSubtitle="Der Erfinder von Pater Brown (1874–1936)"
      heroObjectPosition="50% 35%"
      heroTextOffset={50}
      heroCTA
    >
      <SEO
        title="G.K. Chesterton – Der Erfinder von Pater Brown | paterbrown.com"
        description="Gilbert Keith Chesterton (1874-1936): Schriftsteller, Journalist und Erfinder von Pater Brown. Biografie, Werke und sein Einfluss auf die Kriminalliteratur."
        canonical="/g-k-chesterton"
        keywords="g.k. chesterton, g. k. chesterton, pater brown autor, chesterton bücher, father brown autor"
        ogImage="/images/og/g-k-chesterton-pater-brown-og.webp"
        schema={[personSchema, breadcrumbSchema]}
      />

      {/* Biografie */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Biografie</p>
            <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
              Der Autor
            </h2>
            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
            <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
              Gilbert Keith Chesterton wurde am 29. Mai 1874 in Kensington, London geboren.
              Er besuchte die St Paul's School und studierte an der Slade School of Art
              (Illustration) sowie Literatur am University College London – ohne Abschluss.
            </p>
            <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
              Von 1896 bis 1902 arbeitete er für Londoner Verlage als freiberuflicher
              Kunst- und Literaturkritiker. Ab 1900 wurde er freier Schriftsteller und
              einer der produktivsten Autoren seiner Zeit: ca. 80 Bücher, einige hundert
              Gedichte, ca. 200 Kurzgeschichten und ca. 4.000 Essays.
            </p>
            <p className="text-foreground/70 leading-relaxed text-lg font-light">
              1922 konvertierte er zum Katholizismus – begleitet von Father John O'Connor,
              dem realen Vorbild für{" "}
              <Link to="/pater-brown" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Pater Brown
              </Link>.
              1935 wurde er für den Nobelpreis für Literatur nominiert.
              Er starb am 14. Juni 1936 in Beaconsfield.
            </p>
          </div>
          <div className="relative overflow-hidden aspect-[4/5]">
            <img
              src="/images/historisch/gk-chesterton-portrait-autor-father-brown.webp"
              srcSet="/images/historisch/gk-chesterton-portrait-autor-father-brown-480.webp 480w, /images/historisch/gk-chesterton-portrait-autor-father-brown-768.webp 768w, /images/historisch/gk-chesterton-portrait-autor-father-brown-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="G.K. Chesterton – Portrait des Autors von Father Brown"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div></section>

      <TicketCTA variant="informative" />

      {/* Werk */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Werk</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Chestertons Werk
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
        <p className="text-foreground/70 leading-relaxed text-lg font-light mb-8">
          Seine bekannteste Schöpfung: Father Brown – 49 Kurzgeschichten, veröffentlicht
          in fünf Sammlungen zwischen 1911 und 1935. Daneben schrieb Chesterton Romane
          wie „Der Mann, der Donnerstag war" (1908), apologetische Werke wie „Orthodoxie"
          und „The Everlasting Man" (das C.S. Lewis' Konversion beeinflusste), sowie
          Biografien über Thomas von Aquin und Franz von Assisi.
        </p>

        <h3 className="font-heading text-foreground text-lg uppercase tracking-[0.1em] mb-4">
          Die fünf Father-Brown-Sammlungen
        </h3>
        <div className="space-y-3">
          {WORKS.map((work) => (
            <div key={work.year} className="border border-foreground/10 bg-card/10 p-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-heading text-foreground">{work.title}</p>
                <span className="text-gold text-sm font-heading whitespace-nowrap">{work.year}</span>
              </div>
              <p className="text-foreground/50 text-sm mt-1">{work.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-foreground/50 leading-relaxed text-base mt-6">
          Chesterton galt als „Meister des Paradoxen" – er spielte mit Lesererwartungen
          und überraschte mit brillanten Widersprüchen. Seine öffentlichen Dispute mit
          H.G. Wells, George Bernard Shaw und Bertrand Russell sind legendär.
        </p>
      </div></section>

      {/* Historische Fotos */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-6xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative overflow-hidden aspect-[3/4]">
            <img
              src="/images/historisch/gk-chesterton-1904-portrait-junger-autor.webp"
              srcSet="/images/historisch/gk-chesterton-1904-portrait-junger-autor-480.webp 480w, /images/historisch/gk-chesterton-1904-portrait-junger-autor-768.webp 768w"
              sizes="(max-width: 640px) 100vw, 33vw"
              alt="G.K. Chesterton 1904 – Portrait als junger Autor"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative overflow-hidden aspect-[3/4]">
            <img
              src="/images/historisch/gk-chesterton-bei-der-arbeit-schreibtisch.webp"
              srcSet="/images/historisch/gk-chesterton-bei-der-arbeit-schreibtisch-480.webp 480w, /images/historisch/gk-chesterton-bei-der-arbeit-schreibtisch-768.webp 768w"
              sizes="(max-width: 640px) 100vw, 33vw"
              alt="G.K. Chesterton bei der Arbeit am Schreibtisch"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative overflow-hidden aspect-[3/4]">
            <img
              src="/images/historisch/gk-chesterton-shaw-belloc-schriftsteller.webp"
              srcSet="/images/historisch/gk-chesterton-shaw-belloc-schriftsteller-480.webp 480w, /images/historisch/gk-chesterton-shaw-belloc-schriftsteller-768.webp 768w"
              sizes="(max-width: 640px) 100vw, 33vw"
              alt="G.K. Chesterton mit George Bernard Shaw und Hilaire Belloc"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div></section>

      {/* Chesterton und Pater Brown */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Die Figur</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Chesterton &amp; Pater Brown
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
        <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
          Father John O'Connor, ein katholischer Priester aus Yorkshire, war das
          reale Vorbild für Pater Brown. Chesterton war fasziniert davon, wie gut
          O'Connor die dunklen Seiten der menschlichen Natur verstand – obwohl er
          so mild und unscheinbar wirkte.
        </p>
        <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
          Pater Brown ist das Gegenteil von Sherlock Holmes: Nicht Logik, sondern
          Empathie. Brown löst Fälle, indem er sich in den Täter hineinversetzt –
          er versteht die Sünde, weil er die menschliche Natur kennt.
          Die Todsünden sind ein wiederkehrendes Motiv in Chestertons Geschichten.
        </p>
        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Mehr zur Figur und ihren Verfilmungen auf der{" "}
          <Link to="/pater-brown" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
            Pater-Brown-Übersichtsseite
          </Link>.
        </p>
      </div></section>

      {/* Zitate */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Stimmen</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Über Chesterton
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-12" aria-hidden="true" />
        <div className="space-y-12">
          <blockquote className="text-center">
            <p className="text-2xl md:text-3xl font-heading italic text-foreground/80 leading-snug">
              „Chesterton ist so heiter, dass man meinen könnte, er habe die Lösung gefunden."
            </p>
            <cite className="text-gold text-sm not-italic block mt-4 uppercase tracking-wider">
              — Franz Kafka
            </cite>
          </blockquote>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent max-w-[4rem] mx-auto" aria-hidden="true" />
          <blockquote className="text-center">
            <p className="text-2xl md:text-3xl font-heading italic text-foreground/80 leading-snug">
              „Chesterton war einer der wenigen wirklich großen Autoren unserer Zeit."
            </p>
            <cite className="text-gold text-sm not-italic block mt-4 uppercase tracking-wider">
              — Jorge Luis Borges
            </cite>
          </blockquote>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent max-w-[4rem] mx-auto" aria-hidden="true" />
          <blockquote className="text-center">
            <p className="text-2xl md:text-3xl font-heading italic text-foreground/80 leading-snug">
              „Er war der brillanteste Krimiautor seiner Generation."
            </p>
            <cite className="text-gold text-sm not-italic block mt-4 uppercase tracking-wider">
              — P.D. James
            </cite>
          </blockquote>
        </div>
      </div></section>

      <TicketCTA variant="concrete" />

      {/* Erbe heute */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Erbe</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Chestertons Erbe heute
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
        <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
          Chestertons Pater Brown lebt weiter – in Verfilmungen, Hörspielen und
          auf der Bühne. Die BBC-Serie „Father Brown" mit Mark Williams läuft
          seit 2013 erfolgreich. Die Maritim-Hörspiele sind Klassiker.
        </p>
        <p className="text-foreground/70 leading-relaxed text-lg font-light mb-8">
          Und jetzt gibt es das{" "}
          <Link to="/live-hoerspiel" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
            Pater Brown Live-Hörspiel
          </Link>
          {" "}– Chestertons Geschichten, live auf der Bühne, mit allen Geräuschen
          erzeugt durch{" "}
          <Link to="/marvelin" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
            Beatboxer Marvelin
          </Link>.
          Mehr zu den{" "}
          <Link to="/hoerspiel" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
            Pater-Brown-Hörspielen
          </Link>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer"><button className="btn-premium" type="button">Tickets sichern</button></a>
          <Link to="/termine" className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block">Alle Termine</Link>
        </div>
      </div></section>
    </LandingLayout>
  );
};

export default GKChesterton;
