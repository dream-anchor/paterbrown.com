import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "muenchen",
  cityName: "München",
  cityFilter: "München",
  addressRegion: "Bayern",
  addressCountry: "DE",
  heroImage: "/images/buehne/pater-brown-buehne-ensemble-marvelin-af",
  nearbyCities: [
    { slug: "erding", name: "Erding" },
    { slug: "kempten", name: "Kempten" },
  ],
  venue: {
    name: "Alte Kongresshalle",
    address: "Theresienhöhe 15, 80339 München (Schwanthalerhöhe)",
    description:
      "Die Alte Kongresshalle auf dem Gelände der Alten Messe München ist ein historisches Veranstaltungsgebäude mit besonderem Charme. Der neoklassizistische Bau aus dem Jahr 1937 bietet mit seiner markanten Architektur und der hervorragenden Akustik einen idealen Rahmen für das Pater-Brown-Live-Hörspiel. Die Halle liegt zentral im Stadtteil Schwanthalerhöhe, nur wenige Gehminuten vom Bavariapark und der Theresienwiese entfernt.",
    oepnv:
      "U-Bahn U4/U5 Haltestelle Schwanthalerhöhe (ca. 3 Minuten Fußweg). Alternativ: Tram 18/19 Haltestelle Holzapfelstraße.",
    parking:
      "Parkhaus Alte Messe direkt neben der Halle. Alternativ: Parkhaus am Bavariapark oder Straßenparkplätze in der Umgebung.",
  },
  tips: {
    restaurants: [
      "Augustiner Bräustuben (Landsberger Str. 19) – Traditionelles Wirtshaus, wenige Minuten zu Fuß",
      "Wirtshaus am Bavariapark – Bayerische Küche mit Blick auf die Bavaria",
      "Gang und Gäbe (Bergmannstr. 9) – Modernes Restaurant im Westend",
      "Bar Centrale (Ledererstr. 23, Altstadt) – Beliebte italienische Bar, ideal für einen Absacker nach der Show",
    ],
    hotels: [
      "Hotel Cocoon Stachus – Design-Hotel nahe der Innenstadt, ca. 10 Min. mit der U-Bahn",
      "Ruby Lilly Hotel – Modernes Hotel direkt im Westend",
      "Hotel Uhland – Familiär geführt, nahe der Theresienwiese",
    ],
    sights: [
      "Theresienwiese mit Bavaria-Statue – direkt um die Ecke",
      "Deutsches Museum – eines der größten Technikmuseen der Welt (ca. 20 Min. mit U-Bahn)",
      "Marienplatz mit Rathaus-Glockenspiel – Münchens Herzstück",
      "Englischer Garten – einer der größten innerstädtischen Parks weltweit",
      "Schloss Nymphenburg – prachtvolle Barockanlage im Westen der Stadt",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in München?",
      answer:
        "Das Pater Brown Live-Hörspiel gastiert in der Alten Kongresshalle München. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in München statt?",
      answer:
        "Die Veranstaltung findet in der Alten Kongresshalle statt, Theresienhöhe 15, 80339 München. Die Halle liegt im Stadtteil Schwanthalerhöhe, direkt neben dem Bavariapark.",
    },
    {
      question: "Wie komme ich zur Alten Kongresshalle?",
      answer:
        "Mit der U-Bahn: U4 oder U5 bis Haltestelle Schwanthalerhöhe, dann ca. 3 Minuten zu Fuß. Mit der Tram: Linie 18 oder 19 bis Holzapfelstraße. Mit dem Auto: Parkhaus Alte Messe direkt nebenan.",
    },
    {
      question: "Was kostet ein Ticket für Pater Brown in München?",
      answer:
        "Tickets für das Live-Hörspiel in München sind ab 34,90 € erhältlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkplätze an der Alten Kongresshalle?",
      answer:
        "Ja, direkt neben der Halle befindet sich das Parkhaus Alte Messe. Alternativ gibt es das Parkhaus am Bavariapark sowie Straßenparkplätze in der Umgebung.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-Hörspiel in München – Alte Kongresshalle | Tickets",
    description:
      "Pater Brown Live-Hörspiel in München, Alte Kongresshalle. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 34,90 €. Jetzt sichern!",
    keywords:
      "pater brown münchen, pater brown live münchen, alte kongresshalle münchen, pater brown tickets münchen, live hörspiel münchen",
  },
};

const Muenchen = () => <CityLandingPage config={config} />;

export default Muenchen;
