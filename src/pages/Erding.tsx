import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "erding",
  cityName: "Erding",
  cityFilter: "Erding",
  addressRegion: "Bayern",
  addressCountry: "DE",
  nearbyCities: [
    { slug: "muenchen", name: "M\u00FCnchen" },
    { slug: "kempten", name: "Kempten" },
  ],
  venue: {
    name: "Stadthalle Erding",
    address: "Alois-Schie\u00DFl-Platz 1, 85435 Erding",
    description:
      "Die Stadthalle Erding mit ihrem Gro\u00DFen Saal ist der zentrale Veranstaltungsort der oberbayerischen Kreisstadt. Nur 30 Minuten \u00F6stlich von M\u00FCnchen gelegen, bietet die moderne Halle ideale Bedingungen f\u00FCr Live-Events. Die Stadt Erding \u2013 bekannt f\u00FCr die Therme Erding und das Erdinger Wei\u00DFbr\u00E4u \u2013 l\u00E4dt zum Verbinden von Kultur und Erholung ein.",
    oepnv:
      "S-Bahn S2 bis Erding (Endstation), dann ca. 10 Minuten zu Fu\u00DF durch die Altstadt. Alternativ: Stadtbus bis Stadthalle.",
    parking:
      "Parkpl\u00E4tze an der Stadthalle vorhanden. Alternativ: Parkhaus am Kleinen Platz (Erdinger Altstadt).",
  },
  tips: {
    restaurants: [
      "Brauereigasthof Erdinger Wei\u00DFbr\u00E4u (Lange Zeile 1) \u2013 Traditionelles Wirtshaus direkt an der Brauerei",
      "Gasthaus Mayr-Wirt (Haager Str. 4) \u2013 Bayerische K\u00FCche in der Erdinger Altstadt",
      "Caf\u00E9 am Sch\u00F6nen Turm (Landshuter Str. 1) \u2013 Gem\u00FCtliches Caf\u00E9 am Wahrzeichen der Stadt",
      "Oberwirt (Kirchenplatz 2) \u2013 Gehobene bayerische K\u00FCche im historischen Gasthof",
    ],
    hotels: [
      "Hotel Henry \u2013 Modernes Hotel in der Erdinger Altstadt",
      "Victory Therme Erding Hotel \u2013 Direkt an der Therme Erding gelegen",
      "Hotel Mayr Wirt \u2013 Traditionelles Haus in der Altstadt",
    ],
    sights: [
      "Therme Erding \u2013 gr\u00F6\u00DFte Therme der Welt mit Rutschenparadies und Wellnessbereich",
      "Erdinger Altstadt \u2013 historischer Stadtkern mit dem Sch\u00F6nen Turm als Wahrzeichen",
      "Erdinger Wei\u00DFbr\u00E4u Brauerei \u2013 Brauereibesichtigungen und Biergarten",
      "M\u00FCnchner Flughafen (ca. 10 Min.) \u2013 Besucherpark und Aussichtsh\u00FCgel",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Erding?",
      answer:
        "Das Pater Brown Live-H\u00F6rspiel gastiert in der Stadthalle Erding. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Erding statt?",
      answer:
        "Die Veranstaltung findet in der Stadthalle Erding statt, Alois-Schie\u00DFl-Platz 1, 85435 Erding. Die Halle liegt zentral in der Erdinger Altstadt.",
    },
    {
      question: "Wie komme ich zur Stadthalle Erding?",
      answer:
        "Mit der S-Bahn: S2 bis Erding (Endstation), dann ca. 10 Minuten zu Fu\u00DF. Von M\u00FCnchen aus sind es ca. 30 Minuten mit der S-Bahn. Mit dem Auto: Parkpl\u00E4tze direkt an der Stadthalle.",
    },
    {
      question: "Was kostet ein Ticket f\u00FCr Pater Brown in Erding?",
      answer:
        "Tickets f\u00FCr das Live-H\u00F6rspiel in Erding sind ab 40,65 \u20AC erh\u00E4ltlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkpl\u00E4tze an der Stadthalle Erding?",
      answer:
        "Ja, direkt an der Stadthalle sind Parkpl\u00E4tze vorhanden. Alternativ gibt es das Parkhaus am Kleinen Platz in der Erdinger Altstadt.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-H\u00F6rspiel in Erding \u2013 Stadthalle | Tickets",
    description:
      "Pater Brown Live-H\u00F6rspiel in Erding, Stadthalle. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 40,65 \u20AC. Jetzt sichern!",
    keywords:
      "pater brown erding, pater brown live erding, stadthalle erding, pater brown tickets erding, live h\u00F6rspiel erding",
  },
};

const Erding = () => <CityLandingPage config={config} />;

export default Erding;
