import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "kempten",
  cityName: "Kempten",
  cityFilter: "Kempten",
  addressRegion: "Bayern",
  addressCountry: "DE",
  nearbyCities: [
    { slug: "muenchen", name: "M\u00FCnchen" },
    { slug: "erding", name: "Erding" },
  ],
  venue: {
    name: "Kornhaus Kempten",
    address: "Kornhausplatz 1, 87435 Kempten (Allg\u00E4u)",
    description:
      "Das Kornhaus Kempten ist ein historisches Veranstaltungsgeb\u00E4ude im Herzen der Allg\u00E4u-Metropole. Als eines der \u00E4ltesten Geb\u00E4ude der Stadt verbindet es Geschichte mit modernem Kulturprogramm. Die einzigartige Atmosph\u00E4re des historischen Geb\u00E4udes macht es zum perfekten Ort f\u00FCr ein Live-H\u00F6rspiel.",
    oepnv:
      "Vom Kemptener Hauptbahnhof ca. 10 Minuten zu Fu\u00DF durch die Innenstadt. Stadtbusse halten am Residenzplatz (ca. 3 Minuten Fu\u00DFweg).",
    parking:
      "Parkhaus Forum Allg\u00E4u oder Parkhaus Residenzplatz in der N\u00E4he. Stra\u00DFenparkpl\u00E4tze in der Umgebung.",
  },
  tips: {
    restaurants: [
      "Zum Stift (Stiftsplatz 1) \u2013 Bayerisch-schw\u00E4bische K\u00FCche in historischem Geb\u00E4ude",
      "Peterhof (Salzstr. 1) \u2013 Traditionsbrauerei mit Biergarten",
      "AllgAUER (Kronenstr. 30) \u2013 Regionale K\u00FCche mit modernem Twist",
      "Innenstadt-Caf\u00E9s entlang der Fu\u00DFg\u00E4ngerzone",
    ],
    hotels: [
      "Allg\u00E4u Art Hotel (Bahnhofstr. 3) \u2013 Modernes Hotel nahe Hauptbahnhof",
      "F\u00FCrstenhof (Salzstr. 3) \u2013 Traditionshotel in der Altstadt",
      "BigBOX Hotel Kempten \u2013 Budget-Option mit guter Anbindung",
    ],
    sights: [
      "F\u00FCrstliche Residenz Kempten \u2013 barocke Prunkr\u00E4ume, eine der bedeutendsten Residenzen S\u00FCddeutschlands",
      "Arch\u00E4ologischer Park Cambodunum \u2013 \u00DCberreste der r\u00F6mischen Stadt, Kempten ist eine der \u00E4ltesten St\u00E4dte Deutschlands",
      "Allg\u00E4uer Alpen \u2013 Wandern, Skifahren und Natur pur vor der Haust\u00FCr",
      "Schloss Neuschwanstein \u2013 ca. 45 Minuten Fahrt von Kempten",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Kempten?",
      answer:
        "Das Pater Brown Live-H\u00F6rspiel gastiert im Kornhaus Kempten. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Kempten statt?",
      answer:
        "Die Veranstaltung findet im Kornhaus Kempten statt, Kornhausplatz 1, 87435 Kempten (Allg\u00E4u). Das historische Geb\u00E4ude liegt zentral in der Kemptener Innenstadt.",
    },
    {
      question: "Wie komme ich zum Kornhaus Kempten?",
      answer:
        "Vom Kemptener Hauptbahnhof sind es ca. 10 Minuten zu Fu\u00DF durch die Innenstadt. Stadtbusse halten am Residenzplatz in der N\u00E4he. Mit dem Auto: Parkh\u00E4user Forum Allg\u00E4u und Residenzplatz.",
    },
    {
      question: "Was kostet ein Ticket f\u00FCr Pater Brown in Kempten?",
      answer:
        "Tickets f\u00FCr das Live-H\u00F6rspiel in Kempten sind ab 34,90 \u20AC erh\u00E4ltlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkpl\u00E4tze am Kornhaus?",
      answer:
        "In der N\u00E4he des Kornhauses gibt es das Parkhaus Forum Allg\u00E4u und das Parkhaus am Residenzplatz. Zus\u00E4tzlich sind Stra\u00DFenparkpl\u00E4tze in der Umgebung vorhanden.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-H\u00F6rspiel in Kempten \u2013 Kornhaus | Tickets",
    description:
      "Pater Brown Live-H\u00F6rspiel in Kempten, Kornhaus. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 34,90 \u20AC. Jetzt sichern!",
    keywords:
      "pater brown kempten, pater brown live kempten, kornhaus kempten, pater brown tickets kempten, live h\u00F6rspiel kempten, pater brown allg\u00E4u",
  },
};

const Kempten = () => <CityLandingPage config={config} />;

export default Kempten;
