import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import SectionHeading from "@/components/landing/SectionHeading";
import FAQSection from "@/components/landing/FAQSection";
import ResponsiveImage from "@/components/landing/ResponsiveImage";
import { Separator } from "@/components/ui/separator";

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

/** PerformingGroup Schema */
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

const LiveHoerspiel = () => (
  <LandingLayout breadcrumbs={[{ label: "Live-Hörspiel" }]}>
    <SEO
      title="PATER BROWN – Das Live-Hörspiel | Antoine Monot & Wanja Mues"
      description="Erleben Sie Pater Brown als Live-Hörspiel! Antoine Monot, Wanja Mues & Beatboxer Marvelin bringen Chestertons Krimis auf die Bühne. Jetzt Tickets sichern!"
      canonical="/live-hoerspiel"
      keywords="pater brown live hörspiel, live hörspiel, pater brown theaterstück, pater brown das live hörspiel, hörspiel live erleben"
      ogTitle="PATER BROWN – Das Live-Hörspiel | Auf Tour"
      ogDescription="Antoine Monot, Wanja Mues & Beatboxer Marvelin bringen Chestertons Krimis als Live-Hörspiel auf die Bühne."
      ogImage="/images/og/pater-brown-live-hoerspiel-buehne-og.webp"
    />

    {/* PerformingGroup Schema */}
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(performingGroupSchema)}
      </script>
    </Helmet>

    {/* Header */}
    <div className="text-center space-y-4 mb-12">
      <p className="text-gold uppercase tracking-[0.3em] text-sm font-light">
        Das Format
      </p>
      <h1 className="text-4xl sm:text-6xl md:text-8xl font-heading tracking-wider text-gold mb-4 uppercase">
        Das Live-Hörspiel
      </h1>
      <p className="text-xl md:text-2xl text-foreground/80 font-light leading-relaxed max-w-2xl mx-auto">
        Schließen Sie die Augen – und erleben Sie Krimi pur. Zwei Schauspieler,
        ein Beatboxer, kein Playback.
      </p>
    </div>

    {/* Hero-Bühnenfoto */}
    <div className="mb-12 rounded-lg overflow-hidden">
      <ResponsiveImage
        basePath="/images/buehne/pater-brown-ensemble-monot-mues-marvelin-af"
        alt="Antoine Monot, Wanja Mues und Beatboxer Marvelin beim Pater Brown Live-Hörspiel auf der Bühne"
        width={2000}
        height={1500}
        sizes="(max-width: 768px) 100vw, 800px"
        priority
        className="rounded-lg"
        credit="Alexander Frank"
      />
    </div>

    <Separator className="bg-gradient-to-r from-transparent via-gold to-transparent h-[1px] mb-12" />

    {/* Section 1: Was ist ein Live-Hörspiel? */}
    <section className="space-y-6 mb-16">
      <SectionHeading label="Das Konzept" title="Was ist ein Live-Hörspiel?" />
      <div className="text-foreground/80 leading-relaxed space-y-4">
        <p>
          Ein Live-Hörspiel verbindet die Intimität eines Hörspiels mit der
          Unmittelbarkeit von Live-Theater. Im Gegensatz zu einem klassischen
          Theaterstück steht nicht das visuelle Bühnenbild im Vordergrund,
          sondern das <strong className="text-foreground">akustische Erlebnis</strong>.
          Die Darsteller erzeugen vor den Augen des Publikums eine komplette
          Klangwelt – mit Stimme, Geräuschen und Musik.
        </p>
        <p>
          Der entscheidende Unterschied zu einem Hörspiel von CD oder aus dem
          Radio: Alles passiert <strong className="text-foreground">live und ungeschnitten</strong>.
          Es gibt keinen zweiten Take, keine Nachbearbeitung, kein Playback.
          Jede Vorstellung ist einzigartig. Das Publikum spürt die Energie
          der Darsteller, erlebt Versprecher und Improvisationen – und wird
          selbst Teil der Aufführung.
        </p>
        <p>
          Viele Zuschauer schließen während der Vorstellung die Augen, um
          sich ganz auf das Hörerlebnis zu konzentrieren. So entstehen eigene
          Bilder im Kopf – lebendiger als jedes Bühnenbild.
        </p>
      </div>
    </section>

    {/* Section 2: Die Show im Detail */}
    <section className="space-y-6 mb-16">
      <SectionHeading
        label="Die Show"
        title="PATER BROWN – Das Live-Hörspiel"
      />
      <div className="text-foreground/80 leading-relaxed space-y-4">
        <p>
          <strong className="text-foreground">Zwei spannende Kriminalgeschichten</strong>{" "}
          nach dem britischen Autor{" "}
          <Link
            to="/g-k-chesterton"
            className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
          >
            G.K. Chesterton
          </Link>{" "}
          bilden den Kern jeder
          Vorstellung. Die Kurzgeschichten rund um den scharfsinnigen{" "}
          <Link
            to="/pater-brown"
            className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
          >
            Pater Brown
          </Link>{" "}
          und seinen Gegenspieler, den Meisterdieb Flambeau, gehören
          zu den Klassikern der Kriminalliteratur und wurden in über 30
          Sprachen übersetzt.
        </p>
        <p>
          Jede Vorstellung dauert ca.{" "}
          <strong className="text-foreground">2 Stunden inklusive Pause</strong>. In der
          ersten Halbzeit wird eine Geschichte aufgeführt, nach einer
          15-minütigen Pause folgt die zweite. Das Ensemble hat mehrere
          Geschichten im Repertoire – Wiederholungsbesuche lohnen sich.
        </p>
        <p>
          Die Zielgruppe reicht von Krimi-Fans und Hörspiel-Liebhabern bis
          zu Theaterbesuchern, die etwas Neues erleben möchten. Die Show ist
          ab ca. 12 Jahren empfohlen. Tickets sind ab{" "}
          <strong className="text-foreground">34,90 €</strong> (Deutschland)
          erhältlich.
        </p>
        <p>
          <Link
            to="/termine"
            className="text-gold hover:text-gold/80 transition-colors font-medium uppercase tracking-wider underline-offset-4 hover:underline"
          >
            Alle Termine & Tickets ansehen <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </section>

    {/* Section 3: Die Besetzung */}
    <section className="space-y-6 mb-16">
      <SectionHeading label="Ensemble" title="Die Besetzung" />
      <div className="space-y-8">
        {/* Antoine Monot */}
        <div className="p-6 rounded-lg border border-foreground/10 bg-card/30 space-y-3">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="sm:w-40 shrink-0">
              <ResponsiveImage
                basePath="/images/portraits/antoine-monot-portrait-pater-brown-gl"
                alt="Schauspieler Antoine Monot – Sprecher und Star des Pater Brown Live-Hörspiels"
                width={2000}
                height={2852}
                sizes="(max-width: 640px) 50vw, 160px"
                className="rounded-lg"
                credit="Gio Löwe"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-gold font-heading text-2xl tracking-wider uppercase">
                <Link to="/antoine-monot" className="hover:text-gold/80 transition-colors">
                  Antoine Monot
                </Link>
              </h3>
              <p className="text-foreground/60 text-sm uppercase tracking-widest">
                als Pater Brown
              </p>
              <p className="text-foreground/80 leading-relaxed">
                Antoine Monot ist Schauspieler, Drehbuchautor und Produzent.
                Einem breiten Publikum wurde er als Rechtsanwalt Dr. Markus
                Lanz in der ZDF-Serie „Ein Fall für Zwei" bekannt, die er über
                Jahre prägte. Auf der Bühne des Live-Hörspiel schlüpft er in
                die Rolle des scharfsinnigen katholischen Priesters Pater Brown,
                der mit Menschenkenntnis und leisem Humor die verzwicktesten
                Kriminalfälle löst.
              </p>
            </div>
          </div>
        </div>

        {/* Wanja Mues */}
        <div className="p-6 rounded-lg border border-foreground/10 bg-card/30 space-y-3">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="sm:w-40 shrink-0">
              <ResponsiveImage
                basePath="/images/portraits/wanja-mues-portrait-pater-brown-gl"
                alt="Wanja Mues – Schauspieler und Sprecher im Pater Brown Live-Hörspiel, bekannt aus Ein Fall für zwei"
                width={2000}
                height={2852}
                sizes="(max-width: 640px) 50vw, 160px"
                className="rounded-lg"
                credit="Gio Löwe"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-gold font-heading text-2xl tracking-wider uppercase">
                <Link to="/wanja-mues" className="hover:text-gold/80 transition-colors">
                  Wanja Mues
                </Link>
              </h3>
              <p className="text-foreground/60 text-sm uppercase tracking-widest">
                als Flambeau
              </p>
              <p className="text-foreground/80 leading-relaxed">
                Wanja Mues ist Schauspieler und Regisseur. Auch er wurde durch
                die ZDF-Serie „Ein Fall für Zwei" einem Millionenpublikum
                bekannt – als Privatdetektiv Matula. Im Live-Hörspiel
                verkörpert er den charmanten Meisterdieb Flambeau, den
                Gegenspieler und späteren Verbündeten von Pater Brown.
                Zusätzlich spricht er zahlreiche weitere Charaktere und
                wechselt mühelos zwischen den Rollen.
              </p>
            </div>
          </div>
        </div>

        {/* Marvelin */}
        <div className="p-6 rounded-lg border border-foreground/10 bg-card/30 space-y-3">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="sm:w-40 shrink-0">
              <ResponsiveImage
                basePath="/images/buehne/pater-brown-buehne-ensemble-marvelin-af"
                alt="Beatboxer Marvelin erzeugt live alle Soundeffekte im Pater Brown Live-Hörspiel"
                width={2000}
                height={2666}
                sizes="(max-width: 640px) 50vw, 160px"
                className="rounded-lg"
                credit="Alexander Frank"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-gold font-heading text-2xl tracking-wider uppercase">
                <Link to="/marvelin" className="hover:text-gold/80 transition-colors">
                  Marvelin
                </Link>
              </h3>
              <p className="text-foreground/60 text-sm uppercase tracking-widest">
                Beatbox & Sound Design
              </p>
              <p className="text-foreground/80 leading-relaxed">
                Marvelin ist einer der besten Beatboxer Europas und verantwortlich
                für das gesamte Sounddesign der Show. Er erzeugt{" "}
                <strong className="text-foreground">sämtliche Geräusche</strong> –
                von Schritten auf Kies über knarrende Türen, prasselnden Regen
                und Kirchenglocken bis hin zu Schüssen und Automotoren –
                ausschließlich live mit seinem Mund. Unterstützt von einer
                Loop-Station schafft er komplexe Klanglandschaften, die das
                Publikum in die Welt von Pater Brown eintauchen lassen.
              </p>
            </div>
          </div>
        </div>

        {/* Stefanie Sick */}
        <div className="p-6 rounded-lg border border-foreground/10 bg-card/30 space-y-3">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="sm:w-40 shrink-0">
              <ResponsiveImage
                basePath="/images/portraits/stefanie-sick-kuenstlerische-leitung-pb"
                alt="Stefanie Sick – Künstlerische Leitung und Produzentin des Pater Brown Live-Hörspiels"
                width={1024}
                height={1536}
                sizes="(max-width: 640px) 50vw, 160px"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-gold font-heading text-2xl tracking-wider uppercase">
                <Link to="/stefanie-sick" className="hover:text-gold/80 transition-colors">
                  Stefanie Sick
                </Link>
              </h3>
              <p className="text-foreground/60 text-sm uppercase tracking-widest">
                Künstlerische Leitung & Regie
              </p>
              <p className="text-foreground/80 leading-relaxed">
                Stefanie Sick ist die künstlerische Leiterin und Regisseurin des
                Live-Hörspiels. Sie adaptiert die Kurzgeschichten von G.K.
                Chesterton für die Bühne, inszeniert die Aufführungen und ist
                für die dramaturgische Gestaltung verantwortlich. Gemeinsam mit
                Antoine Monot leitet sie die Produktion über die Dream & Anchor
                Handelsgesellschaft mbH.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Section 4: Beatboxing als Sounddesign */}
    <section className="space-y-6 mb-16">
      <SectionHeading
        label="Sounddesign"
        title="Beatboxing als Bühnenkunst"
      />
      <div className="text-foreground/80 leading-relaxed space-y-4">
        <p>
          Das Besondere an diesem Live-Hörspiel: Es gibt{" "}
          <strong className="text-foreground">
            kein Tonstudio, keine Einspieler, kein Playback
          </strong>
          . Jedes Geräusch, das die Zuschauer hören, entsteht in
          Echtzeit – erzeugt von Marvelins Stimme und einer Loop-Station.
        </p>
        <p>
          Ob das leise Knirschen von Schritten auf einem Kiesweg, das
          Knarren einer alten Kirchentür, das Prasseln eines englischen
          Regenschauers oder der dumpfe Knall eines Schusses – Marvelin
          erschafft jedes Detail mit seinem Mund. Durch geschicktes Layering
          auf der Loop-Station baut er komplexe Soundscapes auf, die den
          Raum akustisch verwandeln.
        </p>
        <p>
          Für das Publikum entsteht so ein Klangerlebnis, das einem
          professionell produzierten Hörspiel in nichts nachsteht – mit dem
          entscheidenden Unterschied, dass alles live und sichtbar passiert.
          Wer die Augen öffnet, sieht, wie die Geräusche entstehen. Wer sie
          schließt, taucht vollständig in die Geschichte ein.
        </p>
      </div>
    </section>

    {/* Section 5: Pressestimmen */}
    <section className="space-y-6 mb-16">
      <SectionHeading label="Stimmen" title="Was Besucher sagen" />
      <div className="space-y-4">
        <blockquote className="p-6 rounded-lg border border-foreground/10 bg-card/30 italic text-foreground/80">
          <p className="leading-relaxed">
            „Ein einzigartiges Erlebnis! Die Augen schließen und nur zuhören
            – das war Gänsehaut pur. Unbedingt hingehen!"
          </p>
          <footer className="text-gold text-sm mt-3 not-italic">
            — Besucherin, München 2025
          </footer>
        </blockquote>
        <blockquote className="p-6 rounded-lg border border-foreground/10 bg-card/30 italic text-foreground/80">
          <p className="leading-relaxed">
            „Ich hätte nicht gedacht, dass Beatboxing so vielseitig sein kann.
            Marvelin erzeugt Geräusche, die man für echt hält. Unglaublich."
          </p>
          <footer className="text-gold text-sm mt-3 not-italic">
            — Besucher, Hamburg 2025
          </footer>
        </blockquote>
        <blockquote className="p-6 rounded-lg border border-foreground/10 bg-card/30 italic text-foreground/80">
          <p className="leading-relaxed">
            „Wanja Mues und Antoine Monot sind ein Traumduo. Die Chemie
            zwischen den beiden macht jede Vorstellung besonders."
          </p>
          <footer className="text-gold text-sm mt-3 not-italic">
            — Besucherin, Köln 2025
          </footer>
        </blockquote>
      </div>
    </section>

    <Separator className="bg-gradient-to-r from-transparent via-gold/30 to-transparent h-[1px]" />

    {/* FAQ */}
    <FAQSection items={FAQ_ITEMS} />
  </LandingLayout>
);

export default LiveHoerspiel;
