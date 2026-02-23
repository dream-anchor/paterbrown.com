import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import FAQSection from "@/components/landing/FAQSection";
import ResponsiveImage from "@/components/landing/ResponsiveImage";
import Section from "@/components/ui/Section";
import SerifText from "@/components/ui/SerifText";
import GhostButton from "@/components/ui/GhostButton";
import { SEO } from "@/components/SEO";

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

/* ─── Verfilmungen-Daten ─── */
const ADAPTATIONS = [
  {
    title: "Alec Guinness (1954)",
    content: (
      <SerifText size="lg" className="text-foreground/70">
        Die erste bedeutende Verfilmung war „Die seltsamen Wege des Pater
        Brown" (<em>Father Brown</em>, 1954) unter der Regie von Robert Hamer.
        Alec Guinness – später weltberühmt als Obi-Wan Kenobi in Star Wars –
        spielte die Titelrolle. Der Film basiert auf der Erzählung „The Blue
        Cross" und gilt bis heute als eine der gelungensten Adaptionen der
        Figur. Guinness' Begegnung mit der Rolle trug übrigens zu seiner
        späteren Konversion zum Katholizismus bei.
      </SerifText>
    ),
  },
  {
    title: "Heinz Rühmann (1960–1968)",
    image: {
      basePath: "/images/historisch/heinz-ruehmann-schauspieler-pater-brown-bundesarchiv",
      alt: "Heinz Rühmann – Deutschlands bekanntester Pater-Brown-Darsteller in den Filmen Das schwarze Schaf und Er kanns nicht lassen",
      width: 789,
      height: 488,
      credit: "Bundesarchiv",
      license: "CC-BY-SA 3.0 DE",
    },
    content: (
      <div className="space-y-3">
        <SerifText size="lg" className="text-foreground/70">
          Für das deutsche Publikum ist Heinz Rühmann untrennbar mit der Figur
          verbunden. In drei Filmen verkörperte er Pater Brown:
        </SerifText>
        <ul className="list-disc list-inside space-y-1 text-foreground/70 font-serif text-lg leading-[1.3] tracking-[0.05em] normal-case pl-4">
          <li>
            <strong className="text-foreground">„Das schwarze Schaf"</strong>{" "}
            (1960, Regie: Helmut Ashley)
          </li>
          <li>
            <strong className="text-foreground">„Er kann's nicht lassen"</strong>{" "}
            (1962, Regie: Axel von Ambesser)
          </li>
          <li>
            <strong className="text-foreground">„Die Abenteuer des Kardinal Braun"</strong>{" "}
            (1968) – nicht mehr nach Chesterton
          </li>
        </ul>
        <SerifText size="lg" className="text-foreground/70">
          Mit der unvergesslichen Musik von Martin Böttcher prägten diese Filme
          das deutsche Bild von Pater Brown maßgeblich. Ein Funfact: In „Er
          kann's nicht lassen" spielte Horst Tappert – der spätere „Derrick" –
          eine Nebenrolle als Trompeter. Die Rühmann-Filme werden bis heute
          regelmäßig zu Ostern und Weihnachten im öffentlich-rechtlichen
          Fernsehen gezeigt.
        </SerifText>
      </div>
    ),
  },
  {
    title: "Josef Meinrad – TV-Serie (1966–1972)",
    content: (
      <SerifText size="lg" className="text-foreground/70">
        Die österreichisch-deutsche Fernsehserie mit Josef Meinrad umfasste 39
        Folgen in fünf Staffeln und war eine der werkgetreuesten Verfilmungen
        der Chesterton-Geschichten. Die 25-minütigen Episoden liefen im
        Vorabendprogramm und brachten die Originalgeschichten einem breiten
        Fernsehpublikum nahe.
      </SerifText>
    ),
  },
  {
    title: "Ottfried Fischer als \u201EPfarrer Braun\u201C (2003\u20132013)",
    content: (
      <SerifText size="lg" className="text-foreground/70">
        Die ARD-Reihe „Pfarrer Braun" mit Ottfried Fischer war lose an die
        Pater-Brown-Figur angelehnt. Der bayerische Pfarrer Guido Braun löst in
        der Serie Kriminalfälle mit Humor und Menschenkenntnis. Mit bis zu 8
        Millionen Zuschauern pro Erstausstrahlung war die Serie ein großer
        Publikumserfolg. Die Titelmelodie stammte – wie bei den Rühmann-Filmen –
        von Martin Böttcher. Die Serie wurde 2013 aufgrund gesundheitlicher
        Probleme Fischers eingestellt.
      </SerifText>
    ),
  },
  {
    title: "BBC – Father Brown mit Mark Williams (seit 2013)",
    content: (
      <div className="space-y-3">
        <SerifText size="lg" className="text-foreground/70">
          Die britische Krimiserie „Father Brown" auf BBC One ist die aktuell
          erfolgreichste Adaption. Mark Williams – vielen bekannt als Arthur
          Weasley aus den Harry-Potter-Filmen – spielt die Titelrolle. Die Serie
          spielt im England der 1950er Jahre im fiktiven Dorf Kembleford in den
          Cotswolds und umfasst seit ihrem Start im Januar 2013 über 13 Staffeln
          mit mehr als 140 Episoden (Stand: Januar 2026).
        </SerifText>
        <SerifText size="lg" className="text-foreground/70">
          In Deutschland wird die Serie auf ZDFneo ausgestrahlt, bisher sind acht
          Staffeln deutsch synchronisiert. Seit 2022 gibt es zudem das Spin-off
          „Sister Boniface Mysteries". Gedreht wird die Serie in Blockley,
          Gloucestershire.
        </SerifText>
      </div>
    ),
  },
  {
    title: "Don Matteo mit Terence Hill (seit 2000)",
    content: (
      <SerifText size="lg" className="text-foreground/70">
        Die italienische Fernsehserie „Don Matteo" auf Rai 1 nimmt Motive der
        Pater-Brown-Figur auf. Terence Hill (bürgerlich Mario Girotti) spielt
        einen ermittelnden Priester in Gubbio/Spoleto in Umbrien. Mit über 14
        Staffeln, mehr als 200 Folgen und bis zu 9 Millionen Zuschauern in
        Italien ist die Serie ein Quotengarant. In Deutschland ist sie seit 2022
        auf Bibel TV zu sehen. Terence Hill erfüllte sich mit der Rolle einen
        Lebenstraum.
      </SerifText>
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
    desc: "Einer der besten Beatboxer Europas. Erzeugt sämtliche Geräusche der Show – von Schritten über Kirchenglocken bis zu Schüssen – ausschließlich live mit dem Mund.",
  },
];

const WEITERLESEN = [
  { to: "/live-hoerspiel", label: "Das Live-Hörspiel", desc: "Alles über das Format und die Show" },
  { to: "/termine", label: "Alle Termine", desc: "Tour-Daten und Tickets" },
  { to: "/g-k-chesterton", label: "G.K. Chesterton", desc: "Der Erfinder von Pater Brown" },
  { to: "/hoerspiel", label: "Pater Brown Hörspiel", desc: "Maritim-Klassiker und mehr" },
  { to: "/father-brown", label: "Father Brown", desc: "Die englische Originalfigur" },
  { to: "/krimi-hoerspiel", label: "Krimi-Hörspiel", desc: "Das Genre im Überblick" },
];

const PaterBrown = () => (
  <LandingLayout
    breadcrumbs={[{ label: "Pater Brown" }]}
    heroTitle="Pater Brown"
    heroSubtitle="Der unscheinbare Priester, der seit über 100 Jahren Kriminalfälle löst – von den Kurzgeschichten über Film und Fernsehen bis auf die Live-Bühne."
    showCTA
  >
    <SEO
      title="Pater Brown – Die legendäre Figur von G.K. Chesterton"
      description="Alles über Pater Brown: Von den Kurzgeschichten G.K. Chestertons über die Verfilmungen mit Heinz Rühmann bis zum Live-Hörspiel. Jetzt Tickets sichern!"
      canonical="/pater-brown"
      keywords="pater brown, father brown, pfarrer brown, pater braun, vater brown, pater brown darsteller, pater brown schauspieler, pater brown film"
      ogTitle="Pater Brown – Die legendäre Figur von G.K. Chesterton | paterbrown.com"
      ogDescription="Alles über Pater Brown: Kurzgeschichten, Verfilmungen, Hörspiele und das Live-Hörspiel auf Tour."
      ogImage="/images/og/pater-brown-krimi-live-og.webp"
      schema={articleSchema}
    />

    {/* ── Kapitel 1: Wer ist Pater Brown? ── */}
    <Section container="narrow" className="py-16 md:py-24">
      <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
        Kapitel 1
      </p>
      <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground mb-4">
        Wer ist Pater Brown?
      </h2>
      <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />

      <div className="float-right ml-6 mb-4 w-48 sm:w-56">
        <div className="card-glow rounded-[3px] overflow-hidden">
          <ResponsiveImage
            basePath="/images/historisch/gk-chesterton-foto-schriftsteller"
            alt="G.K. Chesterton – Schriftsteller und Schöpfer der Figur Father Brown"
            width={1223}
            height={1837}
            sizes="(max-width: 640px) 192px, 224px"
            credit="Wikimedia Commons / Public Domain"
          />
        </div>
      </div>

      <div className="space-y-4">
        <SerifText size="lg" className="text-foreground/70">
          Pater Brown – im englischen Original{" "}
          <strong className="text-foreground">Father Brown</strong> – ist eine
          der berühmtesten Detektivfiguren der Weltliteratur. Erfunden wurde
          er von dem britischen Schriftsteller{" "}
          <Link
            to="/g-k-chesterton"
            className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
          >
            Gilbert Keith Chesterton
          </Link>
          , der zwischen 1910 und 1935 insgesamt 49 Kurzgeschichten über den
          scharfsinnigen Priester verfasste. Die Geschichten erschienen in
          fünf Sammlungen:
        </SerifText>

        <ol className="list-decimal list-inside space-y-1 font-serif text-lg leading-[1.3] tracking-[0.05em] normal-case text-foreground/70 pl-4">
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

        <SerifText size="lg" className="text-foreground/70">
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
        </SerifText>

        <SerifText size="lg" className="text-foreground/70">
          Sein berühmtester Gegenspieler ist{" "}
          <strong className="text-foreground">Hercule Flambeau</strong>, ein
          genialer Meisterdieb, der später zum Privatdetektiv wird und Browns
          engster Freund. Die Dynamik zwischen dem bescheidenen Priester und
          dem schillernden Verbrecher gehört zu den faszinierendsten
          Beziehungen der Kriminalliteratur.
        </SerifText>

        <SerifText size="lg" className="text-foreground/70">
          Interessante Sprachnotiz: Im Deutschen heißt er „Pater" Brown,
          obwohl das Wort „Pater" eigentlich nur für Ordenspriester verwendet
          wird. Im Englischen ist{" "}
          <Link
            to="/father-brown"
            className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
          >
            „Father" die übliche Anrede
          </Link>{" "}
          für jeden katholischen Priester. Brown ist bei Chesterton ein
          Weltpriester – also ein Gemeindepfarrer, kein Mönch. Die
          Bezeichnungen „Pfarrer Brown" oder „Vater Brown", nach denen
          ebenfalls häufig gesucht wird, beziehen sich auf dieselbe Figur.
        </SerifText>

        <SerifText size="lg" className="text-foreground/70">
          Das reale Vorbild für die Figur war{" "}
          <strong className="text-foreground">Father John O'Connor</strong>,
          ein irischer Priester in Yorkshire, der Chesterton auf seinem Weg
          zum Katholizismus begleitete. Die Art, wie O'Connor bei Gesprächen
          über Verbrechen überraschende Einblicke in die menschliche Psyche
          zeigte, inspirierte Chesterton zur Erschaffung seiner Figur.
        </SerifText>

        <SerifText size="lg" className="text-foreground/70">
          Die Bedeutung von Pater Brown in der Literaturgeschichte ist
          beachtlich: Agatha Christie zählte ihn zu den besten Detektiven der
          Literatur. Franz Kafka war ein begeisterter Leser der Geschichten,
          ebenso Kurt Tucholsky. Der argentinische Schriftsteller Jorge Luis
          Borges bewunderte Chestertons Erzählkunst, und die britische
          Krimiautorin P.D. James lobte seine Brillanz als einer der
          herausragenden Krimiautoren der englischen Sprache.
        </SerifText>
      </div>
    </Section>

    {/* ── Kapitel 2: Film und Fernsehen ── */}
    <Section container="narrow" className="py-16 md:py-24">
      <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
        Kapitel 2
      </p>
      <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground mb-4">
        Pater Brown in Film und Fernsehen
      </h2>
      <div className="divider-gold mb-10 max-w-xs" aria-hidden="true" />

      <div className="space-y-12">
        {ADAPTATIONS.map((item, i) => (
          <div key={i}>
            <h3 className="text-primary font-heading text-2xl tracking-wider uppercase mb-4">
              {item.title}
            </h3>

            {item.image && (
              <div className="float-right ml-6 mb-4 w-40 sm:w-48">
                <div className="card-glow rounded-[3px] overflow-hidden">
                  <ResponsiveImage
                    basePath={item.image.basePath}
                    alt={item.image.alt}
                    width={item.image.width}
                    height={item.image.height}
                    sizes="(max-width: 640px) 160px, 192px"
                    credit={item.image.credit}
                    license={item.image.license}
                  />
                </div>
              </div>
            )}

            {item.content}

            {i < ADAPTATIONS.length - 1 && (
              <div className="divider-gold mt-10" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </Section>

    {/* ── Kapitel 3: Hörspiel ── */}
    <Section container="narrow" className="py-16 md:py-24">
      <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
        Kapitel 3
      </p>
      <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground mb-4">
        Pater Brown als Hörspiel
      </h2>
      <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />

      <div className="space-y-4">
        <SerifText size="lg" className="text-foreground/70">
          Die Geschichten von Pater Brown eignen sich hervorragend als
          Hörspiel: Die dialoglastigen Kurzgeschichten leben von Atmosphäre,
          Spannung und überraschenden Wendungen – Elemente, die im akustischen
          Medium besonders gut zur Geltung kommen.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70">
          Die bekannteste deutschsprachige Hörspieladaption stammt vom{" "}
          <strong className="text-foreground">Maritim Verlag</strong>. Mit
          Volker Brandt als Pater Brown und Hans Georg Panczak als Flambeau
          wurden über 48 Geschichten vertont. Von den klassischen
          Maritim-Hörspielen bis hin zu modernen Produktionen – Pater Brown
          begleitet Hörspiel-Liebhaber seit Jahrzehnten.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70">
          Mehr über die Hörspiel-Geschichte, die vollständige Folgenübersicht
          und die Sprecher erfahren Sie auf der Seite{" "}
          <Link
            to="/hoerspiel"
            className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
          >
            Pater Brown Hörspiel
          </Link>
          .
        </SerifText>
      </div>
    </Section>

    {/* ── Kapitel 4: Das Live-Hörspiel ── */}
    <Section container="narrow" className="py-16 md:py-24">
      <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
        Kapitel 4
      </p>
      <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground mb-4">
        Pater Brown heute – Das Live-Hörspiel
      </h2>
      <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />

      <div className="card-glow rounded-[3px] overflow-hidden mb-8">
        <ResponsiveImage
          basePath="/images/buehne/pater-brown-dialog-szene-monot-mues-af"
          alt="Live-Hörspiel-Szene: Antoine Monot und Wanja Mues im Dialog beim Pater Brown Live-Hörspiel"
          width={2000}
          height={1500}
          sizes="(max-width: 768px) 88vw, 768px"
          credit="Alexander Frank"
        />
      </div>

      <div className="space-y-4">
        <SerifText size="lg" className="text-foreground/70">
          Seit 2025 gibt es eine neue Art, Pater Brown zu erleben:{" "}
          <strong className="text-foreground">
            <Link
              to="/live-hoerspiel"
              className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
            >
              PATER BROWN – Das Live-Hörspiel
            </Link>
          </strong>
          . Auf der Bühne bringen drei Künstler die Kriminalgeschichten von
          G.K. Chesterton zum Leben:
        </SerifText>

        <div className="space-y-4">
          {CAST_CARDS.map((member) => (
            <Link
              key={member.slug}
              to={member.slug}
              className="block p-5 card-glow rounded-[3px] group transition-all"
            >
              <h4 className="text-primary font-heading text-xl tracking-wider uppercase mb-2 group-hover:text-foreground transition-colors">
                {member.name}
              </h4>
              <SerifText className="text-foreground/60">
                {member.desc}
              </SerifText>
            </Link>
          ))}
        </div>

        <SerifText size="lg" className="text-foreground/70">
          Pro Abend werden zwei spannende Kriminalgeschichten nach Chesterton
          aufgeführt. Die Show dauert ca. 2 Stunden und ist ab 34,90 €
          erhältlich. Erleben Sie die einzigartige Kombination aus Theater,
          Hörspiel und Beatbox-Sounddesign live in Ihrer Stadt.
        </SerifText>

        <div className="mt-6">
          <GhostButton to="/termine">Alle Termine & Tickets</GhostButton>
        </div>
      </div>
    </Section>

    <div className="w-[88%] max-w-4xl mx-auto">
      <div className="divider-gold" aria-hidden="true" />
    </div>

    {/* ── FAQ ── */}
    <Section container="narrow" className="py-16 md:py-24">
      <FAQSection
        items={FAQ_ITEMS}
        label="Wissenswertes"
        title="Häufige Fragen zu Pater Brown"
      />
    </Section>

    {/* ── Weiterlesen ── */}
    <Section container="narrow" className="py-16 md:py-24">
      <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
        Weiterlesen
      </p>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-8">
        Mehr entdecken
      </h2>

      <nav className="grid sm:grid-cols-2 gap-3">
        {WEITERLESEN.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="p-4 card-glow rounded-[3px] group transition-all"
          >
            <span className="text-primary font-heading text-lg tracking-wider uppercase group-hover:text-foreground transition-colors">
              {link.label}
            </span>
            <p className="text-foreground/50 text-sm font-serif normal-case tracking-[0.05em] mt-1">
              {link.desc}
            </p>
          </Link>
        ))}
      </nav>
    </Section>
  </LandingLayout>
);

export default PaterBrown;
