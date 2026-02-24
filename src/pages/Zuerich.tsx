import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "zuerich",
  cityName: "Zürich",
  cityFilter: "Zürich",
  addressRegion: "Zürich",
  addressCountry: "CH",
  heroImage: "/images/buehne/dd-duo-mikro-blau-intensiv.webp",
  venue: {
    name: "Volkshaus Zürich – Weisser Saal",
    address: "Stauffacherstrasse 60, 8004 Zürich",
    description:
      "Das Volkshaus Zürich im Kreis 4 ist eines der bedeutendsten Veranstaltungshäuser der Stadt. Der Weisse Saal besticht durch seine elegante Architektur und die exzellente Akustik – ideale Voraussetzungen für ein Live-Hörspiel. Das historische Gebäude verbindet Tradition mit zeitgenössischer Kultur und liegt mitten im lebendigen Quartier Aussersihl.",
    oepnv:
      "Tram 2 oder 3 bis Haltestelle Stauffacher (direkt vor dem Haus). Vom Hauptbahnhof Zürich ca. 10 Minuten mit dem Tram.",
    parking:
      "Parkhaus Stauffacher oder Parkhaus City. Aufgrund der zentralen Lage empfehlen wir die Anreise mit öffentlichen Verkehrsmitteln.",
  },
  tips: {
    restaurants: [
      "Volkshaus Restaurant (im selben Gebäude) – Gehobene Brasserie-Küche, perfekt vor oder nach der Show",
      "Cooperativa (Kalkbreitestrasse 2) – Kreative Küche im Kalkbreite-Quartier",
      "Wirtschaft Neumarkt (Neumarkt 5, Altstadt) – Traditionslokal mit Schweizer Küche",
      "Zeughauskeller (Bahnhofstrasse 28a) – Historisches Restaurant mit Zürcher Spezialitäten",
    ],
    hotels: [
      "25hours Hotel Zürich Langstrasse – Design-Hotel im Kreis 4, wenige Gehminuten entfernt",
      "Hotel Marktgasse (Marktgasse 17) – Boutique-Hotel in der Altstadt",
      "MOXY Zürich – Modernes Budget-Hotel, gut erreichbar",
    ],
    sights: [
      "Bahnhofstrasse – eine der exklusivsten Einkaufsstraßen der Welt",
      "Zürcher Altstadt – malerische Gassen entlang der Limmat, Grossmünster und Fraumünster",
      "Kunsthaus Zürich – eine der bedeutendsten Kunstsammlungen der Schweiz",
      "Zürichsee – Seepromenade und Schifffahrt mit Alpenblick",
      "Uetliberg – Zürichs Hausberg mit Panoramablick auf Stadt, See und Alpen",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Zürich?",
      answer:
        "Das Pater Brown Live-Hörspiel gastiert im Volkshaus Zürich, Weisser Saal. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Zürich statt?",
      answer:
        "Die Veranstaltung findet im Volkshaus Zürich statt, Stauffacherstrasse 60, 8004 Zürich. Der Weisse Saal im historischen Volkshaus bietet den idealen Rahmen für das Live-Hörspiel.",
    },
    {
      question: "Wie komme ich zum Volkshaus Zürich?",
      answer:
        "Mit dem Tram: Linie 2 oder 3 bis Stauffacher, das Volkshaus ist direkt an der Haltestelle. Vom Hauptbahnhof Zürich sind es ca. 10 Minuten mit dem Tram. Mit dem Auto: Parkhaus Stauffacher in der Nähe.",
    },
    {
      question: "Was kostet ein Ticket für Pater Brown in Zürich?",
      answer:
        "Tickets für das Live-Hörspiel in Zürich sind ab CHF 45 erhältlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Wird die Show auf Deutsch gespielt?",
      answer:
        "Ja, das Live-Hörspiel wird vollständig auf Hochdeutsch aufgeführt. Die Sprecher Antoine Monot und Wanja Mues sind deutsche Schauspieler.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-Hörspiel in Zürich – Volkshaus, Weisser Saal | Tickets",
    description:
      "Pater Brown Live-Hörspiel in Zürich, Volkshaus (Weisser Saal). Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab CHF 45. Jetzt sichern!",
    keywords:
      "pater brown zürich, pater brown live zürich, volkshaus zürich, pater brown tickets zürich, live hörspiel zürich",
  },
};

const Zuerich = () => <CityLandingPage config={config} />;

export default Zuerich;
