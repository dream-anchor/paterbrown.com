import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import FAQSection from "@/components/landing/FAQSection";
import ResponsiveImage from "@/components/landing/ResponsiveImage";
import Section from "@/components/ui/Section";
import SerifText from "@/components/ui/SerifText";
import GhostButton from "@/components/ui/GhostButton";
import Quote from "@/components/ui/Quote";
import { SEO } from "@/components/SEO";
import { useIsMobile } from "@/hooks/use-mobile";
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
    imageWidth: 2000,
    imageHeight: 2852,
    credit: "Gio Löwe",
    bio: `Antoine Monot ist Schauspieler, Drehbuchautor und Produzent. Einem breiten Publikum wurde er als Rechtsanwalt Dr. Markus Lanz in der ZDF-Serie \u201EEin Fall für Zwei\u201C bekannt. Auf der Bühne schlüpft er in die Rolle des scharfsinnigen Pater Brown.`,
  },
  {
    name: "Wanja Mues",
    role: "als Flambeau",
    slug: "/wanja-mues",
    image: "/images/portraits/wanja-mues-portrait-pater-brown-gl",
    imageWidth: 2000,
    imageHeight: 2852,
    credit: "Gio Löwe",
    bio: `Wanja Mues ist Schauspieler und Regisseur, bekannt als Privatdetektiv Matula in \u201EEin Fall für Zwei\u201C. Im Live-Hörspiel verkörpert er den charmanten Meisterdieb Flambeau und spricht zahlreiche weitere Charaktere.`,
  },
  {
    name: "Marvelin",
    role: "Beatbox & Sound Design",
    slug: "/marvelin",
    image: "/images/buehne/pater-brown-buehne-ensemble-marvelin-af",
    imageWidth: 2000,
    imageHeight: 2666,
    credit: "Alexander Frank",
    bio: "Marvelin ist einer der besten Beatboxer Europas. Er erzeugt sämtliche Geräusche – von Schritten über Kirchenglocken bis hin zu Schüssen – ausschließlich live mit seinem Mund.",
  },
  {
    name: "Stefanie Sick",
    role: "Künstlerische Leitung & Regie",
    slug: "/stefanie-sick",
    image: "/images/portraits/stefanie-sick-kuenstlerische-leitung-pb",
    imageWidth: 1024,
    imageHeight: 1536,
    credit: undefined,
    bio: "Stefanie Sick ist die künstlerische Leiterin und Regisseurin. Sie adaptiert die Kurzgeschichten von G.K. Chesterton für die Bühne und ist für die dramaturgische Gestaltung verantwortlich.",
  },
];

/* ─── Pressestimmen ─── */
const QUOTES = [
  {
    text: "Ein einzigartiges Erlebnis! Die Augen schließen und nur zuhören – das war Gänsehaut pur.",
    citation: "Besucherin, München 2025",
  },
  {
    text: "Ich hätte nicht gedacht, dass Beatboxing so vielseitig sein kann. Marvelin erzeugt Geräusche, die man für echt hält.",
    citation: "Besucher, Hamburg 2025",
  },
  {
    text: "Wanja Mues und Antoine Monot sind ein Traumduo. Die Chemie zwischen den beiden macht jede Vorstellung besonders.",
    citation: "Besucherin, Köln 2025",
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

/* ─── Hero Background Video ─── */
const HeroVideo = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <img
        src="/images/hero/pater-brown-live-hoerspiel-buehne-totale-af-1200.webp"
        alt=""
        aria-hidden="true"
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <iframe
      src="https://player.vimeo.com/video/1146186984?background=1&autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0"
      className="absolute inset-0 w-full h-full"
      style={{ transform: "scale(1.2)" }}
      frameBorder="0"
      allow="autoplay; fullscreen"
      loading="eager"
      title=""
      aria-hidden="true"
    />
  );
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

    {/* ── SECTION 1: HERO (Fullscreen Video) ── */}
    <section className="relative min-h-screen flex items-end justify-center overflow-hidden pb-24 md:pb-32">
      <div className="hero-video-bg">
        <HeroVideo />
      </div>
      <div className="absolute inset-0 hero-fade-full z-[1]" />

      <div
        className="relative z-10 text-center px-6 max-w-4xl mx-auto cinematic-enter"
        style={{ animationDelay: "0.3s" }}
      >
        <p className="text-primary uppercase tracking-[0.3em] text-xs font-heading mb-6">
          Das Format
        </p>
        <h1 className="text-5xl sm:text-7xl md:text-[6rem] lg:text-[8rem] font-heading text-foreground uppercase leading-[0.9] mb-8">
          Das Live-Hörspiel
        </h1>
        <SerifText size="xl" className="text-foreground/80 max-w-2xl mx-auto mb-12">
          Schließen Sie die Augen – und erleben Sie Krimi pur.
          <br className="hidden sm:block" />
          Zwei Schauspieler, ein Beatboxer, kein Playback.
        </SerifText>
        <GhostButton href={EVENTIM_AFFILIATE_URL} size="lg">
          Tickets sichern
        </GhostButton>
      </div>
    </section>

    {/* ── SECTION 2: DAS KONZEPT ── */}
    <Section container="narrow" className="py-20 md:py-32">
      <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
        Das Konzept
      </p>
      <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground mb-4">
        Was ist ein Live-Hörspiel?
      </h2>
      <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />

      <div className="space-y-6">
        <SerifText size="lg" className="text-foreground/70">
          Ein Live-Hörspiel verbindet die Intimität eines Hörspiels mit der
          Unmittelbarkeit von Live-Theater. Im Gegensatz zu einem klassischen
          Theaterstück steht nicht das visuelle Bühnenbild im Vordergrund,
          sondern das{" "}
          <strong className="text-foreground">akustische Erlebnis</strong>.
          Die Darsteller erzeugen vor den Augen des Publikums eine komplette
          Klangwelt – mit Stimme, Geräuschen und Musik.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70">
          Der entscheidende Unterschied zu einem Hörspiel von CD oder aus dem
          Radio: Alles passiert{" "}
          <strong className="text-foreground">live und ungeschnitten</strong>.
          Es gibt keinen zweiten Take, keine Nachbearbeitung, kein Playback.
          Jede Vorstellung ist einzigartig.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70">
          Viele Zuschauer schließen während der Vorstellung die Augen, um
          sich ganz auf das Hörerlebnis zu konzentrieren. So entstehen eigene
          Bilder im Kopf – lebendiger als jedes Bühnenbild.
        </SerifText>
      </div>
    </Section>

    {/* ── SECTION 3: DIE SHOW (Asymmetrisch) ── */}
    <Section container="wide" className="py-20 md:py-32">
      <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
        <div>
          <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
            Die Show
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground mb-4">
            Pater Brown – Das Live-Hörspiel
          </h2>
          <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />

          <div className="space-y-4">
            <SerifText size="lg" className="text-foreground/70">
              <strong className="text-foreground">
                Zwei spannende Kriminalgeschichten
              </strong>{" "}
              nach dem britischen Autor{" "}
              <Link
                to="/g-k-chesterton"
                className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                G.K. Chesterton
              </Link>{" "}
              bilden den Kern jeder Vorstellung. Die Kurzgeschichten rund um den
              scharfsinnigen{" "}
              <Link
                to="/pater-brown"
                className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                Pater Brown
              </Link>{" "}
              und seinen Gegenspieler Flambeau gehören zu den Klassikern der
              Kriminalliteratur.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70">
              Jede Vorstellung dauert ca.{" "}
              <strong className="text-foreground">
                2 Stunden inklusive Pause
              </strong>
              . Das Ensemble hat mehrere Geschichten im Repertoire –
              Wiederholungsbesuche lohnen sich. Tickets ab{" "}
              <strong className="text-foreground">34,90 €</strong>.
            </SerifText>
          </div>

          <div className="mt-8">
            <GhostButton to="/termine">Alle Termine & Tickets</GhostButton>
          </div>
        </div>

        <div className="card-glow rounded-[3px] overflow-hidden">
          <ResponsiveImage
            basePath="/images/buehne/pater-brown-dialog-szene-monot-mues-af"
            alt="Antoine Monot und Wanja Mues in einer Dialogszene des Pater Brown Live-Hörspiels"
            width={2000}
            height={1500}
            sizes="(max-width: 768px) 88vw, 55vw"
            credit="Alexander Frank"
          />
        </div>
      </div>
    </Section>

    {/* ── SECTION 4: ENSEMBLE (2x2 Grid) ── */}
    <Section container="wide" className="py-20 md:py-32">
      <div className="text-center mb-12">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
          Ensemble
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground">
          Die Besetzung
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {CAST.map((member) => (
          <Link
            key={member.slug}
            to={member.slug}
            className="card-glow rounded-[3px] overflow-hidden block group"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={`${member.image}-768.webp`}
                srcSet={[
                  `${member.image}-300.webp 300w`,
                  `${member.image}-480.webp 480w`,
                  `${member.image}-768.webp 768w`,
                  `${member.image}-1200.webp 1200w`,
                ].join(", ")}
                sizes="(max-width: 768px) 88vw, 45vw"
                alt={`${member.name} – ${member.role}`}
                width={member.imageWidth}
                height={member.imageHeight}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="text-3xl md:text-4xl font-heading tracking-wider text-foreground uppercase">
                  {member.name}
                </h3>
                <p className="text-primary text-sm uppercase tracking-widest mt-1">
                  {member.role}
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <SerifText className="text-foreground/70">
                {member.bio}
              </SerifText>
              {member.credit && (
                <p className="text-foreground/30 text-xs mt-3">
                  Foto: {member.credit}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </Section>

    {/* ── SECTION 5: TRAILER (Video mit Glow-Border) ── */}
    <TrailerInline />

    {/* ── SECTION 6: SOUNDDESIGN (Asymmetrisch, gespiegelt) ── */}
    <Section container="wide" className="py-20 md:py-32">
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
        <div className="card-glow rounded-[3px] overflow-hidden">
          <ResponsiveImage
            basePath="/images/buehne/pater-brown-buehne-ensemble-marvelin-af"
            alt="Beatboxer Marvelin erzeugt live alle Soundeffekte im Pater Brown Live-Hörspiel"
            width={2000}
            height={2666}
            sizes="(max-width: 768px) 88vw, 55vw"
            credit="Alexander Frank"
          />
        </div>

        <div>
          <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
            Sounddesign
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground mb-4">
            Beatboxing als Bühnenkunst
          </h2>
          <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />

          <div className="space-y-4">
            <SerifText size="lg" className="text-foreground/70">
              Das Besondere an diesem Live-Hörspiel: Es gibt{" "}
              <strong className="text-foreground">
                kein Tonstudio, keine Einspieler, kein Playback
              </strong>
              . Jedes Geräusch entsteht in Echtzeit – erzeugt von Marvelins
              Stimme und einer Loop-Station.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70">
              Ob das leise Knirschen von Schritten auf einem Kiesweg, das
              Knarren einer alten Kirchentür, das Prasseln eines englischen
              Regenschauers oder der dumpfe Knall eines Schusses – Marvelin
              erschafft jedes Detail mit seinem Mund.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70">
              Für das Publikum entsteht ein Klangerlebnis, das einem
              professionell produzierten Hörspiel in nichts nachsteht – mit dem
              entscheidenden Unterschied, dass alles live und sichtbar passiert.
            </SerifText>
          </div>
        </div>
      </div>
    </Section>

    {/* ── SECTION 7: PRESSESTIMMEN (Cinematic Blockquotes) ── */}
    <Section container="narrow" className="py-20 md:py-32">
      <div className="text-center mb-12">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
          Stimmen
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground">
          Was Besucher sagen
        </h2>
      </div>

      <div className="space-y-16">
        {QUOTES.map((quote, index) => (
          <div
            key={index}
            className="cinematic-enter"
            style={{ animationDelay: `${index * 250}ms` }}
          >
            <Quote text={quote.text} citation={quote.citation} />
            {index < QUOTES.length - 1 && (
              <div className="divider-gold mt-12" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </Section>

    {/* ── SECTION 8: FAQ ── */}
    <Section container="narrow" className="py-20 md:py-32">
      <FAQSection items={FAQ_ITEMS} />
    </Section>
  </LandingLayout>
);

/* ─── Inline Trailer Section (Glow-Border) ─── */
const TrailerInline = () => {
  const isMobile = useIsMobile();

  return (
    <Section container="narrow" className="py-20 md:py-32">
      <div className="text-center mb-10">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
          Einblick
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground">
          Erlebe Pater Brown
        </h2>
      </div>

      <div className="card-glow rounded-[3px] overflow-hidden">
        {isMobile ? (
          <div
            className="relative w-full max-w-sm mx-auto"
            style={{ paddingTop: "177.78%" }}
          >
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
        <GhostButton href={EVENTIM_AFFILIATE_URL}>
          Jetzt Tickets sichern
        </GhostButton>
      </div>
    </Section>
  );
};

export default LiveHoerspiel;
