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
    question: "Wer hat Pater Brown erfunden?",
    answer:
      `Die Figur des Pater Brown wurde von dem britischen Schriftsteller Gilbert Keith Chesterton (G.K. Chesterton) erschaffen. Die erste Geschichte, „The Blue Cross\u201C, erschien 1910 in einer Zeitschrift. Insgesamt schrieb Chesterton 49 Kurzgeschichten, die zwischen 1911 und 1935 in fünf Bänden veröffentlicht wurden.`,
  },
  {
    question: "Wie viele Pater-Brown-Geschichten gibt es?",
    answer:
      `Es gibt 49 Kurzgeschichten, veröffentlicht in fünf Bänden: „Father Browns Einfalt\u201C (1911), „Father Browns Weisheit\u201C (1914), „Father Browns Ungläubigkeit\u201C (1926), „Father Browns Geheimnis\u201C (1927) und „Father Browns Skandal\u201C (1935).`,
  },
  {
    question: "Wer spielte Pater Brown im Film?",
    answer:
      `Die bekanntesten Darsteller sind Alec Guinness (1954), Heinz Rühmann (1960\u20131968), Josef Meinrad (TV-Serie 1966\u20131972), Ottfried Fischer als „Pfarrer Braun\u201C (2003\u20132013) und Mark Williams in der BBC-Serie „Father Brown\u201C (seit 2013). In Italien übernahm Terence Hill als „Don Matteo\u201C eine an Pater Brown angelehnte Rolle.`,
  },
  {
    question:
      "Was ist der Unterschied zwischen Pater Brown und Father Brown?",
    answer:
      `Es handelt sich um dieselbe Figur. Im englischen Original heißt er „Father Brown\u201C \u2013 die übliche Anrede für einen katholischen Priester im Englischen. Im Deutschen wurde daraus „Pater Brown\u201C, obwohl „Pater\u201C eigentlich nur für Ordenspriester verwendet wird. Brown ist in Chestertons Geschichten jedoch ein Weltpriester bzw. Gemeindepfarrer.`,
  },
  {
    question: "Wo kann man Pater Brown live erleben?",
    answer:
      "Pater Brown gibt es als Live-Hörspiel auf Tour durch Deutschland und die Schweiz. Antoine Monot, Wanja Mues und Beatboxer Marvelin bringen die Geschichten von G.K. Chesterton live auf die Bühne. Alle Termine und Tickets finden Sie unter paterbrown.com/termine.",
  },
  {
    question: "Was ist ein Live-Hörspiel?",
    answer:
      `Ein Live-Hörspiel ist eine Aufführung, bei der ein Hörspiel live vor Publikum gespielt wird. Alle Stimmen, Geräusche und Soundeffekte entstehen in Echtzeit auf der Bühne \u2013 ohne Playback oder vorproduzierte Sounds. Mehr dazu erfahren Sie unter paterbrown.com/live-hoerspiel.`,
  },
];

/** Article Schema für die Pillar Page */
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Pater Brown – Die legendäre Figur von G.K. Chesterton",
  description:
    "Alles über Pater Brown: Von den Kurzgeschichten G.K. Chestertons über die Verfilmungen mit Heinz Rühmann und Mark Williams bis zum Live-Hörspiel auf Tour.",
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

const PaterBrown = () => (
  <LandingLayout breadcrumbs={[{ label: "Pater Brown" }]}>
    <SEO
      title="Pater Brown – Die legendäre Figur von G.K. Chesterton"
      description="Alles über Pater Brown: Von den Kurzgeschichten G.K. Chestertons über die Verfilmungen mit Heinz Rühmann bis zum Live-Hörspiel. Jetzt Tickets sichern!"
      canonical="/pater-brown"
      keywords="pater brown, father brown, pfarrer brown, pater braun, vater brown, pater brown darsteller, pater brown schauspieler, pater brown film"
      ogTitle="Pater Brown – Die legendäre Figur von G.K. Chesterton | paterbrown.com"
      ogDescription="Alles über Pater Brown: Kurzgeschichten, Verfilmungen, Hörspiele und das Live-Hörspiel auf Tour."
      ogImage="/images/og/pater-brown-krimi-live-og.webp"
    />

    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(articleSchema)}
      </script>
    </Helmet>

    {/* Header */}
    <div className="text-center space-y-4 mb-12">
      <p className="text-gold uppercase tracking-[0.3em] text-sm font-light">
        Die Figur
      </p>
      <h1 className="text-4xl sm:text-6xl md:text-8xl font-heading tracking-wider text-gold mb-4 uppercase">
        Pater Brown
      </h1>
      <p className="text-xl md:text-2xl text-foreground/80 font-light leading-relaxed max-w-2xl mx-auto">
        Der unscheinbare Priester, der seit über 100 Jahren Kriminalfälle löst
        – von den Kurzgeschichten über Film und Fernsehen bis auf die
        Live-Bühne.
      </p>
    </div>

    <Separator className="bg-gradient-to-r from-transparent via-gold to-transparent h-[1px] mb-12" />

    {/* Abschnitt 1: Wer ist Pater Brown? */}
    <section className="space-y-6 mb-16">
      <SectionHeading label="Kapitel 1" title="Wer ist Pater Brown?" />

      {/* Chesterton-Portrait */}
      <div className="float-right ml-6 mb-4 w-48 sm:w-56">
        <ResponsiveImage
          basePath="/images/historisch/gk-chesterton-foto-schriftsteller"
          alt="G.K. Chesterton – Schriftsteller und Schöpfer der Figur Father Brown"
          width={1223}
          height={1837}
          sizes="(max-width: 640px) 192px, 224px"
          className="rounded-lg"
          credit="Wikimedia Commons / Public Domain"
        />
      </div>

      <div className="text-foreground/80 leading-relaxed space-y-4">
        <p>
          Pater Brown – im englischen Original{" "}
          <strong className="text-foreground">Father Brown</strong> – ist eine
          der berühmtesten Detektivfiguren der Weltliteratur. Erfunden wurde
          er von dem britischen Schriftsteller{" "}
          <Link
            to="/g-k-chesterton"
            className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
          >
            Gilbert Keith Chesterton
          </Link>
          , der zwischen 1910 und 1935 insgesamt 49 Kurzgeschichten über den
          scharfsinnigen Priester verfasste. Die Geschichten erschienen in
          fünf Sammlungen:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-foreground/80 pl-4">
          <li>
            <strong className="text-foreground">1911</strong> – Father Browns
            Einfalt (<em>The Innocence of Father Brown</em>)
          </li>
          <li>
            <strong className="text-foreground">1914</strong> – Father Browns
            Weisheit (<em>The Wisdom of Father Brown</em>)
          </li>
          <li>
            <strong className="text-foreground">1926</strong> – Father Browns
            Ungläubigkeit (<em>The Incredulity of Father Brown</em>)
          </li>
          <li>
            <strong className="text-foreground">1927</strong> – Father Browns
            Geheimnis (<em>The Secret of Father Brown</em>)
          </li>
          <li>
            <strong className="text-foreground">1935</strong> – Father Browns
            Skandal (<em>The Scandal of Father Brown</em>)
          </li>
        </ol>
        <p>
          Brown ist das Gegenteil eines klassischen Detektivhelden: klein,
          rundlich, kurzsichtig, mit einem großen Kopf und einem stets
          mitgeführten Regenschirm. Sein Äußeres täuscht – denn hinter der
          unscheinbaren Fassade verbirgt sich ein brillanter Menschenkenner.
          Im Gegensatz zu Sherlock Holmes, der seine Fälle durch logische
          Deduktion löst, setzt Pater Brown auf{" "}
          <strong className="text-foreground">Einfühlung</strong>. Als
          Beichtvater hat er die tiefsten Abgründe der menschlichen Seele
          kennengelernt – und versteht deshalb die Motive der Täter besser
          als jeder Ermittler.
        </p>
        <p>
          Sein berühmtester Gegenspieler ist{" "}
          <strong className="text-foreground">Hercule Flambeau</strong>, ein
          genialer Meisterdieb, der später zum Privatdetektiv wird und
          Browns engster Freund. Die Dynamik zwischen dem bescheidenen
          Priester und dem schillernden Verbrecher gehört zu den
          faszinierendsten Beziehungen der Kriminalliteratur.
        </p>
        <p>
          Interessante Sprachnotiz: Im Deutschen heißt er „Pater" Brown,
          obwohl das Wort „Pater" eigentlich nur für Ordenspriester
          verwendet wird. Im Englischen ist{" "}
          <Link
            to="/father-brown"
            className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
          >
            „Father" die übliche Anrede
          </Link>{" "}
          für jeden katholischen Priester. Brown ist bei Chesterton ein
          Weltpriester – also ein Gemeindepfarrer, kein Mönch. Die
          Bezeichnungen „Pfarrer Brown" oder „Vater Brown", nach denen
          ebenfalls häufig gesucht wird, beziehen sich auf dieselbe Figur.
        </p>
        <p>
          Das reale Vorbild für die Figur war{" "}
          <strong className="text-foreground">Father John O'Connor</strong>,
          ein irischer Priester in Yorkshire, der Chesterton auf seinem Weg
          zum Katholizismus begleitete. Die Art, wie O'Connor bei
          Gesprächen über Verbrechen überraschende Einblicke in die
          menschliche Psyche zeigte, inspirierte Chesterton zur Erschaffung
          seiner Figur.
        </p>
        <p>
          Die Bedeutung von Pater Brown in der Literaturgeschichte ist
          beachtlich: Agatha Christie zählte ihn zu den besten Detektiven
          der Literatur. Franz Kafka war ein begeisterter Leser der
          Geschichten, ebenso Kurt Tucholsky. Der argentinische
          Schriftsteller Jorge Luis Borges bewunderte Chestertons
          Erzählkunst, und die britische Krimiautorin P.D. James lobte seine
          Brillanz als einer der herausragenden Krimiautoren der englischen
          Sprache.
        </p>
      </div>
    </section>

    {/* Abschnitt 2: Verfilmungen */}
    <section className="space-y-8 mb-16">
      <SectionHeading
        label="Kapitel 2"
        title="Pater Brown in Film und Fernsehen"
      />

      {/* Alec Guinness */}
      <div className="space-y-4">
        <h3 className="text-gold font-heading text-2xl tracking-wider uppercase">
          Alec Guinness (1954)
        </h3>
        <div className="text-foreground/80 leading-relaxed space-y-3">
          <p>
            Die erste bedeutende Verfilmung war „Die seltsamen Wege des
            Pater Brown" (<em>Father Brown</em>, 1954) unter der Regie von
            Robert Hamer. Alec Guinness – später weltberühmt als Obi-Wan
            Kenobi in Star Wars – spielte die Titelrolle. Der Film basiert
            auf der Erzählung „The Blue Cross" und gilt bis heute als eine
            der gelungensten Adaptionen der Figur. Guinness' Begegnung mit
            der Rolle trug übrigens zu seiner späteren Konversion zum
            Katholizismus bei.
          </p>
        </div>
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-foreground/10 to-transparent h-[1px]" />

      {/* Heinz Rühmann */}
      <div className="space-y-4">
        <h3 className="text-gold font-heading text-2xl tracking-wider uppercase">
          Heinz Rühmann (1960–1968)
        </h3>
        <div className="text-foreground/80 leading-relaxed space-y-3">
          {/* Rühmann-Portrait */}
          <div className="float-right ml-6 mb-4 w-40 sm:w-48">
            <ResponsiveImage
              basePath="/images/historisch/heinz-ruehmann-schauspieler-pater-brown-bundesarchiv"
              alt="Heinz Rühmann – Deutschlands bekanntester Pater-Brown-Darsteller in den Filmen Das schwarze Schaf und Er kanns nicht lassen"
              width={789}
              height={488}
              sizes="(max-width: 640px) 160px, 192px"
              className="rounded-lg"
              credit="Bundesarchiv"
              license="CC-BY-SA 3.0 DE"
            />
          </div>
          <p>
            Für das deutsche Publikum ist Heinz Rühmann untrennbar mit der
            Figur verbunden. In drei Filmen verkörperte er Pater Brown:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>
              <strong className="text-foreground">
                „Das schwarze Schaf"
              </strong>{" "}
              (1960, Regie: Helmut Ashley)
            </li>
            <li>
              <strong className="text-foreground">
                „Er kann's nicht lassen"
              </strong>{" "}
              (1962, Regie: Axel von Ambesser)
            </li>
            <li>
              <strong className="text-foreground">
                „Die Abenteuer des Kardinal Braun"
              </strong>{" "}
              (1968) – nicht mehr nach Chesterton
            </li>
          </ul>
          <p>
            Mit der unvergesslichen Musik von Martin Böttcher prägten diese
            Filme das deutsche Bild von Pater Brown maßgeblich. Ein Funfact:
            In „Er kann's nicht lassen" spielte Horst Tappert – der spätere
            „Derrick" – eine Nebenrolle als Trompeter. Die Rühmann-Filme
            werden bis heute regelmäßig zu Ostern und Weihnachten im
            öffentlich-rechtlichen Fernsehen gezeigt.
          </p>
        </div>
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-foreground/10 to-transparent h-[1px]" />

      {/* Josef Meinrad */}
      <div className="space-y-4">
        <h3 className="text-gold font-heading text-2xl tracking-wider uppercase">
          Josef Meinrad – TV-Serie (1966–1972)
        </h3>
        <div className="text-foreground/80 leading-relaxed space-y-3">
          <p>
            Die österreichisch-deutsche Fernsehserie mit Josef Meinrad
            umfasste 39 Folgen in fünf Staffeln und war eine der
            werkgetreuesten Verfilmungen der Chesterton-Geschichten. Die
            25-minütigen Episoden liefen im Vorabendprogramm und brachten
            die Originalgeschichten einem breiten Fernsehpublikum nahe.
          </p>
        </div>
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-foreground/10 to-transparent h-[1px]" />

      {/* Ottfried Fischer */}
      <div className="space-y-4">
        <h3 className="text-gold font-heading text-2xl tracking-wider uppercase">
          Ottfried Fischer als „Pfarrer Braun" (2003–2013)
        </h3>
        <div className="text-foreground/80 leading-relaxed space-y-3">
          <p>
            Die ARD-Reihe „Pfarrer Braun" mit Ottfried Fischer war lose an
            die Pater-Brown-Figur angelehnt. Der bayerische Pfarrer Guido
            Braun löst in der Serie Kriminalfälle mit Humor und
            Menschenkenntnis. Mit bis zu 8 Millionen Zuschauern pro
            Erstausstrahlung war die Serie ein großer Publikumserfolg. Die
            Titelmelodie stammte – wie bei den Rühmann-Filmen – von Martin
            Böttcher. Die Serie wurde 2013 aufgrund gesundheitlicher
            Probleme Fischers eingestellt.
          </p>
        </div>
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-foreground/10 to-transparent h-[1px]" />

      {/* BBC Mark Williams */}
      <div className="space-y-4">
        <h3 className="text-gold font-heading text-2xl tracking-wider uppercase">
          BBC – Father Brown mit Mark Williams (seit 2013)
        </h3>
        <div className="text-foreground/80 leading-relaxed space-y-3">
          <p>
            Die britische Krimiserie „Father Brown" auf BBC One ist die
            aktuell erfolgreichste Adaption. Mark Williams – vielen bekannt
            als Arthur Weasley aus den Harry-Potter-Filmen – spielt die
            Titelrolle. Die Serie spielt im England der 1950er Jahre im
            fiktiven Dorf Kembleford in den Cotswolds und umfasst seit
            ihrem Start im Januar 2013 über 13 Staffeln mit mehr als 140
            Episoden (Stand: Januar 2026).
          </p>
          <p>
            In Deutschland wird die Serie auf ZDFneo ausgestrahlt, bisher
            sind acht Staffeln deutsch synchronisiert. Seit 2022 gibt es
            zudem das Spin-off „Sister Boniface Mysteries". Gedreht wird
            die Serie in Blockley, Gloucestershire.
          </p>
        </div>
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-foreground/10 to-transparent h-[1px]" />

      {/* Don Matteo */}
      <div className="space-y-4">
        <h3 className="text-gold font-heading text-2xl tracking-wider uppercase">
          Don Matteo mit Terence Hill (seit 2000)
        </h3>
        <div className="text-foreground/80 leading-relaxed space-y-3">
          <p>
            Die italienische Fernsehserie „Don Matteo" auf Rai 1 nimmt
            Motive der Pater-Brown-Figur auf. Terence Hill (bürgerlich
            Mario Girotti) spielt einen ermittelnden Priester in
            Gubbio/Spoleto in Umbrien. Mit über 14 Staffeln, mehr als 200
            Folgen und bis zu 9 Millionen Zuschauern in Italien ist die
            Serie ein Quotengarant. In Deutschland ist sie seit 2022 auf
            Bibel TV zu sehen. Terence Hill erfüllte sich mit der Rolle
            einen Lebenstraum.
          </p>
        </div>
      </div>
    </section>

    {/* Abschnitt 3: Hörspiel */}
    <section className="space-y-6 mb-16">
      <SectionHeading label="Kapitel 3" title="Pater Brown als Hörspiel" />
      <div className="text-foreground/80 leading-relaxed space-y-4">
        <p>
          Die Geschichten von Pater Brown eignen sich hervorragend als
          Hörspiel: Die dialoglastigen Kurzgeschichten leben von
          Atmosphäre, Spannung und überraschenden Wendungen – Elemente, die
          im akustischen Medium besonders gut zur Geltung kommen.
        </p>
        <p>
          Die bekannteste deutschsprachige Hörspieladaption stammt vom{" "}
          <strong className="text-foreground">Maritim Verlag</strong>. Mit
          Volker Brandt als Pater Brown und Hans Georg Panczak als Flambeau
          wurden über 48 Geschichten vertont. Von den klassischen
          Maritim-Hörspielen bis hin zu modernen Produktionen – Pater Brown
          begleitet Hörspiel-Liebhaber seit Jahrzehnten.
        </p>
        <p>
          Mehr über die Hörspiel-Geschichte, die vollständige Folgenübersicht
          und die Sprecher erfahren Sie auf der Seite{" "}
          <Link
            to="/hoerspiel"
            className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
          >
            Pater Brown Hörspiel
          </Link>
          .
        </p>
      </div>
    </section>

    {/* Abschnitt 4: Das Live-Hörspiel */}
    <section className="space-y-6 mb-16">
      <SectionHeading
        label="Kapitel 4"
        title="Pater Brown heute – Das Live-Hörspiel"
      />

      {/* Bühnenfoto Dialog-Szene */}
      <div className="rounded-lg overflow-hidden mb-6">
        <ResponsiveImage
          basePath="/images/buehne/pater-brown-dialog-szene-monot-mues-af"
          alt="Live-Hörspiel-Szene: Antoine Monot und Wanja Mues im Dialog beim Pater Brown Live-Hörspiel"
          width={2000}
          height={1500}
          sizes="(max-width: 768px) 100vw, 800px"
          className="rounded-lg"
          credit="Alexander Frank"
        />
      </div>

      <div className="text-foreground/80 leading-relaxed space-y-4">
        <p>
          Seit 2025 gibt es eine neue Art, Pater Brown zu erleben:{" "}
          <strong className="text-foreground">
            <Link
              to="/live-hoerspiel"
              className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
            >
              PATER BROWN – Das Live-Hörspiel
            </Link>
          </strong>
          . Auf der Bühne bringen drei Künstler die Kriminalgeschichten von
          G.K. Chesterton zum Leben:
        </p>
        <div className="space-y-4">
          <div className="p-5 rounded-lg border border-foreground/10 bg-card/30">
            <h4 className="text-gold font-heading text-xl tracking-wider uppercase mb-2">
              <Link
                to="/antoine-monot"
                className="hover:text-gold/80 transition-colors"
              >
                Antoine Monot
              </Link>
            </h4>
            <p className="text-foreground/70 text-sm">
              Bekannt als Benni Hornberg in „Ein Fall für zwei" (ZDF).
              Schlüpft auf der Bühne in die Rolle des scharfsinnigen Pater
              Brown und erzählt als Erzähler die Geschichte.
            </p>
          </div>
          <div className="p-5 rounded-lg border border-foreground/10 bg-card/30">
            <h4 className="text-gold font-heading text-xl tracking-wider uppercase mb-2">
              <Link
                to="/wanja-mues"
                className="hover:text-gold/80 transition-colors"
              >
                Wanja Mues
              </Link>
            </h4>
            <p className="text-foreground/70 text-sm">
              Ebenfalls bekannt aus „Ein Fall für zwei" als Privatdetektiv
              Matula. Verkörpert den Meisterdieb Flambeau und zahlreiche
              weitere Charaktere.
            </p>
          </div>
          <div className="p-5 rounded-lg border border-foreground/10 bg-card/30">
            <h4 className="text-gold font-heading text-xl tracking-wider uppercase mb-2">
              <Link
                to="/marvelin"
                className="hover:text-gold/80 transition-colors"
              >
                Marvelin
              </Link>
            </h4>
            <p className="text-foreground/70 text-sm">
              Einer der besten Beatboxer Europas. Erzeugt sämtliche
              Geräusche der Show – von Schritten über Kirchenglocken bis zu
              Schüssen – ausschließlich live mit dem Mund.
            </p>
          </div>
        </div>
        <p>
          Pro Abend werden zwei spannende Kriminalgeschichten nach Chesterton
          aufgeführt. Die Show dauert ca. 2 Stunden und ist ab 34,90 €
          erhältlich. Erleben Sie die einzigartige Kombination aus Theater,
          Hörspiel und Beatbox-Sounddesign live in Ihrer Stadt.
        </p>
        <p className="mt-4">
          <Link
            to="/termine"
            className="text-gold hover:text-gold/80 transition-colors font-medium uppercase tracking-wider underline-offset-4 hover:underline"
          >
            Alle Termine & Tickets ansehen <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </section>

    <Separator className="bg-gradient-to-r from-transparent via-gold/30 to-transparent h-[1px]" />

    {/* FAQ */}
    <FAQSection
      items={FAQ_ITEMS}
      label="Wissenswertes"
      title="Häufige Fragen zu Pater Brown"
    />

    {/* Weiterführende Links */}
    <section className="mt-12 space-y-4">
      <SectionHeading label="Weiterlesen" title="Mehr entdecken" />
      <nav className="grid sm:grid-cols-2 gap-3">
        {[
          {
            to: "/live-hoerspiel",
            label: "Das Live-Hörspiel",
            desc: "Alles über das Format und die Show",
          },
          {
            to: "/termine",
            label: "Alle Termine",
            desc: "Tour-Daten und Tickets",
          },
          {
            to: "/g-k-chesterton",
            label: "G.K. Chesterton",
            desc: "Der Erfinder von Pater Brown",
          },
          {
            to: "/hoerspiel",
            label: "Pater Brown Hörspiel",
            desc: "Maritim-Klassiker und mehr",
          },
          {
            to: "/father-brown",
            label: "Father Brown",
            desc: "Die englische Originalfigur",
          },
          {
            to: "/krimi-hoerspiel",
            label: "Krimi-Hörspiel",
            desc: "Das Genre im Überblick",
          },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="p-4 rounded-lg border border-foreground/10 bg-card/30 hover:border-gold/30 transition-colors group"
          >
            <span className="text-gold font-heading text-lg tracking-wider uppercase group-hover:text-gold/80 transition-colors">
              {link.label}
            </span>
            <p className="text-foreground/50 text-sm mt-1">{link.desc}</p>
          </Link>
        ))}
      </nav>
    </section>
  </LandingLayout>
);

export default PaterBrown;
