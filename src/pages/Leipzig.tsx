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
      "Der Kupfersaal im Herzen der Leipziger Innenstadt ist ein historischer Veranstaltungssaal mit einzigartigem Charme. Die aufwendig restaurierte Kupferdecke und die warme Akustik machen den Saal zum idealen Rahmen für ein Live-Hörspiel. Direkt am Leipziger Markt gelegen, verbindet der Kupfersaal Tradition mit modernem Kulturprogramm.",
    oepnv:
      "Straßenbahn Linien 4, 7, 12, 15 bis Augustusplatz oder Markt (je ca. 3 Minuten Fußweg). Vom Hauptbahnhof Leipzig ca. 10 Minuten zu Fuß.",
    parking:
      "Parkhaus Augustusplatz oder Parkhaus am Markt. Alternativ: Tiefgarage Burgplatz.",
  },
  tips: {
    restaurants: [
      "Auerbachs Keller (Mädler-Passage) – Eines der ältesten Restaurants Europas, berühmt durch Goethes Faust",
      "Bayerischer Bahnhof (Bayerischer Platz 1) – Ältester Kopfbahnhof der Welt mit Hausbrauerei und Biergarten",
      "Pilot (Bosestr. 1, Südvorstadt) – Beliebtes Café und Restaurant in der Leipziger Gastro-Meile",
      "Barthels Hof (Hainstr. 1) – Sächsische Küche im historischen Ambiente, direkt in der Innenstadt",
    ],
    hotels: [
      "Steigenberger Grandhotel Handelshof – Traditionshotel direkt am Markt, nur wenige Schritte vom Kupfersaal",
      "Motel One Leipzig-Augustusplatz – Design-Hotel in bester Lage",
      "Hotel & Hostel Sleepy Lion – Budget-Option nahe Hauptbahnhof",
    ],
    sights: [
      "Völkerschlachtdenkmal – eines der größten Denkmäler Europas, Wahrzeichen Leipzigs",
      "Thomaskirche – Wirkungsstätte von Johann Sebastian Bach, Heimat des Thomanerchors",
      "Nikolaikirche – Ausgangspunkt der Friedlichen Revolution 1989",
      "Mädler-Passage mit Auerbachs Keller – historische Einkaufspassage",
      "Zoo Leipzig – einer der modernsten Zoos Europas mit Gondwanaland",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Leipzig?",
      answer:
        "Das Pater Brown Live-Hörspiel gastiert im Kupfersaal Leipzig. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Leipzig statt?",
      answer:
        "Die Veranstaltung findet im Kupfersaal statt, Kupfergasse 2, 04109 Leipzig. Der historische Saal liegt direkt in der Leipziger Innenstadt, wenige Schritte vom Markt entfernt.",
    },
    {
      question: "Wie komme ich zum Kupfersaal Leipzig?",
      answer:
        "Vom Hauptbahnhof Leipzig sind es ca. 10 Minuten zu Fuß. Mit der Straßenbahn: Linien 4, 7, 12 oder 15 bis Augustusplatz oder Markt. Mit dem Auto: Parkhaus Augustusplatz oder Parkhaus am Markt.",
    },
    {
      question: "Was kostet ein Ticket für Pater Brown in Leipzig?",
      answer:
        "Tickets für das Live-Hörspiel in Leipzig sind ab 34,90 € erhältlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkplätze am Kupfersaal?",
      answer:
        "In unmittelbarer Nähe befinden sich das Parkhaus Augustusplatz und das Parkhaus am Markt. Alternativ bietet sich die Tiefgarage Burgplatz an.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-Hörspiel in Leipzig – Kupfersaal | Tickets",
    description:
      "Pater Brown Live-Hörspiel in Leipzig, Kupfersaal. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 34,90 €. Jetzt sichern!",
    keywords:
      "pater brown leipzig, pater brown live leipzig, kupfersaal leipzig, pater brown tickets leipzig, live hörspiel leipzig",
  },
};

const Leipzig = () => <CityLandingPage config={config} />;

export default Leipzig;
