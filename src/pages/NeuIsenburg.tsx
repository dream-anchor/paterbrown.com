import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "neu-isenburg",
  cityName: "Neu-Isenburg",
  cityFilter: "Neu-Isenburg",
  addressRegion: "Hessen",
  addressCountry: "DE",
  noCurrentEvent: true,
  comingSoonText:
    "Die Shows in Neu-Isenburg waren ein gro\u00DFer Erfolg! Aktuell sind keine neuen Termine in der Hugenottenhalle geplant. Schauen Sie sich unsere aktuellen Tourtermine an \u2013 vielleicht ist eine Show in Ihrer N\u00E4he dabei.",
  nearbyCities: [
    { slug: "giessen", name: "Gie\u00DFen" },
    { slug: "baunatal-kassel", name: "Baunatal/Kassel" },
  ],
  venue: {
    name: "Hugenottenhalle Neu-Isenburg",
    address: "Frankfurter Str. 152, 63263 Neu-Isenburg",
    description:
      "Die Hugenottenhalle Neu-Isenburg ist das kulturelle Herz der Stadt am s\u00FCdlichen Rand von Frankfurt am Main. Die vielseitige Veranstaltungshalle war bereits Schauplatz erfolgreicher Pater-Brown-Gastspiele und bietet mit ihrer warmen Akustik und dem einladenden Ambiente den perfekten Rahmen f\u00FCr ein Live-H\u00F6rspiel.",
    oepnv:
      "S-Bahn S3/S4 bis Neu-Isenburg (ca. 10 Minuten von Frankfurt Hbf), dann ca. 5 Minuten zu Fu\u00DF. Buslinie OF-30 h\u00E4lt direkt an der Hugenottenhalle.",
    parking:
      "Parkpl\u00E4tze direkt an der Hugenottenhalle vorhanden. Alternativ: Parkplatz am Marktplatz.",
  },
  tips: {
    restaurants: [
      "Frankfurter Haus (Frankfurter Str. 70) \u2013 Regionale K\u00FCche in gem\u00FCtlichem Ambiente",
      "Isenburgsche Burg (Hugenottenallee 45) \u2013 Restaurant mit Geschichte",
      "Sachsenhausen (Frankfurt, ca. 15 Min.) \u2013 Apfelweinlokale und hessische Gastronomie",
      "Kleinmarkthalle Frankfurt (ca. 20 Min.) \u2013 Kulinarische Vielfalt in Frankfurts traditionsreicher Markthalle",
    ],
    hotels: [
      "Kempinski Hotel Frankfurt-Gravenbruch \u2013 Luxushotel im Gr\u00FCnen, ca. 5 Min. mit dem Auto",
      "Best Western Macrander (Neu-Isenburg) \u2013 Komfortables Hotel mit guter Anbindung",
      "Hotels in Frankfurt-Sachsenhausen \u2013 ca. 15 Minuten mit S-Bahn, vielf\u00E4ltiges Angebot",
    ],
    sights: [
      "Frankfurter R\u00F6merberg \u2013 historisches Herz der Mainmetropole (ca. 20 Min.)",
      "Museumsufer Frankfurt \u2013 Deutschlands dichteste Museumsmeile am Main",
      "St\u00E4del Museum \u2013 700 Jahre europ\u00E4ische Kunstgeschichte",
      "Palmengarten Frankfurt \u2013 botanischer Garten mit tropischen Pflanzenwelten",
    ],
  },
  faq: [
    {
      question: "War Pater Brown schon in Neu-Isenburg?",
      answer:
        "Ja, das Pater Brown Live-H\u00F6rspiel hat bereits erfolgreich in der Hugenottenhalle Neu-Isenburg gastiert. Die Shows waren ein voller Erfolg. Aktuelle Tourtermine finden Sie unter paterbrown.com/termine.",
    },
    {
      question: "Kommt Pater Brown wieder nach Neu-Isenburg?",
      answer:
        "Aktuell sind keine neuen Termine in Neu-Isenburg geplant. Sobald weitere Gastspiele feststehen, finden Sie sie hier und auf unserer Termine-Seite. Tragen Sie sich in unseren Newsletter ein, um als Erster informiert zu werden.",
    },
    {
      question: "Wo findet die Show in Neu-Isenburg statt?",
      answer:
        "Das Live-H\u00F6rspiel fand in der Hugenottenhalle Neu-Isenburg statt, Frankfurter Str. 152, 63263 Neu-Isenburg. Die Halle liegt zentral in der Stadt und ist von Frankfurt am Main aus schnell erreichbar.",
    },
    {
      question: "Was ist das Pater Brown Live-H\u00F6rspiel?",
      answer:
        `Ein einzigartiges B\u00FChnenerlebnis: Antoine Monot und Wanja Mues (bekannt aus \u201EEin Fall f\u00FCr zwei\u201C, ZDF) spielen live Kriminalgeschichten nach G.K. Chesterton. Beatboxer Marvelin erzeugt dabei alle Ger\u00E4usche und Soundeffekte live mit dem Mund \u2013 ohne Playback. Mehr unter paterbrown.com/live-hoerspiel.`,
    },
    {
      question: "Gibt es \u00E4hnliche Shows in der Region?",
      answer:
        "Ja! Das Pater Brown Live-H\u00F6rspiel tourt durch ganz Deutschland und die Schweiz. In Hessen finden Shows unter anderem in Gie\u00DFen und Baunatal/Kassel statt. Alle Termine unter paterbrown.com/termine.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-H\u00F6rspiel in Neu-Isenburg \u2013 Hugenottenhalle | R\u00FCckblick",
    description:
      "Pater Brown Live-H\u00F6rspiel in Neu-Isenburg, Hugenottenhalle. R\u00FCckblick auf erfolgreiche Gastspiele. Antoine Monot, Wanja Mues & Marvelin. Aktuelle Tourtermine entdecken!",
    keywords:
      "pater brown neu-isenburg, pater brown hugenottenhalle, pater brown live frankfurt, pater brown neu isenburg, live h\u00F6rspiel neu-isenburg",
  },
};

const NeuIsenburg = () => <CityLandingPage config={config} />;

export default NeuIsenburg;
