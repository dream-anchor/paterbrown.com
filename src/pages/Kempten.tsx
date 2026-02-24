import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "kempten",
  cityName: "Kempten",
  cityFilter: "Kempten",
  addressRegion: "Bayern",
  addressCountry: "DE",
  heroImage: "/images/buehne/dd-buehne-totale-nebel-licht.webp",
  nearbyCities: [
    { slug: "muenchen", name: "München" },
    { slug: "erding", name: "Erding" },
  ],
  venue: {
    name: "Kornhaus Kempten",
    address: "Kornhausplatz 1, 87435 Kempten (Allgäu)",
    description:
      "Das Kornhaus Kempten ist ein historisches Veranstaltungsgebäude im Herzen der Allgäu-Metropole. Als eines der ältesten Gebäude der Stadt verbindet es Geschichte mit modernem Kulturprogramm. Die einzigartige Atmosphäre des historischen Gebäudes macht es zum perfekten Ort für ein Live-Hörspiel.",
    oepnv:
      "Vom Kemptener Hauptbahnhof ca. 10 Minuten zu Fuß durch die Innenstadt. Stadtbusse halten am Residenzplatz (ca. 3 Minuten Fußweg).",
    parking:
      "Parkhaus Forum Allgäu oder Parkhaus Residenzplatz in der Nähe. Straßenparkplätze in der Umgebung.",
  },
  tips: {
    restaurants: [
      "Zum Stift (Stiftsplatz 1) – Bayerisch-schwäbische Küche in historischem Gebäude",
      "Peterhof (Salzstr. 1) – Traditionsbrauerei mit Biergarten",
      "AllgAUER (Kronenstr. 30) – Regionale Küche mit modernem Twist",
      "Innenstadt-Cafés entlang der Fußgängerzone",
    ],
    hotels: [
      "Allgäu Art Hotel (Bahnhofstr. 3) – Modernes Hotel nahe Hauptbahnhof",
      "Fürstenhof (Salzstr. 3) – Traditionshotel in der Altstadt",
      "BigBOX Hotel Kempten – Budget-Option mit guter Anbindung",
    ],
    sights: [
      "Fürstliche Residenz Kempten – barocke Prunkräume, eine der bedeutendsten Residenzen Süddeutschlands",
      "Archäologischer Park Cambodunum – Überreste der römischen Stadt, Kempten ist eine der ältesten Städte Deutschlands",
      "Allgäuer Alpen – Wandern, Skifahren und Natur pur vor der Haustür",
      "Schloss Neuschwanstein – ca. 45 Minuten Fahrt von Kempten",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Kempten?",
      answer:
        "Das Pater Brown Live-Hörspiel gastiert im Kornhaus Kempten. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Kempten statt?",
      answer:
        "Die Veranstaltung findet im Kornhaus Kempten statt, Kornhausplatz 1, 87435 Kempten (Allgäu). Das historische Gebäude liegt zentral in der Kemptener Innenstadt.",
    },
    {
      question: "Wie komme ich zum Kornhaus Kempten?",
      answer:
        "Vom Kemptener Hauptbahnhof sind es ca. 10 Minuten zu Fuß durch die Innenstadt. Stadtbusse halten am Residenzplatz in der Nähe. Mit dem Auto: Parkhäuser Forum Allgäu und Residenzplatz.",
    },
    {
      question: "Was kostet ein Ticket für Pater Brown in Kempten?",
      answer:
        "Tickets für das Live-Hörspiel in Kempten sind ab 34,90 € erhältlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkplätze am Kornhaus?",
      answer:
        "In der Nähe des Kornhauses gibt es das Parkhaus Forum Allgäu und das Parkhaus am Residenzplatz. Zusätzlich sind Straßenparkplätze in der Umgebung vorhanden.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-Hörspiel in Kempten – Kornhaus | Tickets",
    description:
      "Pater Brown Live-Hörspiel in Kempten, Kornhaus. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 34,90 €. Jetzt sichern!",
    keywords:
      "pater brown kempten, pater brown live kempten, kornhaus kempten, pater brown tickets kempten, live hörspiel kempten, pater brown allgäu",
  },
};

const Kempten = () => <CityLandingPage config={config} />;

export default Kempten;
