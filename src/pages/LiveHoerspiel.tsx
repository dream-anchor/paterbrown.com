import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import FAQSection from "@/components/landing/FAQSection";
import CinematicPortrait from "@/components/CinematicPortrait";
import { SEO } from "@/components/SEO";
import { useIsMobile } from "@/hooks/use-mobile";
import marvelinImage from "@/assets/marvelin-v3.png";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

/* ─── FAQ Data ─── */
const FAQ_ITEMS = [
  {
    question: "Wie lange dauert die Show?",
    answer:
      "Die Gesamtdauer beträgt ca. 2 Stunden inklusive einer 15-minütigen Pause. Pro Halbzeit wird eine Kurzgeschichte nach G.K. Chesterton aufgeführt.",
  },
  {
    question: "Für welches Alter ist die Show geeignet?",
    answer:
      "Das Live-Hörspiel ist ab ca. 12 Jahren empfohlen. Es handelt sich um spannende Kriminalgeschichten mit Humor – ohne Gewaltdarstellung, aber mit Nervenkitzel.",
  },
  {
    question: "Was kostet ein Ticket?",
    answer:
      "Tickets sind ab 34,90 € (Deutschland) bzw. ab CHF 45 (Schweiz) erhältlich. Die genauen Preise variieren je nach Veranstaltungsort und Sitzplatzkategorie.",
  },
  {
    question: "Werden die Augen verbunden?",
    answer:
      "Nein. Das Publikum kann frei entscheiden, ob es die Augen schließt oder die Darsteller auf der Bühne beobachtet. Viele Zuschauer schließen die Augen, um sich ganz auf das Hörerlebnis zu konzentrieren.",
  },
  {
    question: "Welche Geschichten werden gespielt?",
    answer:
      "Pro Abend werden zwei Kurzgeschichten aus dem Werk von G.K. Chesterton aufgeführt. Das Ensemble hat mehrere Geschichten im Repertoire, sodass sich Wiederholungsbesuche lohnen.",
  },
  {
    question: "Wo kann ich Tickets kaufen?",
    answer:
      "Tickets sind über Eventim.de (Deutschland) und Ticketcorner.ch (Schweiz) erhältlich. Alternativ direkt an der Abendkasse der jeweiligen Spielstätte.",
  },
  {
    question: "Gibt es eine Pause?",
    answer:
      "Ja, zwischen den beiden Geschichten gibt es eine Pause von ca. 15 Minuten.",
  },
];

/* ─── Cast Data ─── */
const CAST = [
  {
    name: "Antoine Monot",
    role: "als Pater Brown",
    slug: "/antoine-monot",
    image: "/images/portraits/antoine-monot-portrait-pater-brown-gl",
    staticImage: false,
    bio: `Antoine Monot ist Schauspieler, Drehbuchautor und Produzent. Einem breiten Publikum wurde er als Rechtsanwalt Dr. Markus Lanz in der ZDF-Serie „Ein Fall für Zwei“ bekannt. Auf der Bühne schlüpft er in die Rolle des scharfsinnigen Pater Brown.`,
  },
  {
    name: "Wanja Mues",
    role: "als Flambeau",
    slug: "/wanja-mues",
    image: "/images/portraits/wanja-mues-portrait-pater-brown-gl",
    staticImage: false,
    bio: `Wanja Mues ist Schauspieler und Regisseur, bekannt als Privatdetektiv Matula in „Ein Fall für Zwei“. Im Live-Hörspiel verkörpert er den charmanten Meisterdieb Flambeau und spricht zahlreiche weitere Charaktere.`,
  },
  {
    name: "Marvelin",
    role: "Beatbox & Sound Design",
    slug: "/marvelin",
    image: marvelinImage,
    staticImage: true,
    bio: "Marvelin ist einer der besten Beatboxer Europas. Er erzeugt sämtliche Geräusche – von Schritten über Kirchenglocken bis hin zu Schüssen – ausschließlich live mit seinem Mund.",
  },
  {
    name: "Stefanie Sick",
    role: "Künstlerische Leitung",
    slug: "/stefanie-sick",
    image: "/images/portraits/stefanie-sick-kuenstlerische-leitung-pb",
    staticImage: false,
    bio: "Stefanie Sick verantwortet die künstlerische Leitung und Gesamtkonzeption. Sie adaptiert die Kurzgeschichten von G.K. Chesterton für die Bühne und ist für die dramaturgische Gestaltung verantwortlich.",
  },
];

/* ─── Pressestimmen ─── */
const QUOTES = [
  {
    text: "Ein einzigartiges Erlebnis! Die Augen schließen und nur zuhören – das war Gänsehaut pur.",
    citation: "Besucherin, Augsburg 2025",
  },
  {
    text: "Ich hätte nicht gedacht, dass Beatboxing so vielseitig sein kann. Marvelin erzeugt Geräusche, die man für echt hält.",
    citation: "Besucher, Bremen 2025",
  },
  {
    text: "Wanja Mues und Antoine Monot sind ein Traumduo. Die Chemie zwischen den beiden macht jede Vorstellung besonders.",
    citation: "Besucherin, Neu-Isenburg 2025",
  },
];

/* ─── Structured Data ─── */
const performingGroupSchema = {
  "@context": "https://schema.org",
  "@type": "PerformingGroup",
  name: "Pater Brown – Das Live-Hörspiel",
  description:
    "Live-Hörspiel-Ensemble bestehend aus Antoine Monot, Wanja Mues und Beatboxer Marvelin. Krimis nach G.K. Chesterton, live auf der Bühne.",
  url: "https://paterbrown.com/live-hoerspiel",
  member: [
    {
      "@type": "Person",
      name: "Antoine Monot",
      roleName: "Pater Brown",
      sameAs: [
        "https://de.wikipedia.org/wiki/Antoine_Monot",
        "https://www.imdb.com/name/nm0598741/",
      ],
    },
    {
      "@type": "Person",
      name: "Wanja Mues",
      roleName: "Flambeau",
      sameAs: [
        "https://de.wikipedia.org/wiki/Wanja_Mues",
        "https://www.imdb.com/name/nm0611635/",
      ],
    },
    {
      "@type": "Person",
      name: "Marvelin",
      roleName: "Beatbox & Sound Design",
    },
  ],
};

/* ─── Page Component ─── */
const LiveHoerspiel = () => (
  <LandingLayout
    breadcrumbs={[{ label: "Live-Hörspiel" }]}
    variant="immersive"
    showCTA
  >
    <SEO
      title="PATER BROWN – Das Live-Hörspiel | Antoine Monot & Wanja Mues"
      description="Erleben Sie Pater Brown als Live-Hörspiel! Antoine Monot, Wanja Mues & Beatboxer Marvelin bringen Chestertons Krimis auf die Bühne. Jetzt Tickets sichern!"
      canonical="/live-hoerspiel"
      keywords="pater brown live hörspiel, live hörspiel, pater brown theaterstück, pater brown das live hörspiel, hörspiel live erleben"
      ogTitle="PATER BROWN – Das Live-Hörspiel | Auf Tour"
      ogDescription="Antoine Monot, Wanja Mues & Beatboxer Marvelin bringen Chestertons Krimis als Live-Hörspiel auf die Bühne."
      ogImage="/images/og/pater-brown-live-hoerspiel-buehne-og.webp"
      schema={performingGroupSchema}
    />

    {/* ── SECTION 1: HERO ── */}
    <section className="relative min-h-screen flex items-end justify-center overflow-hidden pb-12 md:pb-16">
      <div className="absolute inset-0">
        <img
          src="/images/hero/pater-brown-live-hoerspiel-buehne-totale-af-1200.webp"
          srcSet={[
            "/images/hero/pater-brown-live-hoerspiel-buehne-totale-af-480.webp 480w",
            "/images/hero/pater-brown-live-hoerspiel-buehne-totale-af-768.webp 768w",
            "/images/hero/pater-brown-live-hoerspiel-buehne-totale-af-1200.webp 1200w",
            "/images/hero/pater-brown-live-hoerspiel-buehne-totale-af.webp 2000w",
          ].join(", ")}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-bottom"
          loading="eager"
          decoding="async"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-[1]" />

      {/* Hero Content — unten positioniert */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="cinematic-enter max-w-5xl">
          <p className="neon-gold-subtle text-xs md:text-sm uppercase tracking-[0.4em] mb-6 cinematic-enter" style={{ animationDelay: '0.1s' }}>
            Das Format
          </p>
          <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[11rem] font-heading leading-[0.85] tracking-tight uppercase cinematic-enter neon-gold neon-breathe" style={{ animationDelay: '0.2s' }}>
            Das Live-Hörspiel
          </h1>
          <p className="text-lg md:text-xl text-foreground/50 font-light mt-8 tracking-wide cinematic-enter" style={{ animationDelay: '0.4s' }}>
            Schließen Sie die Augen – und erleben Sie Krimi pur.
          </p>
        </div>

        {/* CTA Button (wie Startseite) */}
        <div className="mt-12 cinematic-enter" style={{ animationDelay: '0.6s' }}>
          <a
            href={EVENTIM_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              className="text-sm md:text-base uppercase tracking-[0.25em] font-semibold px-10 md:px-14 py-4 md:py-5 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300"
              type="button"
            >
              Tickets sichern
            </button>
          </a>
        </div>
      </div>

    </section>

    {/* ── SECTION 2: DAS KONZEPT ── */}
    <section className="py-28 md:py-36 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-24">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium">Das Konzept</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] font-heading text-foreground leading-[0.85]">
            Was ist ein Live-Hörspiel?
          </h2>
        </div>

        <div className="space-y-6 max-w-3xl mx-auto">
          <p className="text-xl md:text-2xl text-foreground/70 font-light leading-relaxed">
            Ein Live-Hörspiel verbindet die Intimität eines Hörspiels mit der
            Unmittelbarkeit von Live-Theater. Im Gegensatz zu einem klassischen
            Theaterstück steht nicht das visuelle Bühnenbild im Vordergrund,
            sondern das{" "}
            <strong className="text-foreground">akustische Erlebnis</strong>.
          </p>
          <p className="text-xl md:text-2xl text-foreground/70 font-light leading-relaxed">
            Der entscheidende Unterschied zu einem Hörspiel von CD oder aus dem
            Radio: Alles passiert{" "}
            <strong className="text-foreground">live und ungeschnitten</strong>.
            Es gibt keinen zweiten Take, keine Nachbearbeitung, kein Playback.
            Jede Vorstellung ist einzigartig.
          </p>
          <p className="text-xl md:text-2xl text-foreground/70 font-light leading-relaxed">
            Viele Zuschauer schließen während der Vorstellung die Augen, um
            sich ganz auf das Hörerlebnis zu konzentrieren. So entstehen eigene
            Bilder im Kopf – lebendiger als jedes Bühnenbild.
          </p>
        </div>
      </div>
    </section>

    {/* ── SECTION 3: DIE SHOW ── */}
    <section className="py-28 md:py-36 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-24">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium">Die Show</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] font-heading text-foreground leading-[0.85]">
            Das Programm
          </h2>
        </div>

        <CinematicPortrait
          src="/images/buehne/pater-brown-dialog-szene-monot-mues-af-1200.webp"
          srcSet="/images/buehne/pater-brown-dialog-szene-monot-mues-af-480.webp 480w, /images/buehne/pater-brown-dialog-szene-monot-mues-af-768.webp 768w, /images/buehne/pater-brown-dialog-szene-monot-mues-af-1200.webp 1200w"
          sizes="(max-width: 768px) 90vw, 1200px"
          alt="Antoine Monot und Wanja Mues in einer Dialogszene des Pater Brown Live-Hörspiels"
          aspectRatio="aspect-[21/9]"
          objectPosition="50% 50%"
          fadeEdges
          className="mb-16"
        />

        <div className="space-y-4 max-w-3xl mx-auto">
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            <strong className="text-foreground">
              Zwei spannende Kriminalgeschichten
            </strong>{" "}
            nach dem britischen Autor{" "}
            <Link
              to="/g-k-chesterton"
              className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
            >
              G.K. Chesterton
            </Link>{" "}
            bilden den Kern jeder Vorstellung. Die Kurzgeschichten rund um den
            scharfsinnigen{" "}
            <Link
              to="/pater-brown"
              className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
            >
              Pater Brown
            </Link>{" "}
            und seinen Gegenspieler Flambeau gehören zu den Klassikern der
            Kriminalliteratur.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Jede Vorstellung dauert ca.{" "}
            <strong className="text-foreground">
              2 Stunden inklusive Pause
            </strong>
            . Das Ensemble hat mehrere Geschichten im Repertoire –
            Wiederholungsbesuche lohnen sich. Tickets ab{" "}
            <strong className="text-foreground">34,90 €</strong>.
          </p>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/termine"
            className="text-sm md:text-base uppercase tracking-[0.25em] font-semibold px-10 md:px-14 py-4 md:py-5 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block"
          >
            Alle Termine & Tickets
          </Link>
        </div>
      </div>
    </section>

    {/* ── SECTION 4: ENSEMBLE ── */}
    <section className="py-28 md:py-36 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-24">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium">Das Ensemble</p>
          <h2 className="text-6xl sm:text-7xl md:text-[8rem] lg:text-[10rem] font-heading text-foreground leading-[0.85]">
            Die Besetzung
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 max-w-6xl mx-auto">
          {CAST.map((member) => (
            <Link
              key={member.slug}
              to={member.slug}
              className="block group"
            >
              <CinematicPortrait
                src={member.staticImage ? member.image : `${member.image}-768.webp`}
                {...(!member.staticImage && {
                  srcSet: [
                    `${member.image}-300.webp 300w`,
                    `${member.image}-480.webp 480w`,
                    `${member.image}-768.webp 768w`,
                    `${member.image}-1200.webp 1200w`,
                  ].join(", "),
                  sizes: "(max-width: 768px) 100vw, 50vw",
                })}
                alt={`${member.name} – ${member.role}`}
                hoverScale
                showOverlay
                className="mb-8"
              />
              <div className="relative z-10 -mt-24 px-4">
                <h3 className="text-4xl md:text-6xl font-heading text-foreground mb-2">
                  {member.name}
                </h3>
                <p className="text-lg text-gold tracking-[0.2em] uppercase font-medium">
                  {member.role}
                </p>
                <p className="text-muted-foreground mt-4 text-base leading-relaxed max-w-md">
                  {member.bio}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* ── SECTION 5: TRAILER ── */}
    <TrailerInline />

    {/* ── SECTION 6: SOUNDDESIGN ── */}
    <section className="py-28 md:py-36 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
          <CinematicPortrait
            src="/images/buehne/pater-brown-buehne-ensemble-marvelin-af-1200.webp"
            srcSet="/images/buehne/pater-brown-buehne-ensemble-marvelin-af-480.webp 480w, /images/buehne/pater-brown-buehne-ensemble-marvelin-af-768.webp 768w, /images/buehne/pater-brown-buehne-ensemble-marvelin-af-1200.webp 1200w"
            sizes="(max-width: 768px) 100vw, 55vw"
            alt="Beatboxer Marvelin erzeugt live alle Soundeffekte im Pater Brown Live-Hörspiel"
            aspectRatio="aspect-[3/4]"
            objectPosition="50% 50%"
            fadeEdges
          />

          <div>
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium">Sounddesign</p>
            <h2 className="text-5xl sm:text-6xl md:text-[8rem] font-heading text-foreground leading-[0.85] mb-8">
              Beatboxing als Bühnenkunst
            </h2>
            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" />

            <div className="space-y-4">
              <p className="text-foreground/70 leading-relaxed text-lg font-light">
                Das Besondere an diesem Live-Hörspiel: Es gibt{" "}
                <strong className="text-foreground">
                  kein Tonstudio, keine Einspieler, kein Playback
                </strong>
                . Jedes Geräusch entsteht in Echtzeit – erzeugt von Marvelins
                Stimme und einer Loop-Station.
              </p>
              <p className="text-foreground/70 leading-relaxed text-lg font-light">
                Ob das leise Knirschen von Schritten auf einem Kiesweg, das
                Knarren einer alten Kirchentür, das Prasseln eines englischen
                Regenschauers oder der dumpfe Knall eines Schusses – Marvelin
                erschafft jedes Detail mit seinem Mund.
              </p>
              <p className="text-foreground/70 leading-relaxed text-lg font-light">
                Für das Publikum entsteht ein Klangerlebnis, das einem
                professionell produzierten Hörspiel in nichts nachsteht – mit dem
                entscheidenden Unterschied, dass alles live und sichtbar passiert.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── SECTION 7: PRESSESTIMMEN ── */}
    <section className="py-28 md:py-36 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-24">
          <blockquote className="text-3xl md:text-5xl lg:text-6xl font-heading italic text-foreground/90 leading-tight max-w-4xl mx-auto">
            „Ein Abend voller Spannung, Humor und Gänsehaut."
          </blockquote>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent max-w-md mx-auto mt-10 mb-6" />
          <p className="text-gold text-sm uppercase tracking-[0.3em]">Was Besucher sagen</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {QUOTES.map((quote, index) => (
            <blockquote
              key={index}
              className="p-8 border border-foreground/10 bg-card/10 space-y-5 transition-colors hover:border-gold/20"
            >
              <p className="text-foreground/80 leading-relaxed text-lg font-light">
                „{quote.text}"
              </p>
              <cite className="text-gold text-sm not-italic block mt-4 uppercase tracking-wider">
                — {quote.citation}
              </cite>
            </blockquote>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href={EVENTIM_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="btn-premium" type="button">
              Jetzt Tickets sichern
            </button>
          </a>
        </div>
      </div>
    </section>

    {/* ── SECTION 8: FAQ ── */}
    <section className="py-28 md:py-36 px-6">
      <div className="container mx-auto max-w-4xl">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </section>
  </LandingLayout>
);

/* ─── Inline Trailer Section ─── */
const TrailerInline = () => {
  const isMobile = useIsMobile();

  return (
    <section className="py-28 md:py-36 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center space-y-6 mb-16">
          <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium">
            Exklusiver Einblick
          </p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] font-heading text-foreground leading-[0.85]">
            Erlebe Pater Brown
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent max-w-md mx-auto" />
        </div>

        <div className="relative overflow-hidden shadow-2xl border border-foreground/10">
          {isMobile ? (
            <div className="relative w-full max-w-sm mx-auto" style={{ paddingTop: "177.78%" }}>
              <iframe
                src="https://player.vimeo.com/video/1146186958?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Pater Brown Trailer"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                src="https://player.vimeo.com/video/1146186984?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Pater Brown Trailer 16x9 mit UT"
                loading="lazy"
              />
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <a
            href={EVENTIM_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="btn-premium" type="button">
              Jetzt Tickets sichern
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default LiveHoerspiel;
