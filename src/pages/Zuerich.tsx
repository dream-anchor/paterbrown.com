import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "zuerich",
  cityName: "Z\u00FCrich",
  cityFilter: "Z\u00FCrich",
  addressRegion: "Z\u00FCrich",
  addressCountry: "CH",
  venue: {
    name: "Volkshaus Z\u00FCrich \u2013 Weisser Saal",
    address: "Stauffacherstrasse 60, 8004 Z\u00FCrich",
    description:
      "Das Volkshaus Z\u00FCrich im Kreis 4 ist eines der bedeutendsten Veranstaltungsh\u00E4user der Stadt. Der Weisse Saal besticht durch seine elegante Architektur und die exzellente Akustik \u2013 ideale Voraussetzungen f\u00FCr ein Live-H\u00F6rspiel. Das historische Geb\u00E4ude verbindet Tradition mit zeitgen\u00F6ssischer Kultur und liegt mitten im lebendigen Quartier Aussersihl.",
    oepnv:
      "Tram 2 oder 3 bis Haltestelle Stauffacher (direkt vor dem Haus). Vom Hauptbahnhof Z\u00FCrich ca. 10 Minuten mit dem Tram.",
    parking:
      "Parkhaus Stauffacher oder Parkhaus City. Aufgrund der zentralen Lage empfehlen wir die Anreise mit \u00F6ffentlichen Verkehrsmitteln.",
  },
  tips: {
    restaurants: [
      "Volkshaus Restaurant (im selben Geb\u00E4ude) \u2013 Gehobene Brasserie-K\u00FCche, perfekt vor oder nach der Show",
      "Cooperativa (Kalkbreitestrasse 2) \u2013 Kreative K\u00FCche im Kalkbreite-Quartier",
      "Wirtschaft Neumarkt (Neumarkt 5, Altstadt) \u2013 Traditionslokal mit Schweizer K\u00FCche",
      "Zeughauskeller (Bahnhofstrasse 28a) \u2013 Historisches Restaurant mit Z\u00FCrcher Spezialit\u00E4ten",
    ],
    hotels: [
      "25hours Hotel Z\u00FCrich Langstrasse \u2013 Design-Hotel im Kreis 4, wenige Gehminuten entfernt",
      "Hotel Marktgasse (Marktgasse 17) \u2013 Boutique-Hotel in der Altstadt",
      "MOXY Z\u00FCrich \u2013 Modernes Budget-Hotel, gut erreichbar",
    ],
    sights: [
      "Bahnhofstrasse \u2013 eine der exklusivsten Einkaufsstra\u00DFen der Welt",
      "Z\u00FCrcher Altstadt \u2013 malerische Gassen entlang der Limmat, Grossm\u00FCnster und Fraum\u00FCnster",
      "Kunsthaus Z\u00FCrich \u2013 eine der bedeutendsten Kunstsammlungen der Schweiz",
      "Z\u00FCrichsee \u2013 Seepromenade und Schifffahrt mit Alpenblick",
      "Uetliberg \u2013 Z\u00FCrichs Hausberg mit Panoramablick auf Stadt, See und Alpen",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Z\u00FCrich?",
      answer:
        "Das Pater Brown Live-H\u00F6rspiel gastiert im Volkshaus Z\u00FCrich, Weisser Saal. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Z\u00FCrich statt?",
      answer:
        "Die Veranstaltung findet im Volkshaus Z\u00FCrich statt, Stauffacherstrasse 60, 8004 Z\u00FCrich. Der Weisse Saal im historischen Volkshaus bietet den idealen Rahmen f\u00FCr das Live-H\u00F6rspiel.",
    },
    {
      question: "Wie komme ich zum Volkshaus Z\u00FCrich?",
      answer:
        "Mit dem Tram: Linie 2 oder 3 bis Stauffacher, das Volkshaus ist direkt an der Haltestelle. Vom Hauptbahnhof Z\u00FCrich sind es ca. 10 Minuten mit dem Tram. Mit dem Auto: Parkhaus Stauffacher in der N\u00E4he.",
    },
    {
      question: "Was kostet ein Ticket f\u00FCr Pater Brown in Z\u00FCrich?",
      answer:
        "Tickets f\u00FCr das Live-H\u00F6rspiel in Z\u00FCrich sind ab CHF 45 erh\u00E4ltlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Wird die Show auf Deutsch gespielt?",
      answer:
        "Ja, das Live-H\u00F6rspiel wird vollst\u00E4ndig auf Hochdeutsch aufgef\u00FChrt. Die Sprecher Antoine Monot und Wanja Mues sind deutsche Schauspieler.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-H\u00F6rspiel in Z\u00FCrich \u2013 Volkshaus, Weisser Saal | Tickets",
    description:
      "Pater Brown Live-H\u00F6rspiel in Z\u00FCrich, Volkshaus (Weisser Saal). Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab CHF 45. Jetzt sichern!",
    keywords:
      "pater brown z\u00FCrich, pater brown live z\u00FCrich, volkshaus z\u00FCrich, pater brown tickets z\u00FCrich, live h\u00F6rspiel z\u00FCrich",
  },
};

const Zuerich = () => <CityLandingPage config={config} />;

export default Zuerich;
