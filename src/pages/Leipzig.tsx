import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "leipzig",
  cityName: "Leipzig",
  cityFilter: "Leipzig",
  addressRegion: "Sachsen",
  addressCountry: "DE",
  nearbyCities: [{ slug: "berlin", name: "Berlin" }],
  venue: {
    name: "Kupfersaal Leipzig",
    address: "Kupfergasse 2, 04109 Leipzig",
    description:
      "Der Kupfersaal im Herzen der Leipziger Innenstadt ist ein historischer Veranstaltungssaal mit einzigartigem Charme. Die aufwendig restaurierte Kupferdecke und die warme Akustik machen den Saal zum idealen Rahmen f\u00FCr ein Live-H\u00F6rspiel. Direkt am Leipziger Markt gelegen, verbindet der Kupfersaal Tradition mit modernem Kulturprogramm.",
    oepnv:
      "Stra\u00DFenbahn Linien 4, 7, 12, 15 bis Augustusplatz oder Markt (je ca. 3 Minuten Fu\u00DFweg). Vom Hauptbahnhof Leipzig ca. 10 Minuten zu Fu\u00DF.",
    parking:
      "Parkhaus Augustusplatz oder Parkhaus am Markt. Alternativ: Tiefgarage Burgplatz.",
  },
  tips: {
    restaurants: [
      "Auerbachs Keller (M\u00E4dler-Passage) \u2013 Eines der \u00E4ltesten Restaurants Europas, ber\u00FChmt durch Goethes Faust",
      "Bayerischer Bahnhof (Bayerischer Platz 1) \u2013 \u00C4ltester Kopfbahnhof der Welt mit Hausbrauerei und Biergarten",
      "Pilot (Bosestr. 1, S\u00FCdvorstadt) \u2013 Beliebtes Caf\u00E9 und Restaurant in der Leipziger Gastro-Meile",
      "Barthels Hof (Hainstr. 1) \u2013 S\u00E4chsische K\u00FCche im historischen Ambiente, direkt in der Innenstadt",
    ],
    hotels: [
      "Steigenberger Grandhotel Handelshof \u2013 Traditionshotel direkt am Markt, nur wenige Schritte vom Kupfersaal",
      "Motel One Leipzig-Augustusplatz \u2013 Design-Hotel in bester Lage",
      "Hotel & Hostel Sleepy Lion \u2013 Budget-Option nahe Hauptbahnhof",
    ],
    sights: [
      "V\u00F6lkerschlachtdenkmal \u2013 eines der gr\u00F6\u00DFten Denkm\u00E4ler Europas, Wahrzeichen Leipzigs",
      "Thomaskirche \u2013 Wirkungsst\u00E4tte von Johann Sebastian Bach, Heimat des Thomanerchors",
      "Nikolaikirche \u2013 Ausgangspunkt der Friedlichen Revolution 1989",
      "M\u00E4dler-Passage mit Auerbachs Keller \u2013 historische Einkaufspassage",
      "Zoo Leipzig \u2013 einer der modernsten Zoos Europas mit Gondwanaland",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Leipzig?",
      answer:
        "Das Pater Brown Live-H\u00F6rspiel gastiert im Kupfersaal Leipzig. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Leipzig statt?",
      answer:
        "Die Veranstaltung findet im Kupfersaal statt, Kupfergasse 2, 04109 Leipzig. Der historische Saal liegt direkt in der Leipziger Innenstadt, wenige Schritte vom Markt entfernt.",
    },
    {
      question: "Wie komme ich zum Kupfersaal Leipzig?",
      answer:
        "Vom Hauptbahnhof Leipzig sind es ca. 10 Minuten zu Fu\u00DF. Mit der Stra\u00DFenbahn: Linien 4, 7, 12 oder 15 bis Augustusplatz oder Markt. Mit dem Auto: Parkhaus Augustusplatz oder Parkhaus am Markt.",
    },
    {
      question: "Was kostet ein Ticket f\u00FCr Pater Brown in Leipzig?",
      answer:
        "Tickets f\u00FCr das Live-H\u00F6rspiel in Leipzig sind ab 34,90 \u20AC erh\u00E4ltlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkpl\u00E4tze am Kupfersaal?",
      answer:
        "In unmittelbarer N\u00E4he befinden sich das Parkhaus Augustusplatz und das Parkhaus am Markt. Alternativ bietet sich die Tiefgarage Burgplatz an.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-H\u00F6rspiel in Leipzig \u2013 Kupfersaal | Tickets",
    description:
      "Pater Brown Live-H\u00F6rspiel in Leipzig, Kupfersaal. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 34,90 \u20AC. Jetzt sichern!",
    keywords:
      "pater brown leipzig, pater brown live leipzig, kupfersaal leipzig, pater brown tickets leipzig, live h\u00F6rspiel leipzig",
  },
};

const Leipzig = () => <CityLandingPage config={config} />;

export default Leipzig;
