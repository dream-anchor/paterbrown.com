import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";
import TicketCTA from "@/components/shared/TicketCTA";

const BREADCRUMBS = [
  { label: "Startseite", href: "/" },
  { label: "G.K. Chesterton", href: "/g-k-chesterton" },
  { label: "Editorische Notizen" },
];

const SAMMLUNGEN = [
  { band: 1, en: "The Innocence of Father Brown", year: 1911, stories: 12 },
  { band: 2, en: "The Wisdom of Father Brown", year: 1914, stories: 12 },
  { band: 3, en: "The Incredulity of Father Brown", year: 1926, stories: 8 },
  { band: 4, en: "The Secret of Father Brown", year: 1927, stories: "10 + Rahmenerzählung" },
  { band: 5, en: "The Scandal of Father Brown", year: 1935, stories: 10 },
];

const HAEFS_AUSGABEN = [
  { title: "Father Brown's Einfalt", publisher: "Haffmans, Zürich 1991", isbn: "3-251-20116-6" },
  { title: "Father Brown's Weisheit", publisher: "Haffmans, Zürich 1991", isbn: "3-251-20109-3" },
  { title: "Father Brown's Ungläubigkeit", publisher: "Haffmans, Zürich 1991", isbn: "3-251-20117-4" },
  { title: "Father Brown's Geheimnis", publisher: "Haffmans, Zürich 1992", isbn: "3-251-20118-2" },
  { title: "Father Brown's Skandal", publisher: "Haffmans, Zürich 1993", isbn: "3-251-20109-3" },
];

const EditorischeNotizenChestertonHaefs = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Editorische Notizen zum Gesamtwerk von G. K. Chesterton",
    description: "Übersetzungskritik und literarische Einordnung nach Hanswilhelm Haefs",
    url: "https://paterbrown.com/editorische-notizen-chesterton-haefs",
    author: {
      "@type": "Organization",
      name: "Pater Brown Live-Hörspiel",
      url: "https://paterbrown.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Dream & Anchor Handelsgesellschaft mbH",
      url: "https://paterbrown.com",
    },
    mainEntityOfPage: "https://paterbrown.com/editorische-notizen-chesterton-haefs",
    datePublished: "2026-02-28",
    dateModified: "2026-02-28",
    inLanguage: "de-DE",
    about: [
      {
        "@type": "Person",
        name: "G. K. Chesterton",
        birthDate: "1874-05-29",
        deathDate: "1936-06-14",
      },
      {
        "@type": "Person",
        name: "Hanswilhelm Haefs",
        birthDate: "1935-11-11",
        deathDate: "2015-02-24",
      },
    ],
    isBasedOn: {
      "@type": "Book",
      name: "Editorische Notizen zum Gesamtwerk von G. K. Chesterton",
      author: { "@type": "Person", name: "Hanswilhelm Haefs" },
      publisher: { "@type": "Organization", name: "Area Verlag" },
      isbn: "3-89996-182-X",
      datePublished: "2005",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: "https://paterbrown.com" },
      { "@type": "ListItem", position: 2, name: "G.K. Chesterton", item: "https://paterbrown.com/g-k-chesterton" },
      { "@type": "ListItem", position: 3, name: "Editorische Notizen", item: "https://paterbrown.com/editorische-notizen-chesterton-haefs" },
    ],
  };

  return (
    <LandingLayout
      breadcrumbs={BREADCRUMBS}
      heroImage="/images/buehne/pater-brown-wanja-mues-buehne-skript-af"
      heroTitle="Editorische Notizen"
      heroSubtitle="Zum Gesamtwerk von G.K. Chesterton — Übersetzungskritik nach Hanswilhelm Haefs"
      heroObjectPosition="50% 30%"
      heroCTA={false}
      showCTA
    >
      <SEO
        title="Editorische Notizen zum Gesamtwerk von G. K. Chesterton — Übersetzungskritik nach Hanswilhelm Haefs | Pater Brown"
        description="Editorische Notizen zum Gesamtwerk von G. K. Chesterton mit ausführlicher Übersetzungskritik. Literarischer Rang, Übersetzungsproblematik und Bibliographie nach Hanswilhelm Haefs."
        canonical="/editorische-notizen-chesterton-haefs"
        keywords="editorische notizen chesterton haefs, hanswilhelm haefs übersetzung, father brown chesterton deutsch, chesterton übersetzungskritik, editorische notizen gesamtwerk chesterton, haefs father brown übersetzung haffmans"
        ogImage="/images/og/g-k-chesterton-pater-brown-og.webp"
        schema={[articleSchema, breadcrumbSchema]}
      />

      {/* ── Chestertons literarischer Rang ── */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Literarischer Rang</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Chestertons Rang
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />

        <blockquote className="border-l-2 border-gold/40 pl-6 mb-10">
          <p className="text-xl md:text-2xl font-heading italic text-foreground/80 leading-snug">
            „Danach haben wir Chesterton, Poes großen Erben. Chesterton sagte, nie seien bessere
            Kriminalerzählungen geschrieben worden als von Poe, aber mir erscheint Chesterton
            als der bessere von beiden."
          </p>
          <cite className="text-gold text-sm not-italic block mt-4 uppercase tracking-wider">
            — Jorge Luis Borges, „Über die Kriminalgeschichte" (1978)
          </cite>
        </blockquote>

        <div className="space-y-4">
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Am weltliterarischen Rang Gilbert Keith Chestertons (1874–1936) — als Essayist,
            Lyriker, Novellist und Romancier der anglobritischen Literatur — besteht außerhalb
            des deutschsprachigen Raumes kein Zweifel. Franz Kafka und Kurt Tucholsky gehörten
            zu seinen glühendsten Verehrern; der argentinische Schriftsteller Jorge Luis Borges
            widmete ihm ausführliche Essays in seinen <em>Inquisitionen</em> und bezeichnete
            ihn als überlegenen Erben Edgar Allan Poes.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Dass Chestertons Rang dem deutschsprachigen Publikum lange verborgen blieb, ist
            wesentlich auf die Qualität der frühen deutschen Übersetzungen zurückzuführen.
            Diese waren häufig entschärft, verkürzt und in Teilen sinnentstellend „geglättet" —
            dem deutschen Publikumsgeschmack angepasst, anstatt Chestertons eigenwilligen
            Stil originalgetreu wiederzugeben.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          <h3 className="font-heading text-foreground text-lg uppercase tracking-[0.1em] mb-4">
            Father Brown: Mehr als Kriminalgeschichten
          </h3>
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            In den Father-Brown-Erzählungen spielt die Lösung des jeweiligen Kriminalfalles
            eine geringere Rolle als die Aufdeckung jener tieferen Wahrheiten, um die es
            Chesterton jeweils geht. Borges erkannte dies klar: Chesterton schrieb Erzählungen,
            die zugleich phantastisch sind und mit einer kriminalistischen Lösung enden.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            In Father Browns Welt gibt es weder Verhaftungen noch Gewalttätigkeiten — der
            kleine Priester sucht den Täter auf, redet mit ihm, hört seine Beichte und
            spricht ihn los.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Marie Smith schrieb im Vorwort zu <em>Thirteen Detectives</em>, in den 1970er Jahren
            habe sich der literarische Geschmack auch in Sachen Detektivgeschichten drastisch
            verändert — Chestertons Ruhm aber habe überlebt, wo der vieler anderer untergegangen
            sei. Der britische Krimikritiker H.R.F. Keating stellte 1987 fest, Chestertons
            Gabe der Paradoxie habe in seinen Detektivgeschichten am reichsten geblüht.
          </p>
        </div>
      </div></section>

      {/* ── Die Übersetzungsproblematik ── */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Übersetzungskritik</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Die Übersetzungs&shy;problematik
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />

        <div className="space-y-6">
          <h3 className="font-heading text-foreground text-lg uppercase tracking-[0.1em]">
            Chestertons stilistische Mittel
          </h3>
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Chesterton bediente sich durchgehend bestimmter stilistischer Mittel, um die
            spezifische Atmosphäre seiner Erzählungen zu schaffen:
          </p>

          <div className="space-y-4">
            <div className="p-6 border border-foreground/10 bg-card/10">
              <p className="text-gold text-[10px] uppercase tracking-[0.2em] font-heading mb-3">
                Parallelkonstruktionen und Wortwiederholungen
              </p>
              <p className="text-foreground/70 leading-relaxed text-base">
                Chesterton liebte parallel gebaute Satzglieder, wodurch bewusste Wortwiederholungen
                entstehen. Gerade durch diese Wiederholungen und Parallelisierungen gelingt es ihm,
                unterschiedliche Bedeutungsnuancen lebendig werden zu lassen, die im Kontext bereits
                angelegt waren, aber bis zur Chestertonschen Pointe unsichtbar blieben.
              </p>
            </div>

            <div className="p-6 border border-foreground/10 bg-card/10">
              <p className="text-gold text-[10px] uppercase tracking-[0.2em] font-heading mb-3">
                Relativierende Sprache
              </p>
              <p className="text-foreground/70 leading-relaxed text-base">
                Die häufige Verwendung von Ausdrücken wie „it seems", „seemingly", „rather" und
                entsprechenden Konjunktiven erinnert an die alte Form mathematischer Formulierungen:
                „Es sei …" — ein bewusstes stilistisches Mittel, das die scheinbare Wirklichkeit
                seiner Szenerien als trügerisch kennzeichnet.
              </p>
            </div>

            <div className="p-6 border border-foreground/10 bg-card/10">
              <p className="text-gold text-[10px] uppercase tracking-[0.2em] font-heading mb-3">
                Stabreime und ungewöhnliche Wortkombinationen
              </p>
              <p className="text-foreground/70 leading-relaxed text-base">
                Chestertons spezifische Akzentuierungen und Rhythmisierungen durch Alliterationen
                und überraschende sprachliche Fügungen gehören zum Kern seines literarischen Ausdrucks.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <h3 className="font-heading text-foreground text-lg uppercase tracking-[0.1em] mb-4">
            Warum frühere Übersetzungen versagten
          </h3>
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Die an deutschen Gymnasien bis Ende der 1950er Jahre gelehrte Doktrin vom
            „schönen Deutsch" — insbesondere das Gebot, Wortwiederholungen durch möglichst
            abwechselnde Begriffe aufzulösen — machte es früheren Übersetzern unmöglich,
            die Eigenarten des Chestertonschen Stils in ihren Übertragungen zu wahren.
            Dem deutschen Leser wurde damit jedes Urteil über die spezifische Stil- und
            Darstellungswelt Chestertons verunmöglicht.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Die ersten deutschen Übersetzer — darunter Clarisse Meitner, Rudolf Nutt,
            Kamilla Demmer und Alfred P. Zeller — produzierten Fassungen, die mit dem
            Original nur bedingt vergleichbar waren. Kürzungen, inhaltliche Abmilderungen
            und stilistische „Korrekturen" verwischten Chestertons literarische Signatur.
          </p>
        </div>
      </div></section>

      <TicketCTA variant="informative" />

      {/* ── Die Neuübersetzung durch Hanswilhelm Haefs ── */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Neuübersetzung</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Hanswilhelm Haefs
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />

        <div className="space-y-4">
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Erst Anfang der 1990er Jahre brachte der Zürcher Haffmans Verlag originalgetreuere
            deutsche Ausgaben der Father-Brown-Geschichten heraus. Der Übersetzer{" "}
            <strong className="text-foreground">Hanswilhelm Haefs</strong> (1935–2015) —
            Publizist, Sprachwissenschaftler und langjähriger Herausgeber des{" "}
            <em>Fischer Weltalmanachs</em> — bemühte sich, so nahe am englischen Originaltext
            zu bleiben, wie die deutsche Sprache es nach der Durchsäuerung mit ausgezeichneten
            Übersetzungen aus dem Angelsächsischen nach 1945 ermöglichte.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Haefs' Übersetzung erschien in fünf Bänden ab 1991 und enthielt erstmals alle
            50 Father-Brown-Geschichten in chronologischer Reihenfolge. Seine bewusste
            Beibehaltung der englischen Anrede „Father" (statt des im Deutschen eigentlich
            falschen „Pater", der nur Ordensgeistlichen zukommt) wurde zum Standard
            späterer Ausgaben.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Die von Julian Haefs behutsam redigierte und um die 51. Geschichte „Father Brown
            und die Midasmaske" ergänzte Gesamtausgabe erschien 2022 im Kampa Verlag unter
            dem Titel <em>Pater Brown — Tod und Amen</em> (1.268 Seiten).
          </p>
        </div>
      </div></section>

      {/* ── Bibliographische Übersicht ── */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Bibliographie</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Die Father-Brown-Erzählungen
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />

        <h3 className="font-heading text-foreground text-lg uppercase tracking-[0.1em] mb-4">
          Die fünf Original-Sammlungen
        </h3>
        <div className="space-y-3 mb-10">
          {SAMMLUNGEN.map((s) => (
            <div key={s.band} className="border border-foreground/10 bg-card/10 p-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-heading text-foreground">{s.en}</p>
                <span className="text-gold text-sm font-heading whitespace-nowrap">{s.year}</span>
              </div>
              <p className="text-foreground/50 text-sm mt-1">{s.stories} Erzählungen</p>
            </div>
          ))}
        </div>
        <p className="text-foreground/50 leading-relaxed text-base mb-12">
          Zusätzlich: <em>The Donnington Affair</em> (1914, Plot von Sir Max Pemberton) und{" "}
          <em>The Mask of Midas</em> (postum). Die im Rahmen der <em>Collected Works</em>{" "}
          2005 in zwei Bänden erschienene Ausgabe ist die erste vollständige englische Edition.
        </p>

        <h3 className="font-heading text-foreground text-lg uppercase tracking-[0.1em] mb-4">
          Deutsche Ausgaben — Übersetzung von Hanswilhelm Haefs
        </h3>
        <div className="space-y-3 mb-6">
          {HAEFS_AUSGABEN.map((a) => (
            <div key={a.isbn} className="border border-foreground/10 bg-card/10 p-5">
              <p className="font-heading text-foreground">{a.title}</p>
              <p className="text-foreground/50 text-sm mt-1">{a.publisher}</p>
              <p className="text-foreground/40 text-xs mt-1 font-mono">ISBN {a.isbn}</p>
            </div>
          ))}
        </div>
        <div className="border border-gold/20 bg-card/10 p-5">
          <p className="text-gold text-[10px] uppercase tracking-[0.2em] font-heading mb-2">Gesamtausgabe</p>
          <p className="font-heading text-foreground">Pater Brown — Tod und Amen</p>
          <p className="text-foreground/50 text-sm mt-1">
            Kampa Verlag, Zürich 2022. Überarbeitet von Julian Haefs, mit Nachwort
            und umfangreichem Anmerkungsapparat. 1.268 Seiten.
          </p>
          <p className="text-foreground/40 text-xs mt-1 font-mono">ISBN 978-3-311-12566-5</p>
        </div>
      </div></section>

      <TicketCTA variant="emotional" />

      {/* ── Biographische Skizze ── */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Biografie</p>
            <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
              G.K. Chesterton
            </h2>
            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
            <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
              Gilbert Keith Chesterton wurde 1874 in Campden Hill im Londoner Stadtteil
              Kensington als Sohn eines Häusermaklers geboren. Die Familie gehörte der
              Gemeinschaft der Unitarier an. Nach dem Besuch der St Paul's School studierte
              er an der Slade School of Art und hörte Vorlesungen der Literaturwissenschaft
              am University College London, erwarb jedoch keinen Abschluss.
            </p>
            <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
              Ab 1896 arbeitete er als Journalist und entwickelte sich zu einem der
              meistbeachteten Intellektuellen der Zwischenkriegszeit in England.
              1922{" "}
              <Link to="/chesterton-katholizismus-zoelibat" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                konvertierte er zum Katholizismus
              </Link>
              {" "}— ein Schritt, der sein Werk
              nachhaltig prägte und in den Father-Brown-Geschichten seinen literarischen
              Niederschlag fand.
            </p>
            <p className="text-foreground/70 leading-relaxed text-lg font-light">
              Chesterton verfasste Gedichte, Bühnenstücke, zahlreiche Essays, Erzählungen
              und Romane. Seine Biografien über Thomas von Aquin, Franziskus von Assisi,
              Charles Dickens und George Bernard Shaw gelten als Meisterwerke der Gattung.
              Sein Roman <em>The Man Who Was Thursday</em> (1908) ist eine politische Satire
              an der Grenze zur Phantastischen Literatur, die bis heute einflussreich ist.
            </p>
          </div>
          <div className="relative overflow-hidden aspect-[4/5]">
            <img
              src="/images/historisch/gk-chesterton-portrait-autor-father-brown.webp"
              srcSet="/images/historisch/gk-chesterton-portrait-autor-father-brown-480.webp 480w, /images/historisch/gk-chesterton-portrait-autor-father-brown-768.webp 768w, /images/historisch/gk-chesterton-portrait-autor-father-brown-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="G.K. Chesterton – Portrait des Autors von Father Brown"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <p className="text-foreground/50 leading-relaxed text-base mt-8">
          Der slowenische Philosoph Slavoj Žižek zählt Chesterton zu seinen meistzitierten
          Autoren. Chesterton starb am 14. Juni 1936 in Beaconsfield.
        </p>

        <p className="mt-6">
          <Link
            to="/g-k-chesterton"
            className="text-gold text-xs font-heading uppercase tracking-[0.15em] hover:text-foreground transition-colors"
          >
            Ausführliche Biografie &rarr;
          </Link>
        </p>
      </div></section>

      {/* ── Zitate ── */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-4xl text-center">
        <blockquote className="text-3xl md:text-5xl lg:text-6xl font-heading italic text-foreground/90 leading-tight">
          „Chesterton ist so heiter, dass man meinen könnte, er habe die Lösung gefunden."
        </blockquote>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent max-w-md mx-auto mt-10 mb-6" />
        <p className="text-gold text-sm uppercase tracking-[0.3em]">Franz Kafka</p>
      </div></section>

      {/* ── Pater Brown heute ── */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Heute</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Pater Brown auf der Bühne
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />

        <div className="space-y-4">
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Die Tradition der Father-Brown-Erzählungen lebt weiter — auf der Bühne.
            Das{" "}
            <Link to="/live-hoerspiel" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              <strong className="text-foreground">Pater Brown Live-Hörspiel</strong>
            </Link>
            {" "}mit{" "}
            <Link to="/antoine-monot" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Antoine Monot
            </Link>
            {" "}und{" "}
            <Link to="/wanja-mues" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Wanja Mues
            </Link>
            {" "}überführt Chestertons Kriminalgeschichten in eine neue Form: Vor den Augen
            des Publikums entsteht ein vollständiges Hörspiel, live vertont und inszeniert
            von{" "}
            <Link to="/marvelin" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Marvelin
            </Link>.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Die modernen Adaptionen bewahren den literarischen Reiz der Chesterton-Vorlagen
            und verleihen ihnen zugleich eine frische, zeitgemäße Form — ganz im Geiste
            des Autors, der seine Geschichten stets als lebendige Begegnungen zwischen
            Erzähler und Publikum verstand.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/termine"
            className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block text-center"
          >
            Aktuelle Termine &amp; Tickets
          </Link>
          <Link
            to="/g-k-chesterton"
            className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/10 hover:border-gold/30 text-foreground/60 hover:text-gold backdrop-blur-sm transition-all duration-300 inline-block text-center"
          >
            G.K. Chesterton — Biografie
          </Link>
        </div>
      </div></section>

      <TicketCTA variant="concrete" />

      {/* ── Quellen ── */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Quellen</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Literatur
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
        <ul className="space-y-3">
          {[
            "Hanswilhelm Haefs: Editorische Notizen zum Gesamtwerk von G. K. Chesterton. Area Verlag, Erftstadt 2005.",
            "Hanswilhelm Haefs: Nachwort. In: G. K. Chesterton: Father Browns Einfalt. Suhrkamp, Frankfurt/M. 2008, S. 327–342.",
            "Irmela Brender: Über Pater Brown. Fischer, Frankfurt am Main 1987.",
            "Jorge Luis Borges: Inquisitionen. Fischer, Frankfurt am Main.",
            "G. K. Chesterton: Pater Brown — Tod und Amen. Alle Fälle in einem Band. Kampa Verlag, Zürich 2022.",
          ].map((source, i) => (
            <li key={i} className="text-foreground/60 text-sm leading-relaxed pl-3 border-l border-gold/20">
              {source}
            </li>
          ))}
        </ul>

        <p className="text-foreground/40 text-sm mt-10 italic leading-relaxed">
          Diese Seite basiert auf den editorischen Arbeiten von Hanswilhelm Haefs (1935–2015),
          der mit seiner Neuübersetzung der Father-Brown-Geschichten dem deutschsprachigen
          Publikum erstmals einen authentischen Zugang zu Chestertons literarischer Welt eröffnete.
        </p>
      </div></section>
    </LandingLayout>
  );
};

export default EditorischeNotizenChestertonHaefs;
