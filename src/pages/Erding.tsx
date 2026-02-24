import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "erding",
  cityName: "Erding",
  cityFilter: "Erding",
  addressRegion: "Bayern",
  addressCountry: "DE",
  heroImage: "/images/buehne/dd-duo-nebel-blaulicht.webp",
  nearbyCities: [
    { slug: "muenchen", name: "München" },
    { slug: "kempten", name: "Kempten" },
  ],
  venue: {
    name: "Stadthalle Erding",
    address: "Alois-Schießl-Platz 1, 85435 Erding",
    description:
      "Die Stadthalle Erding mit ihrem Großen Saal ist der zentrale Veranstaltungsort der oberbayerischen Kreisstadt. Nur 30 Minuten östlich von München gelegen, bietet die moderne Halle ideale Bedingungen für Live-Events. Die Stadt Erding – bekannt für die Therme Erding und das Erdinger Weißbräu – lädt zum Verbinden von Kultur und Erholung ein.",
    oepnv:
      "S-Bahn S2 bis Erding (Endstation), dann ca. 10 Minuten zu Fuß durch die Altstadt. Alternativ: Stadtbus bis Stadthalle.",
    parking:
      "Parkplätze an der Stadthalle vorhanden. Alternativ: Parkhaus am Kleinen Platz (Erdinger Altstadt).",
  },
  tips: {
    restaurants: [
      "Brauereigasthof Erdinger Weißbräu (Lange Zeile 1) – Traditionelles Wirtshaus direkt an der Brauerei",
      "Gasthaus Mayr-Wirt (Haager Str. 4) – Bayerische Küche in der Erdinger Altstadt",
      "Café am Schönen Turm (Landshuter Str. 1) – Gemütliches Café am Wahrzeichen der Stadt",
      "Oberwirt (Kirchenplatz 2) – Gehobene bayerische Küche im historischen Gasthof",
    ],
    hotels: [
      "Hotel Henry – Modernes Hotel in der Erdinger Altstadt",
      "Victory Therme Erding Hotel – Direkt an der Therme Erding gelegen",
      "Hotel Mayr Wirt – Traditionelles Haus in der Altstadt",
    ],
    sights: [
      "Therme Erding – größte Therme der Welt mit Rutschenparadies und Wellnessbereich",
      "Erdinger Altstadt – historischer Stadtkern mit dem Schönen Turm als Wahrzeichen",
      "Erdinger Weißbräu Brauerei – Brauereibesichtigungen und Biergarten",
      "Münchner Flughafen (ca. 10 Min.) – Besucherpark und Aussichtshügel",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Erding?",
      answer:
        "Das Pater Brown Live-Hörspiel gastiert in der Stadthalle Erding. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Erding statt?",
      answer:
        "Die Veranstaltung findet in der Stadthalle Erding statt, Alois-Schießl-Platz 1, 85435 Erding. Die Halle liegt zentral in der Erdinger Altstadt.",
    },
    {
      question: "Wie komme ich zur Stadthalle Erding?",
      answer:
        "Mit der S-Bahn: S2 bis Erding (Endstation), dann ca. 10 Minuten zu Fuß. Von München aus sind es ca. 30 Minuten mit der S-Bahn. Mit dem Auto: Parkplätze direkt an der Stadthalle.",
    },
    {
      question: "Was kostet ein Ticket für Pater Brown in Erding?",
      answer:
        "Tickets für das Live-Hörspiel in Erding sind ab 40,65 € erhältlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkplätze an der Stadthalle Erding?",
      answer:
        "Ja, direkt an der Stadthalle sind Parkplätze vorhanden. Alternativ gibt es das Parkhaus am Kleinen Platz in der Erdinger Altstadt.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-Hörspiel in Erding – Stadthalle | Tickets",
    description:
      "Pater Brown Live-Hörspiel in Erding, Stadthalle. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 40,65 €. Jetzt sichern!",
    keywords:
      "pater brown erding, pater brown live erding, stadthalle erding, pater brown tickets erding, live hörspiel erding",
  },
};

const Erding = () => <CityLandingPage config={config} />;

export default Erding;
