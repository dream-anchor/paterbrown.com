import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "baunatal-kassel",
  cityName: "Baunatal/Kassel",
  cityFilter: "Baunatal",
  addressRegion: "Hessen",
  addressCountry: "DE",
  heroImage: "/images/buehne/dd-trio-lila-nebel.webp",
  nearbyCities: [{ slug: "giessen", name: "Gießen" }],
  venue: {
    name: "Stadthalle Baunatal",
    address: "Friedrich-Ebert-Allee 4, 34225 Baunatal",
    description:
      "Die Stadthalle Baunatal ist das kulturelle Zentrum der Stadt südlich von Kassel. Mit einem modernen Großen Saal und vielseitiger Veranstaltungstechnik bietet sie optimale Bedingungen für Live-Events. Die Halle liegt zentral in Baunatal und ist von Kassel aus schnell erreichbar – ein idealer Veranstaltungsort für die gesamte Region Nordhessen.",
    oepnv:
      "Regionalzug oder RegioTram bis Baunatal-Guntershausen, dann Bus bis Stadthalle. Vom Kasseler Hauptbahnhof ca. 20 Minuten.",
    parking:
      "Großer Parkplatz direkt an der Stadthalle vorhanden. Kostenfreie Parkplätze in ausreichender Anzahl.",
  },
  tips: {
    restaurants: [
      "Hotel & Gasthaus Kohl (Baunatal) – Regionale Küche in gemütlichem Ambiente",
      "Lohfeldener Rübezahl (Lohfelden) – Hessische Gasthausküche nahe Baunatal",
      "Brüder Grimm (Kurfürstenstr. 5, Kassel) – Restaurant in der Kasseler Innenstadt",
      "Goldene Sonne (Königsplatz, Kassel) – Gehobene Küche im Zentrum von Kassel",
    ],
    hotels: [
      "Best Western Hotel Baunatal – Komfortables Hotel direkt in Baunatal",
      "Pentahotel Kassel – Modernes Hotel in der Kasseler Innenstadt",
      "Hotel Gude (Frankfurter Str. 299, Kassel) – Traditionshotel mit Wellnessbereich",
    ],
    sights: [
      "Bergpark Wilhelmshöhe (Kassel) – UNESCO-Weltkulturerbe mit Herkules-Statue und Wasserspielen",
      "documenta-Halle & Friderizianum (Kassel) – Zentrum der Weltkunstausstellung documenta",
      "Brüder-Grimm-Museum (Kassel) – Die Märchenwelt der Brüder Grimm",
      "Kurhessen Therme (Kassel) – Entspannen nach der Show",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Baunatal/Kassel?",
      answer:
        "Das Pater Brown Live-Hörspiel gastiert in der Stadthalle Baunatal. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show bei Kassel statt?",
      answer:
        "Die Veranstaltung findet in der Stadthalle Baunatal statt, Friedrich-Ebert-Allee 4, 34225 Baunatal. Baunatal liegt direkt südlich von Kassel und ist in ca. 20 Minuten vom Kasseler Hauptbahnhof erreichbar.",
    },
    {
      question: "Wie komme ich zur Stadthalle Baunatal?",
      answer:
        "Mit öffentlichen Verkehrsmitteln: Regionalzug oder RegioTram bis Baunatal-Guntershausen, dann Bus bis Stadthalle. Mit dem Auto: Direkt an der A49, großer kostenloser Parkplatz an der Halle.",
    },
    {
      question: "Was kostet ein Ticket für Pater Brown in Baunatal?",
      answer:
        "Tickets für das Live-Hörspiel in Baunatal sind ab 34,90 € erhältlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkplätze an der Stadthalle Baunatal?",
      answer:
        "Ja, direkt an der Stadthalle befindet sich ein großer kostenloser Parkplatz mit ausreichend Stellplätzen.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-Hörspiel in Baunatal/Kassel – Stadthalle | Tickets",
    description:
      "Pater Brown Live-Hörspiel in Baunatal bei Kassel, Stadthalle Baunatal. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 34,90 €. Jetzt sichern!",
    keywords:
      "pater brown kassel, pater brown baunatal, pater brown live kassel, stadthalle baunatal, pater brown tickets kassel, live hörspiel kassel",
  },
};

const BaunatalKassel = () => <CityLandingPage config={config} />;

export default BaunatalKassel;
