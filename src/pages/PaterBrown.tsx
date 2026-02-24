import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import FAQSection from "@/components/landing/FAQSection";
import { SEO } from "@/components/SEO";

const FAQ_ITEMS = [
  {
    question: "Wer hat Pater Brown erfunden?",
    answer:
      `Die Figur des Pater Brown wurde von dem britischen Schriftsteller Gilbert Keith Chesterton (G.K. Chesterton) erschaffen. Die erste Geschichte, \u201EThe Blue Cross\u201C, erschien 1910 in einer Zeitschrift. Insgesamt schrieb Chesterton 49 Kurzgeschichten, die zwischen 1911 und 1935 in f\u00FCnf B\u00E4nden ver\u00F6ffentlicht wurden.`,
  },
  {
    question: "Wie viele Pater-Brown-Geschichten gibt es?",
    answer:
      `Es gibt 49 Kurzgeschichten, ver\u00F6ffentlicht in f\u00FCnf B\u00E4nden: \u201EFather Browns Einfalt\u201C (1911), \u201EFather Browns Weisheit\u201C (1914), \u201EFather Browns Ungl\u00E4ubigkeit\u201C (1926), \u201EFather Browns Geheimnis\u201C (1927) und \u201EFather Browns Skandal\u201C (1935).`,
  },
  {
    question: "Wer spielte Pater Brown im Film?",
    answer:
      `Die bekanntesten Darsteller sind Alec Guinness (1954), Heinz R\u00FChmann (1960\u20131968), Josef Meinrad (TV-Serie 1966\u20131972), Ottfried Fischer als \u201EPfarrer Braun\u201C (2003\u20132013) und Mark Williams in der BBC-Serie \u201EFather Brown\u201C (seit 2013). In Italien \u00FCbernahm Terence Hill als \u201EDon Matteo\u201C eine an Pater Brown angelehnte Rolle.`,
  },
  {
    question:
      "Was ist der Unterschied zwischen Pater Brown und Father Brown?",
    answer:
      `Es handelt sich um dieselbe Figur. Im englischen Original hei\u00DFt er \u201EFather Brown\u201C \u2013 die \u00FCbliche Anrede f\u00FCr einen katholischen Priester im Englischen. Im Deutschen wurde daraus \u201EPater Brown\u201C, obwohl \u201EPater\u201C eigentlich nur f\u00FCr Ordenspriester verwendet wird. Brown ist in Chestertons Geschichten jedoch ein Weltpriester bzw. Gemeindepfarrer.`,
  },
  {
    question: "Wo kann man Pater Brown live erleben?",
    answer:
      "Pater Brown gibt es als Live-H\u00F6rspiel auf Tour durch Deutschland und die Schweiz. Antoine Monot, Wanja Mues und Beatboxer Marvelin bringen die Geschichten von G.K. Chesterton live auf die B\u00FChne. Alle Termine und Tickets finden Sie unter paterbrown.com/termine.",
  },
  {
    question: "Was ist ein Live-H\u00F6rspiel?",
    answer:
      `Ein Live-H\u00F6rspiel ist eine Auff\u00FChrung, bei der ein H\u00F6rspiel live vor Publikum gespielt wird. Alle Stimmen, Ger\u00E4usche und Soundeffekte entstehen in Echtzeit auf der B\u00FChne \u2013 ohne Playback oder vorproduzierte Sounds. Mehr dazu erfahren Sie unter paterbrown.com/live-hoerspiel.`,
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Pater Brown \u2013 Die legend\u00E4re Figur von G.K. Chesterton",
  description:
    "Alles \u00FCber Pater Brown: Von den Kurzgeschichten G.K. Chestertons \u00FCber die Verfilmungen mit Heinz R\u00FChmann und Mark Williams bis zum Live-H\u00F6rspiel auf Tour.",
  author: {
    "@type": "Organization",
    name: "Dream & Anchor Handelsgesellschaft mbH",
    url: "https://paterbrown.com",
  },
  publisher: {
    "@type": "Organization",
    name: "paterbrown.com",
    url: "https://paterbrown.com",
    logo: {
      "@type": "ImageObject",
      url: "https://paterbrown.com/og-image.png",
    },
  },
  mainEntityOfPage: "https://paterbrown.com/pater-brown",
  datePublished: "2026-02-23",
  dateModified: "2026-02-23",
  image: "https://paterbrown.com/images/og/pater-brown-krimi-live-og.webp",
  inLanguage: "de-DE",
  about: {
    "@type": "FictionalCharacter",
    name: "Father Brown",
    alternateName: ["Pater Brown", "Pfarrer Brown", "Pater Braun"],
    creator: {
      "@type": "Person",
      name: "G.K. Chesterton",
      sameAs: "https://de.wikipedia.org/wiki/Gilbert_Keith_Chesterton",
    },
  },
};

/* ─── Verfilmungen-Daten ─── */
const ADAPTATIONS = [
  {
    title: "Alec Guinness (1954)",
    content: (
      <p className="text-foreground/70 leading-relaxed text-lg font-light">
        Die erste bedeutende Verfilmung war \u201EDie seltsamen Wege des Pater
        Brown\u201C (<em>Father Brown</em>, 1954) unter der Regie von Robert Hamer.
        Alec Guinness \u2013 sp\u00E4ter weltber\u00FChmt als Obi-Wan Kenobi in Star Wars \u2013
        spielte die Titelrolle. Der Film basiert auf der Erz\u00E4hlung \u201EThe Blue
        Cross\u201C und gilt bis heute als eine der gelungensten Adaptionen der
        Figur. Guinness\u2019 Begegnung mit der Rolle trug \u00FCbrigens zu seiner
        sp\u00E4teren Konversion zum Katholizismus bei.
      </p>
    ),
  },
  {
    title: "Heinz R\u00FChmann (1960\u20131968)",
    image: {
      basePath: "/images/historisch/heinz-ruehmann-schauspieler-pater-brown-bundesarchiv",
      alt: "Heinz R\u00FChmann \u2013 Deutschlands bekanntester Pater-Brown-Darsteller in den Filmen Das schwarze Schaf und Er kanns nicht lassen",
      width: 789,
      height: 488,
      credit: "Bundesarchiv",
      license: "CC-BY-SA 3.0 DE",
    },
    content: (
      <div className="space-y-3">
        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          F\u00FCr das deutsche Publikum ist Heinz R\u00FChmann untrennbar mit der Figur
          verbunden. In drei Filmen verk\u00F6rperte er Pater Brown:
        </p>
        <ul className="list-disc list-inside space-y-1 text-foreground/70 text-lg leading-relaxed font-light pl-4">
          <li>
            <strong className="text-foreground">\u201EDas schwarze Schaf\u201C</strong>{" "}
            (1960, Regie: Helmut Ashley)
          </li>
          <li>
            <strong className="text-foreground">\u201EEr kann\u2019s nicht lassen\u201C</strong>{" "}
            (1962, Regie: Axel von Ambesser)
          </li>
          <li>
            <strong className="text-foreground">\u201EDie Abenteuer des Kardinal Braun\u201C</strong>{" "}
            (1968) \u2013 nicht mehr nach Chesterton
          </li>
        </ul>
        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Mit der unvergesslichen Musik von Martin B\u00F6ttcher pr\u00E4gten diese Filme
          das deutsche Bild von Pater Brown ma\u00DFgeblich. Ein Funfact: In \u201EEr
          kann\u2019s nicht lassen\u201C spielte Horst Tappert \u2013 der sp\u00E4tere \u201EDerrick\u201C \u2013
          eine Nebenrolle als Trompeter. Die R\u00FChmann-Filme werden bis heute
          regelm\u00E4\u00DFig zu Ostern und Weihnachten im \u00F6ffentlich-rechtlichen
          Fernsehen gezeigt.
        </p>
      </div>
    ),
  },
  {
    title: "Josef Meinrad \u2013 TV-Serie (1966\u20131972)",
    content: (
      <p className="text-foreground/70 leading-relaxed text-lg font-light">
        Die \u00F6sterreichisch-deutsche Fernsehserie mit Josef Meinrad umfasste 39
        Folgen in f\u00FCnf Staffeln und war eine der werkgetreuesten Verfilmungen
        der Chesterton-Geschichten. Die 25-min\u00FCtigen Episoden liefen im
        Vorabendprogramm und brachten die Originalgeschichten einem breiten
        Fernsehpublikum nahe.
      </p>
    ),
  },
  {
    title: "Ottfried Fischer als \u201EPfarrer Braun\u201C (2003\u20132013)",
    content: (
      <p className="text-foreground/70 leading-relaxed text-lg font-light">
        Die ARD-Reihe \u201EPfarrer Braun\u201C mit Ottfried Fischer war lose an die
        Pater-Brown-Figur angelehnt. Der bayerische Pfarrer Guido Braun l\u00F6st in
        der Serie Kriminalf\u00E4lle mit Humor und Menschenkenntnis. Mit bis zu 8
        Millionen Zuschauern pro Erstausstrahlung war die Serie ein gro\u00DFer
        Publikumserfolg. Die Titelmelodie stammte \u2013 wie bei den R\u00FChmann-Filmen \u2013
        von Martin B\u00F6ttcher. Die Serie wurde 2013 aufgrund gesundheitlicher
        Probleme Fischers eingestellt.
      </p>
    ),
  },
  {
    title: "BBC \u2013 Father Brown mit Mark Williams (seit 2013)",
    content: (
      <div className="space-y-3">
        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Die britische Krimiserie \u201EFather Brown\u201C auf BBC One ist die aktuell
          erfolgreichste Adaption. Mark Williams \u2013 vielen bekannt als Arthur
          Weasley aus den Harry-Potter-Filmen \u2013 spielt die Titelrolle. Die Serie
          spielt im England der 1950er Jahre im fiktiven Dorf Kembleford in den
          Cotswolds und umfasst seit ihrem Start im Januar 2013 \u00FCber 13 Staffeln
          mit mehr als 140 Episoden (Stand: Januar 2026).
        </p>
        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          In Deutschland wird die Serie auf ZDFneo ausgestrahlt, bisher sind acht
          Staffeln deutsch synchronisiert. Seit 2022 gibt es zudem das Spin-off
          \u201ESister Boniface Mysteries\u201C. Gedreht wird die Serie in Blockley,
          Gloucestershire.
        </p>
      </div>
    ),
  },
  {
    title: "Don Matteo mit Terence Hill (seit 2000)",
    content: (
      <p className="text-foreground/70 leading-relaxed text-lg font-light">
        Die italienische Fernsehserie \u201EDon Matteo\u201C auf Rai 1 nimmt Motive der
        Pater-Brown-Figur auf. Terence Hill (b\u00FCrgerlich Mario Girotti) spielt
        einen ermittelnden Priester in Gubbio/Spoleto in Umbrien. Mit \u00FCber 14
        Staffeln, mehr als 200 Folgen und bis zu 9 Millionen Zuschauern in
        Italien ist die Serie ein Quotengarant. In Deutschland ist sie seit 2022
        auf Bibel TV zu sehen. Terence Hill erf\u00FCllte sich mit der Rolle einen
        Lebenstraum.
      </p>
    ),
  },
];

const CAST_CARDS = [
  {
    name: "Antoine Monot",
    slug: "/antoine-monot",
    desc: `Bekannt als Benni Hornberg in \u201EEin Fall f\u00FCr zwei\u201C (ZDF). Schl\u00FCpft auf der B\u00FChne in die Rolle des scharfsinnigen Pater Brown und erz\u00E4hlt als Erz\u00E4hler die Geschichte.`,
  },
  {
    name: "Wanja Mues",
    slug: "/wanja-mues",
    desc: `Ebenfalls bekannt aus \u201EEin Fall f\u00FCr zwei\u201C als Privatdetektiv Matula. Verk\u00F6rpert den Meisterdieb Flambeau und zahlreiche weitere Charaktere.`,
  },
  {
    name: "Marvelin",
    slug: "/marvelin",
    desc: "Einer der besten Beatboxer Europas. Erzeugt s\u00E4mtliche Ger\u00E4usche der Show \u2013 von Schritten \u00FCber Kirchenglocken bis zu Sch\u00FCssen \u2013 ausschlie\u00DFlich live mit dem Mund.",
  },
];

const WEITERLESEN = [
  { to: "/live-hoerspiel", label: "Das Live-H\u00F6rspiel", desc: "Alles \u00FCber das Format und die Show" },
  { to: "/termine", label: "Alle Termine", desc: "Tour-Daten und Tickets" },
  { to: "/g-k-chesterton", label: "G.K. Chesterton", desc: "Der Erfinder von Pater Brown" },
  { to: "/hoerspiel", label: "Pater Brown H\u00F6rspiel", desc: "Maritim-Klassiker und mehr" },
  { to: "/father-brown", label: "Father Brown", desc: "Die englische Originalfigur" },
  { to: "/krimi-hoerspiel", label: "Krimi-H\u00F6rspiel", desc: "Das Genre im \u00DCberblick" },
];

const PaterBrown = () => (
  <LandingLayout
    breadcrumbs={[{ label: "Pater Brown" }]}
    heroTitle="Pater Brown"
    heroSubtitle="Der unscheinbare Priester, der seit \u00FCber 100 Jahren Kriminalf\u00E4lle l\u00F6st \u2013 von den Kurzgeschichten \u00FCber Film und Fernsehen bis auf die Live-B\u00FChne."
    showCTA
  >
    <SEO
      title="Pater Brown \u2013 Die legend\u00E4re Figur von G.K. Chesterton"
      description="Alles \u00FCber Pater Brown: Von den Kurzgeschichten G.K. Chestertons \u00FCber die Verfilmungen mit Heinz R\u00FChmann bis zum Live-H\u00F6rspiel. Jetzt Tickets sichern!"
      canonical="/pater-brown"
      keywords="pater brown, father brown, pfarrer brown, pater braun, vater brown, pater brown darsteller, pater brown schauspieler, pater brown film"
      ogTitle="Pater Brown \u2013 Die legend\u00E4re Figur von G.K. Chesterton | paterbrown.com"
      ogDescription="Alles \u00FCber Pater Brown: Kurzgeschichten, Verfilmungen, H\u00F6rspiele und das Live-H\u00F6rspiel auf Tour."
      ogImage="/images/og/pater-brown-krimi-live-og.webp"
      schema={articleSchema}
    />

    {/* ── Kapitel 1: Wer ist Pater Brown? ── */}
    <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
      <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">
        Kapitel 1
      </p>
      <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
        Wer ist Pater Brown?
      </h2>
      <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />

      <div className="float-right ml-6 mb-4 w-48 sm:w-56">
        <div className="border border-foreground/10 overflow-hidden">
          <img src="/images/historisch/gk-chesterton-foto-schriftsteller.webp" srcSet="/images/historisch/gk-chesterton-foto-schriftsteller-480.webp 480w, /images/historisch/gk-chesterton-foto-schriftsteller-768.webp 768w" sizes="(max-width: 640px) 192px, 224px" alt="G.K. Chesterton \u2013 Schriftsteller und Sch\u00F6pfer der Figur Father Brown" className="w-full" loading="lazy" />
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Pater Brown \u2013 im englischen Original{" "}
          <strong className="text-foreground">Father Brown</strong> \u2013 ist eine
          der ber\u00FChmtesten Detektivfiguren der Weltliteratur. Erfunden wurde
          er von dem britischen Schriftsteller{" "}
          <Link
            to="/g-k-chesterton"
            className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
          >
            Gilbert Keith Chesterton
          </Link>
          , der zwischen 1910 und 1935 insgesamt 49 Kurzgeschichten \u00FCber den
          scharfsinnigen Priester verfasste. Die Geschichten erschienen in
          f\u00FCnf Sammlungen:
        </p>

        <ol className="list-decimal list-inside space-y-1 text-lg leading-relaxed font-light text-foreground/70 pl-4">
          <li>
            <strong className="text-foreground">1911</strong> \u2013 Father Browns
            Einfalt (<em>The Innocence of Father Brown</em>)
          </li>
          <li>
            <strong className="text-foreground">1914</strong> \u2013 Father Browns
            Weisheit (<em>The Wisdom of Father Brown</em>)
          </li>
          <li>
            <strong className="text-foreground">1926</strong> \u2013 Father Browns
            Ungl\u00E4ubigkeit (<em>The Incredulity of Father Brown</em>)
          </li>
          <li>
            <strong className="text-foreground">1927</strong> \u2013 Father Browns
            Geheimnis (<em>The Secret of Father Brown</em>)
          </li>
          <li>
            <strong className="text-foreground">1935</strong> \u2013 Father Browns
            Skandal (<em>The Scandal of Father Brown</em>)
          </li>
        </ol>

        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Brown ist das Gegenteil eines klassischen Detektivhelden: klein,
          rundlich, kurzsichtig, mit einem gro\u00DFen Kopf und einem stets
          mitgef\u00FChrten Regenschirm. Sein \u00C4u\u00DFeres t\u00E4uscht \u2013 denn hinter der
          unscheinbaren Fassade verbirgt sich ein brillanter Menschenkenner.
          Im Gegensatz zu Sherlock Holmes, der seine F\u00E4lle durch logische
          Deduktion l\u00F6st, setzt Pater Brown auf{" "}
          <strong className="text-foreground">Einf\u00FChlung</strong>. Als
          Beichtvater hat er die tiefsten Abgr\u00FCnde der menschlichen Seele
          kennengelernt \u2013 und versteht deshalb die Motive der T\u00E4ter besser
          als jeder Ermittler.
        </p>

        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Sein ber\u00FChmtester Gegenspieler ist{" "}
          <strong className="text-foreground">Hercule Flambeau</strong>, ein
          genialer Meisterdieb, der sp\u00E4ter zum Privatdetektiv wird und Browns
          engster Freund. Die Dynamik zwischen dem bescheidenen Priester und
          dem schillernden Verbrecher geh\u00F6rt zu den faszinierendsten
          Beziehungen der Kriminalliteratur.
        </p>

        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Interessante Sprachnotiz: Im Deutschen hei\u00DFt er \u201EPater\u201C Brown,
          obwohl das Wort \u201EPater\u201C eigentlich nur f\u00FCr Ordenspriester verwendet
          wird. Im Englischen ist{" "}
          <Link
            to="/father-brown"
            className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
          >
            \u201EFather\u201C die \u00FCbliche Anrede
          </Link>{" "}
          f\u00FCr jeden katholischen Priester. Brown ist bei Chesterton ein
          Weltpriester \u2013 also ein Gemeindepfarrer, kein M\u00F6nch. Die
          Bezeichnungen \u201EPfarrer Brown\u201C oder \u201EVater Brown\u201C, nach denen
          ebenfalls h\u00E4ufig gesucht wird, beziehen sich auf dieselbe Figur.
        </p>

        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Das reale Vorbild f\u00FCr die Figur war{" "}
          <strong className="text-foreground">Father John O\u2019Connor</strong>,
          ein irischer Priester in Yorkshire, der Chesterton auf seinem Weg
          zum Katholizismus begleitete. Die Art, wie O\u2019Connor bei Gespr\u00E4chen
          \u00FCber Verbrechen \u00FCberraschende Einblicke in die menschliche Psyche
          zeigte, inspirierte Chesterton zur Erschaffung seiner Figur.
        </p>

        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Die Bedeutung von Pater Brown in der Literaturgeschichte ist
          beachtlich: Agatha Christie z\u00E4hlte ihn zu den besten Detektiven der
          Literatur. Franz Kafka war ein begeisterter Leser der Geschichten,
          ebenso Kurt Tucholsky. Der argentinische Schriftsteller Jorge Luis
          Borges bewunderte Chestertons Erz\u00E4hlkunst, und die britische
          Krimiautorin P.D. James lobte seine Brillanz als einer der
          herausragenden Krimiautoren der englischen Sprache.
        </p>
      </div>
    </div></section>

    {/* ── Kapitel 2: Film und Fernsehen ── */}
    <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
      <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">
        Kapitel 2
      </p>
      <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
        Pater Brown in Film und Fernsehen
      </h2>
      <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-10" aria-hidden="true" />

      <div className="space-y-12">
        {ADAPTATIONS.map((item, i) => (
          <div key={i}>
            <h3 className="text-gold font-heading text-2xl tracking-wider uppercase mb-4">
              {item.title}
            </h3>

            {item.image && (
              <div className="float-right ml-6 mb-4 w-40 sm:w-48">
                <div className="border border-foreground/10 overflow-hidden">
                  <img
                    src={`${item.image.basePath}.webp`}
                    srcSet={`${item.image.basePath}-480.webp 480w, ${item.image.basePath}-768.webp 768w`}
                    sizes="(max-width: 640px) 160px, 192px"
                    alt={item.image.alt}
                    className="w-full"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {item.content}

            {i < ADAPTATIONS.length - 1 && (
              <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent max-w-md mx-auto mt-10" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </div></section>

    {/* ── Kapitel 3: Hörspiel ── */}
    <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
      <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">
        Kapitel 3
      </p>
      <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
        Pater Brown als H\u00F6rspiel
      </h2>
      <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />

      <div className="space-y-4">
        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Die Geschichten von Pater Brown eignen sich hervorragend als
          H\u00F6rspiel: Die dialoglastigen Kurzgeschichten leben von Atmosph\u00E4re,
          Spannung und \u00FCberraschenden Wendungen \u2013 Elemente, die im akustischen
          Medium besonders gut zur Geltung kommen.
        </p>
        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Die bekannteste deutschsprachige H\u00F6rspieladaption stammt vom{" "}
          <strong className="text-foreground">Maritim Verlag</strong>. Mit
          Volker Brandt als Pater Brown und Hans Georg Panczak als Flambeau
          wurden \u00FCber 48 Geschichten vertont. Von den klassischen
          Maritim-H\u00F6rspielen bis hin zu modernen Produktionen \u2013 Pater Brown
          begleitet H\u00F6rspiel-Liebhaber seit Jahrzehnten.
        </p>
        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Mehr \u00FCber die H\u00F6rspiel-Geschichte, die vollst\u00E4ndige Folgen\u00FCbersicht
          und die Sprecher erfahren Sie auf der Seite{" "}
          <Link
            to="/hoerspiel"
            className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
          >
            Pater Brown H\u00F6rspiel
          </Link>
          .
        </p>
      </div>
    </div></section>

    {/* ── Kapitel 4: Das Live-Hörspiel ── */}
    <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
      <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">
        Kapitel 4
      </p>
      <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
        Pater Brown heute \u2013 Das Live-H\u00F6rspiel
      </h2>
      <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />

      <div className="w-full min-h-[250px] md:min-h-[400px] bg-cover bg-center border border-foreground/10 mb-8"
        style={{ backgroundImage: 'url(/images/buehne/pater-brown-dialog-szene-monot-mues-af-1200.webp)' }}
        role="img"
        aria-label="Live-H\u00F6rspiel-Szene: Antoine Monot und Wanja Mues im Dialog beim Pater Brown Live-H\u00F6rspiel"
      />

      <div className="space-y-4">
        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Seit 2025 gibt es eine neue Art, Pater Brown zu erleben:{" "}
          <strong className="text-foreground">
            <Link
              to="/live-hoerspiel"
              className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
            >
              PATER BROWN \u2013 Das Live-H\u00F6rspiel
            </Link>
          </strong>
          . Auf der B\u00FChne bringen drei K\u00FCnstler die Kriminalgeschichten von
          G.K. Chesterton zum Leben:
        </p>

        <div className="space-y-4">
          {CAST_CARDS.map((member) => (
            <Link
              key={member.slug}
              to={member.slug}
              className="block p-5 border border-foreground/10 group transition-all"
            >
              <h4 className="text-gold font-heading text-xl tracking-wider uppercase mb-2 group-hover:text-foreground transition-colors">
                {member.name}
              </h4>
              <p className="text-foreground/60 leading-relaxed text-base">
                {member.desc}
              </p>
            </Link>
          ))}
        </div>

        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          Pro Abend werden zwei spannende Kriminalgeschichten nach Chesterton
          aufgef\u00FChrt. Die Show dauert ca. 2 Stunden und ist ab 34,90 \u20AC
          erh\u00E4ltlich. Erleben Sie die einzigartige Kombination aus Theater,
          H\u00F6rspiel und Beatbox-Sounddesign live in Ihrer Stadt.
        </p>

        <div className="mt-6">
          <Link to="/termine" className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block">Alle Termine &amp; Tickets</Link>
        </div>
      </div>
    </div></section>

    <div className="w-[88%] max-w-4xl mx-auto"><div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" aria-hidden="true" /></div>

    {/* ── FAQ ── */}
    <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
      <FAQSection
        items={FAQ_ITEMS}
        label="Wissenswertes"
        title="H\u00E4ufige Fragen zu Pater Brown"
      />
    </div></section>

    {/* ── Weiterlesen ── */}
    <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
      <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">
        Weiterlesen
      </p>
      <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
        Mehr entdecken
      </h2>

      <nav className="grid sm:grid-cols-2 gap-3">
        {WEITERLESEN.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="p-4 border border-foreground/10 group transition-all"
          >
            <span className="text-gold font-heading text-lg tracking-wider uppercase group-hover:text-foreground transition-colors">
              {link.label}
            </span>
            <p className="text-foreground/50 text-sm mt-1">
              {link.desc}
            </p>
          </Link>
        ))}
      </nav>
    </div></section>
  </LandingLayout>
);

export default PaterBrown;
