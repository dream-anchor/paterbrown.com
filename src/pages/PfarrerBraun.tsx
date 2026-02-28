import { Link } from "react-router-dom";
import EditorialLayout from "@/components/editorial/EditorialLayout";
import { SEO } from "@/components/SEO";

const BREADCRUMBS = [
  { label: "Startseite", href: "/" },
  { label: "Pater Brown", href: "/pater-brown" },
  { label: "Pfarrer Braun" },
];

const TOC = [
  { id: "einfuehrung", label: "Die Serie im Überblick" },
  { id: "ottfried-fischer", label: "Ottfried Fischer — Porträt" },
  { id: "figuren", label: "Die Figuren der Serie" },
  { id: "episodenguide", label: "Episodenguide — Alle 22 Filme" },
  { id: "drehorte", label: "Schauplätze und Drehorte" },
  { id: "trivia", label: "Trivia und Hintergründe" },
  { id: "stammbaum", label: "Von Pater Brown zu Pfarrer Braun" },
  { id: "produktion", label: "Produktionsdaten" },
  { id: "quellen", label: "Quellen und Hinweise" },
];

const PfarrerBraun = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Pfarrer Braun — Die komplette Serienübersicht",
    description: "Komplette Übersicht der ARD-Krimireihe Pfarrer Braun (2003–2014) mit Ottfried Fischer: Alle 22 Episoden, Besetzung, Drehorte und Hintergrundinformationen.",
    url: "https://paterbrown.com/pfarrer-braun-ottfried-fischer",
    author: {
      "@type": "Organization",
      name: "paterbrown.com",
      url: "https://paterbrown.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Dream & Anchor Handelsgesellschaft mbH",
      url: "https://paterbrown.com",
    },
    mainEntityOfPage: "https://paterbrown.com/pfarrer-braun-ottfried-fischer",
    datePublished: "2026-02-28",
    dateModified: "2026-02-28",
    inLanguage: "de-DE",
    about: {
      "@type": "TVSeries",
      name: "Pfarrer Braun",
      numberOfEpisodes: 22,
      startDate: "2003-04-17",
      endDate: "2014-03-20",
      productionCompany: [
        { "@type": "Organization", name: "ARD Degeto" },
        { "@type": "Organization", name: "Polyphon Film- und Fernsehgesellschaft mbH" },
      ],
      actor: [
        { "@type": "Person", name: "Ottfried Fischer" },
        { "@type": "Person", name: "Peter Heinrich Brix" },
        { "@type": "Person", name: "Hans-Michael Rehberg" },
        { "@type": "Person", name: "Hansi Jochmann" },
        { "@type": "Person", name: "Antonio Wannek" },
        { "@type": "Person", name: "Gilbert von Sohlern" },
      ],
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: "https://paterbrown.com" },
      { "@type": "ListItem", position: 2, name: "Pater Brown", item: "https://paterbrown.com/pater-brown" },
      { "@type": "ListItem", position: 3, name: "Pfarrer Braun", item: "https://paterbrown.com/pfarrer-braun-ottfried-fischer" },
    ],
  };

  return (
    <EditorialLayout
      breadcrumbs={BREADCRUMBS}
      title="Pfarrer Braun — Die komplette Serienübersicht"
      subtitle="22 Filme mit Ottfried Fischer als ermittelnder Geistlicher (ARD, 2003–2014)"
      toc={TOC}
      lastUpdated="2026-02-28"
    >
      <SEO
        title="Pfarrer Braun — Alle 22 Filme mit Ottfried Fischer | Serienübersicht"
        description="Komplette Übersicht der ARD-Krimireihe Pfarrer Braun (2003–2014) mit Ottfried Fischer: Alle 22 Episoden, Besetzung, Drehorte, Trivia und Hintergrundinformationen."
        canonical="/pfarrer-braun-ottfried-fischer"
        keywords="pfarrer braun serie, ottfried fischer pfarrer braun, pfarrer braun episoden, pfarrer braun alle folgen, ard pfarrer braun, pfarrer braun besetzung drehorte"
        ogImage="/images/og/g-k-chesterton-pater-brown-og.webp"
        schema={[articleSchema, breadcrumbSchema]}
      />

      {/* ── Einführung ── */}
      <h2 id="einfuehrung">Die Serie im Überblick</h2>

      <p>
        „Pfarrer Braun" ist eine deutsche Krimireihe der ARD, die lose auf
        G.K. Chestertons <Link to="/pater-brown">Father-Brown-Erzählungen</Link> basiert.
        In 22 Fernsehfilmen, ausgestrahlt zwischen April 2003 und März 2014, ermittelt
        der bayerische Pfarrer Guido Braun in Mordfällen quer durch die Republik —
        sehr zum Leidwesen seines Bischofs, der ihn dafür regelmäßig strafversetzt.
      </p>

      <p>
        Hauptdarsteller Ottfried Fischer verkörperte die Titelfigur als schlagfertigen,
        bibelfesten Geistlichen mit einem untrüglichen Gespür für menschliche Abgründe.
        Die Titelmusik von Martin Böttcher greift Motive seiner eigenen Filmmusik aus
        den Heinz-Rühmann-Filmen „Das schwarze Schaf" (1960) und „Er kann's nicht lassen"
        (1962) auf — und schlägt damit eine musikalische Brücke zwischen den verschiedenen
        Generationen der Pater-Brown-Verfilmungen.
      </p>

      <p>
        Die Erstausstrahlungen erreichten bis zu acht Millionen Zuschauer und machten
        „Pfarrer Braun" zu einer der erfolgreichsten ARD-Filmreihen der 2000er Jahre.
      </p>

      <hr />

      {/* ── Ottfried Fischer ── */}
      <h2 id="ottfried-fischer">Ottfried Fischer — Porträt</h2>

      <p>
        Ottfried Fischer wurde am 7. November 1953 in Ornatsöd bei Untergriesbach
        im Bayerischen Wald geboren und wuchs auf dem Bauernhof seines Vaters auf.
        Nach dem Abitur am Maristengymnasium Fürstenzell begann er ein Jurastudium
        an der Ludwig-Maximilians-Universität München, das er zugunsten der Bühne abbrach.
      </p>

      <p>
        1978 gründete er die Kabarettgruppe „Machtschattengewächse" im Münchner
        Hinterhoftheater. Seinen Durchbruch als Schauspieler erlebte er 1986 mit
        der BR-Produktion „Irgendwie und Sowieso", in der er die Rolle des Sir Quickly
        spielte — eine Figur, die zum Synonym für Fischers Schauspielstil wurde.
      </p>

      <p>
        Es folgten Kinoerfolge wie „Zärtliche Chaoten" (1987), „Go Trabi Go" (1991)
        und „Superstau" (1991). Seinen größten Fernseherfolg feierte Fischer als
        Kommissar Benno Berghammer in der Sat.1-Reihe „Der Bulle von Tölz" (1995–2009,
        69 Folgen), parallel dazu lief die Reihe „Der Pfundskerl" (1999–2005, Sat.1).
        Von 1995 bis 2012 moderierte er die Kabarettsendung „Ottis Schlachthof" im
        Bayerischen Rundfunk (173 Folgen).
      </p>

      <p>
        2008 gab Fischer öffentlich seine Parkinson-Erkrankung bekannt. Im Mai 2013
        teilte die Produktionsfirma mit, dass die fortschreitende Erkrankung das Ende
        der Reihe „Pfarrer Braun" erforderlich mache. Die letzte Folge „Brauns Heimkehr"
        wurde am 20. März 2014 ausgestrahlt. Fischer ist seit 2020 mit Simone Brandlmeier
        verheiratet und lebt in Gauting bei München.
      </p>

      <p>
        Buchveröffentlichungen: „Das Leben ein Skandal" (2013) und „Heimat ist da,
        wo dir die Todesanzeigen etwas sagen" (2019).
      </p>

      <hr />

      {/* ── Figuren ── */}
      <h2 id="figuren">Die Figuren der Serie</h2>

      <h3>Pfarrer Guido Braun (Ottfried Fischer)</h3>
      <p>
        Oberbayerischer katholischer Pfarrer mit einem Hang zum Kriminalisieren,
        den seine Vorgesetzten für höchst ungeistlich halten. Braun wird im Lauf
        der Serie regelmäßig von seinem Bischof strafversetzt — von der Nordseeküste
        über den Harz und Sachsen bis nach Oberbayern. In den Medien der Serienhandlung
        trägt er den Spitznamen „Tabernakel-Columbo". Bibelfest und schlagfertig,
        löst er Fälle durch Menschenkenntnis und Hartnäckigkeit. In der letzten Folge
        stirbt er während eines Gottesdienstes in Rom.
      </p>

      <h3>Bischof Sebastian Hemmelrath (Hans-Michael Rehberg, 1938–2017)</h3>
      <p>
        Brauns gottesfürchtiger, aber eigeninteressierter Vorgesetzter, der dessen
        Ermittlungen regelmäßig verbietet — erfolglos. Hemmelrath wettet gern mit
        Braun um Bibelstellen und verliert dabei meistens. Sein Lebenstraum, nach
        Rom berufen zu werden, erfüllt sich in der Schlussfolge: Er wird zum Kardinal
        ernannt.
      </p>

      <h3>Margot Roßhauptner (Hansi Jochmann) — Episoden 1–20</h3>
      <p>
        Brauns Berliner Haushälterin, im oberbayerischen Dialekt der Serie liebevoll
        „die Roßhauptnerin" genannt. Kommentiert keck die Ermittlungen ihres Dienstherrn,
        unterstützt ihn aber bei Bedarf tatkräftig. Berüchtigt für ihren waghalsigen Fahrstil.
        Ab Episode 21 wird sie durch Haushälterin Inge Haller (Gundi Ellert) ersetzt.
      </p>

      <h3>Armin Knopp (Antonio Wannek)</h3>
      <p>
        Brauns Messner, der in der ersten Folge aus dem Gefängnis befreit wird. Seine
        dort erworbenen Fähigkeiten — Schlösser öffnen, Gebärdensprache — erweisen
        sich bei den Ermittlungen als nützlich. Knopp verliebt sich in fast jeder Folge
        neu, doch die Strafversetzungen machen jede Romanze zunichte.
      </p>

      <h3>Hauptkommissar Albin Geiger (Peter Heinrich Brix)</h3>
      <p>
        Eher tollpatschiger Polizist, der ebenfalls häufig versetzt wird und ab
        der dritten Folge ein Zweckbündnis mit Braun eingeht. In Folge 13 wird er
        zum Landeskriminalamt befördert.
      </p>

      <h3>Monsignore Anselm Mühlich (Gilbert von Sohlern)</h3>
      <p>
        Adlatus des Bischofs und Brauns beständiger Gegenspieler innerhalb der
        Kirchenhierarchie. Intrigant und ehrgeizig, zieht er am Ende aber stets
        den Kürzeren. Verrät dem Bischof bei Bibelwetten die richtigen Stellen.
      </p>

      <hr />

      {/* ── Episodenguide ── */}
      <h2 id="episodenguide">Episodenguide — Alle 22 Filme</h2>

      <table>
        <thead>
          <tr>
            <th>Nr.</th>
            <th>Titel</th>
            <th>Erstausstrahlung</th>
            <th>Regie</th>
            <th>Drehbuch</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>Der siebte Tempel</td><td>17.04.2003</td><td>Martin Gies</td><td>Wolfgang Limmer</td></tr>
          <tr><td>2</td><td>Das Skelett in den Dünen</td><td>25.04.2003</td><td>Martin Gies</td><td>Wolfgang Limmer</td></tr>
          <tr><td>3</td><td>Ein verhexter Fall</td><td>15.04.2004</td><td>Dirk Regel</td><td>Wolfgang Limmer</td></tr>
          <tr><td>4</td><td>Der Fluch der Pröpstin</td><td>22.04.2004</td><td>Dirk Regel</td><td>Wolfgang Limmer</td></tr>
          <tr><td>5</td><td>Bruder Mord</td><td>31.03.2005</td><td>Dirk Regel</td><td>Jörg Brückner</td></tr>
          <tr><td>6</td><td>Adel vernichtet</td><td>14.04.2005</td><td>Dirk Regel</td><td>Jörg Brückner</td></tr>
          <tr><td>7</td><td>Der unsichtbare Beweis</td><td>14.09.2006</td><td>Ulrich Stark</td><td>Arndt Stüwe</td></tr>
          <tr><td>8</td><td>Drei Särge und ein Baby</td><td>21.09.2006</td><td>Wolfgang F. Henschel</td><td>Cornelia Willinger, Stephan Reichenberger</td></tr>
          <tr><td>9</td><td>Kein Sterbenswörtchen</td><td>28.09.2006</td><td>Wolfgang F. Henschel</td><td>Jörg Brückner</td></tr>
          <tr><td>10</td><td>Ein Zeichen Gottes</td><td>29.03.2007</td><td>Wolfgang F. Henschel</td><td>Arndt Stüwe</td></tr>
          <tr><td>11</td><td>Das Erbe von Junkersdorf</td><td>05.04.2007</td><td>Wolfgang F. Henschel</td><td>Cornelia Willinger, Stephan Reichenberger</td></tr>
          <tr><td>12</td><td>Braun unter Verdacht</td><td>12.04.2007</td><td>Axel de Roche</td><td>Arndt Stüwe</td></tr>
          <tr><td>13</td><td>Die Gärten des Rabbiners</td><td>03.04.2008</td><td>Wolfgang F. Henschel</td><td>Hartmut Block</td></tr>
          <tr><td>14</td><td>Heiliger Birnbaum</td><td>10.04.2008</td><td>Wolfgang F. Henschel</td><td>Cornelia Willinger, Stephan Reichenberger</td></tr>
          <tr><td>15</td><td>Im Namen von Rose</td><td>09.04.2009</td><td>Wolfgang F. Henschel</td><td>Cornelia Willinger, Stephan Reichenberger</td></tr>
          <tr><td>16</td><td>Glück auf! Der Mörder kommt!</td><td>16.04.2009</td><td>Wolfgang F. Henschel</td><td>Cornelia Willinger, Stephan Reichenberger</td></tr>
          <tr><td>17</td><td>Schwein gehabt!</td><td>01.04.2010</td><td>Wolfgang F. Henschel</td><td>Ralf Kinder</td></tr>
          <tr><td>18</td><td>Kur mit Schatten</td><td>08.04.2010</td><td>Wolfgang F. Henschel</td><td>Cornelia Willinger, Stephan Reichenberger</td></tr>
          <tr><td>19</td><td>Grimms Mördchen</td><td>21.10.2010</td><td>Wolfgang F. Henschel</td><td>Cornelia Willinger, Stephan Reichenberger</td></tr>
          <tr><td>20</td><td>Altes Geld, junges Blut</td><td>17.02.2011</td><td>Wolfgang F. Henschel</td><td>Cornelia Willinger</td></tr>
          <tr><td>21</td><td>Ausgegeigt!</td><td>10.05.2012</td><td>Jürgen Bretzinger</td><td>Cornelia Willinger</td></tr>
          <tr><td>22</td><td>Brauns Heimkehr</td><td>20.03.2014</td><td>Wolfgang F. Henschel</td><td>Wolfgang Limmer</td></tr>
        </tbody>
      </table>

      <p>
        <strong>Stamm-Besetzung:</strong> Ottfried Fischer (Pfarrer Braun, 22 Folgen),
        Peter Heinrich Brix (Kommissar Geiger, 22), Hans-Michael Rehberg (Bischof Hemmelrath, 22),
        Gilbert von Sohlern (Monsignore Mühlich, 22), Antonio Wannek (Armin Knopp, 21),
        Hansi Jochmann (Margot Roßhauptner, 20), Gundi Ellert (Inge Haller, 2).
      </p>

      <hr />

      {/* ── Drehorte ── */}
      <h2 id="drehorte">Schauplätze und Drehorte</h2>

      <p>
        Ein besonderes Merkmal der Serie: Durch die Strafversetzungen Brauns
        wechseln die Schauplätze ständig. Jede Doppelfolge spielt in einer
        anderen Region Deutschlands — gedreht wurde an authentischen Orten.
      </p>

      <table>
        <thead>
          <tr>
            <th>Folgen</th>
            <th>Fiktiver Ort</th>
            <th>Reale Drehorte</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1–2</td><td>Nordseeinsel Nordersand</td><td>Greetsiel, Pilsum (Nordseeküste)</td></tr>
          <tr><td>3–4</td><td>Bangerode im Harz</td><td>Quedlinburg, Thale, Hexentanzplatz</td></tr>
          <tr><td>5–6</td><td>Rheinisches Kloster / Helsingweiler</td><td>Kloster Eberbach, Eltville (Rheingau)</td></tr>
          <tr><td>7–9</td><td>Pfaffenberg in Sachsen</td><td>Sächsische Schweiz, Elbsandsteingebirge, Meißen</td></tr>
          <tr><td>10–12</td><td>Fränkisches Weinland / Junkersdorf</td><td>Bamberg, Schloss Mainberg</td></tr>
          <tr><td>13–14</td><td>Ribbeck im Havelland</td><td>Ribbeck, Brandenburg</td></tr>
          <tr><td>15–16</td><td>St. Florian (Saarland)</td><td>Saarburg, Rheinland-Pfalz</td></tr>
          <tr><td>17–18</td><td>Usedom</td><td>Usedom</td></tr>
          <tr><td>19</td><td>Kassel-Region</td><td>Kassel, Nordhessen</td></tr>
          <tr><td>20–22</td><td>Nußdorf / Heimatort in Oberbayern</td><td>Murnau, Garmisch-Partenkirchen, Oberbayern</td></tr>
        </tbody>
      </table>

      <hr />

      {/* ── Trivia ── */}
      <h2 id="trivia">Trivia und Hintergründe</h2>

      <h3>Die Pater-Brown-Verbindung</h3>
      <p>
        Die Serie basiert lose auf G.K. Chestertons{" "}
        <Link to="/father-brown">Father-Brown-Erzählungen</Link>. Die musikalische
        Verbindung ist dabei besonders reizvoll: Die Titelmusik von Martin Böttcher
        zitiert seine eigene Filmmusik aus den Heinz-Rühmann-Verfilmungen „Das schwarze
        Schaf" (1960) und „Er kann's nicht lassen" (1962). Die Original-Melodie ist
        als Klingelton von Brauns Handy zu hören.
      </p>

      <h3>„Sir Quickly"</h3>
      <p>
        In Folge 8 („Drei Särge und ein Baby") erzählt Braun, er habe im
        Priesterseminar eine NSU Quickly gefahren und sei „Sir Quickly" genannt
        worden — eine augenzwinkernde Anspielung auf Fischers legendäre Kultrolle
        in „Irgendwie und Sowieso" (1986).
      </p>

      <h3>Der-Bulle-von-Tölz-Querverweise</h3>
      <p>
        In Folge 11 bemerkt Braun, ein Gemälde des Hl. Benno von Meißen passe
        körperlich nicht zu einem Benno — eine Anspielung auf Fischers Rolle als
        Benno Berghammer im „Bullen von Tölz". In Folge 3 spielte Michael Lerchenberg
        einen Richter; im „Bullen von Tölz" war Lerchenberg der Geistliche und Fischer
        der Ermittler. In der letzten Folge kehrt sich dieses Muster erneut um.
      </p>

      <h3>Der Burundi-Gag</h3>
      <p>
        In Folge 21 droht Monsignore Mühlich Braun mit einer Versetzung nach Burundi.
        Im Heinz-Rühmann-Film „Er kann's nicht lassen" (1962) wird Pater Brown nach
        „Urundi" strafversetzt — einer alten Bezeichnung für Burundi. Die Autoren
        zitierten damit bewusst die Vorlage.
      </p>

      <h3>Ein realer Fall als Vorlage</h3>
      <p>
        In Folge 20 („Altes Geld, junges Blut") foltern drei Rentner ihren
        Finanzberater wegen Verlusten in der Finanzkrise. Ein nahezu identischer
        Fall ereignete sich 2009 tatsächlich am Chiemsee.
      </p>

      <h3>Udo-Jürgens-Anspielung</h3>
      <p>
        In Folge 19 („Grimms Mördchen") heißt ein Haschdealer und ehemaliger
        Zwergendarsteller „Udo Bockelmann" — Udo Jürgens' bürgerlicher Name war
        Udo Jürgen Bockelmann.
      </p>

      <h3>Anrede-Gag: Exzellenz oder Eminenz?</h3>
      <p>
        Bischof Hemmelrath wird in der Serie mal als „Exzellenz", mal als „Eminenz"
        angeredet — wobei „Eminenz" kirchenprotokollgemäß nur Kardinälen zusteht.
        In Folge 21 weist Monsignore Mühlich ausdrücklich auf diesen Fehler hin.
        Als Hemmelrath in der letzten Folge tatsächlich zum Kardinal ernannt wird,
        besteht er sofort auf der nun korrekten „Eminenz".
      </p>

      <h3>Musikalischer Wechsel</h3>
      <p>
        In Folge 21 („Ausgegeigt!") stammt die Szenenmusik erstmals nicht von
        Martin Böttcher, sondern von Klaus Doldinger, bekannt für die Titelmusik
        des Tatort und den Soundtrack zu „Die unendliche Geschichte". Für die
        Schlussfolge „Brauns Heimkehr" kehrte Böttcher zurück.
      </p>

      <hr />

      {/* ── Stammbaum ── */}
      <h2 id="stammbaum">Von Pater Brown zu Pfarrer Braun</h2>

      <p>
        Die Figur des ermittelnden Geistlichen hat eine über hundertjährige Geschichte.
        Pfarrer Braun steht in einer Tradition, die von der Literatur über den Film
        bis zur Bühne reicht:
      </p>

      <ol>
        <li>
          <strong>G.K. Chesterton: Die Father-Brown-Erzählungen (1911–1935)</strong> — 52 Kurzgeschichten um einen unscheinbaren
          katholischen Priester, der Verbrechen durch Einfühlungsvermögen löst.{" "}
          <Link to="/g-k-chesterton">Mehr zu Chesterton</Link>.
        </li>
        <li>
          <strong>Heinz Rühmann: „Das schwarze Schaf" (1960) und „Er kann's nicht lassen" (1962)</strong> —
          Die ersten deutschen Verfilmungen, mit Filmmusik von Martin Böttcher, die zum
          akustischen Markenzeichen der Pater-Brown-Tradition wurde.
        </li>
        <li>
          <strong>Josef Meinrad: TV-Serie „Pater Brown" (1966–1972, ORF/ZDF)</strong> — 39 Folgen
          der österreichisch-deutschen Koproduktion.
        </li>
        <li>
          <strong>Ottfried Fischer: „Pfarrer Braun" (2003–2014, ARD)</strong> — 22 Filme, die
          Chestertons Grundidee ins moderne Bayern verpflanzen. Böttchers Musik schlägt
          die Brücke zu den Rühmann-Filmen.
        </li>
        <li>
          <strong>Pater Brown — Das Live-Hörspiel (seit 2025)</strong> — Eine zeitgenössische
          Adaption, die Chestertons Erzählungen auf die Theaterbühne bringt.{" "}
          <Link to="/live-hoerspiel">Zum Live-Hörspiel</Link>.
        </li>
      </ol>

      <hr />

      {/* ── Produktion ── */}
      <h2 id="produktion">Produktionsdaten</h2>

      <p><strong>Produktion:</strong> ARD Degeto / Polyphon Film- und Fernsehgesellschaft mbH</p>
      <p><strong>Ausstrahlung:</strong> Das Erste (ARD), April 2003 – März 2014</p>
      <p><strong>Musik:</strong> Martin Böttcher (Folgen 1–20, 22), Klaus Doldinger (Folge 21)</p>
      <p>
        <strong>Kamera</strong> (wechselnd): Randolf Scherraus, Peter Ziesche, Thomas Etzold,
        Thomas Meyer, Gerhard Schirlo, Johannes Kirchlechner, Theo Müller, Dragan Rogulj,
        Stefan Spreer
      </p>

      <hr />

      {/* ── Quellen ── */}
      <h2 id="quellen">Quellen und Hinweise</h2>

      <p>
        <em>
          Diese Seite ist eine redaktionelle Zusammenstellung von paterbrown.com
          und dient der Dokumentation der ARD-Krimireihe „Pfarrer Braun" (2003–2014).
          Alle Inhalte sind eigenständig recherchiert und formuliert.
          Episodendaten basieren auf öffentlich zugänglichen Sendeinformationen.
          paterbrown.com steht in keiner Verbindung zur ARD, ARD Degeto
          oder der Polyphon Film- und Fernsehgesellschaft mbH.
        </em>
      </p>

      <p>
        Siehe auch: <Link to="/pater-brown">Die Figur des Pater Brown</Link> |{" "}
        <Link to="/g-k-chesterton">G.K. Chesterton</Link> |{" "}
        <Link to="/father-brown">Father Brown in der Literatur</Link>
      </p>

      <p>
        Die Tradition des ermittelnden Geistlichen lebt auf der Bühne weiter:
        Das <Link to="/live-hoerspiel">Pater Brown Live-Hörspiel</Link> bringt
        Chestertons Kriminalgeschichten als Theatererlebnis auf die Bühne.
      </p>
    </EditorialLayout>
  );
};

export default PfarrerBraun;
