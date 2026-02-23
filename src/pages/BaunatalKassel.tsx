import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "baunatal-kassel",
  cityName: "Baunatal/Kassel",
  cityFilter: "Baunatal",
  addressRegion: "Hessen",
  addressCountry: "DE",
  nearbyCities: [{ slug: "giessen", name: "Gie\u00DFen" }],
  venue: {
    name: "Stadthalle Baunatal",
    address: "Friedrich-Ebert-Allee 4, 34225 Baunatal",
    description:
      "Die Stadthalle Baunatal ist das kulturelle Zentrum der Stadt s\u00FCdlich von Kassel. Mit einem modernen Gro\u00DFen Saal und vielseitiger Veranstaltungstechnik bietet sie optimale Bedingungen f\u00FCr Live-Events. Die Halle liegt zentral in Baunatal und ist von Kassel aus schnell erreichbar \u2013 ein idealer Veranstaltungsort f\u00FCr die gesamte Region Nordhessen.",
    oepnv:
      "Regionalzug oder RegioTram bis Baunatal-Guntershausen, dann Bus bis Stadthalle. Vom Kasseler Hauptbahnhof ca. 20 Minuten.",
    parking:
      "Gro\u00DFer Parkplatz direkt an der Stadthalle vorhanden. Kostenfreie Parkpl\u00E4tze in ausreichender Anzahl.",
  },
  tips: {
    restaurants: [
      "Hotel & Gasthaus Kohl (Baunatal) \u2013 Regionale K\u00FCche in gem\u00FCtlichem Ambiente",
      "Lohfeldener R\u00FCbezahl (Lohfelden) \u2013 Hessische Gasthausk\u00FCche nahe Baunatal",
      "Br\u00FCder Grimm (Kurfürstenstr. 5, Kassel) \u2013 Restaurant in der Kasseler Innenstadt",
      "Goldene Sonne (Königsplatz, Kassel) \u2013 Gehobene K\u00FCche im Zentrum von Kassel",
    ],
    hotels: [
      "Best Western Hotel Baunatal \u2013 Komfortables Hotel direkt in Baunatal",
      "Pentahotel Kassel \u2013 Modernes Hotel in der Kasseler Innenstadt",
      "Hotel Gude (Frankfurter Str. 299, Kassel) \u2013 Traditionshotel mit Wellnessbereich",
    ],
    sights: [
      "Bergpark Wilhelmsh\u00F6he (Kassel) \u2013 UNESCO-Weltkulturerbe mit Herkules-Statue und Wasserspielen",
      "documenta-Halle & Friderizianum (Kassel) \u2013 Zentrum der Weltkunstausstellung documenta",
      "Br\u00FCder-Grimm-Museum (Kassel) \u2013 Die M\u00E4rchenwelt der Br\u00FCder Grimm",
      "Kurhessen Therme (Kassel) \u2013 Entspannen nach der Show",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Baunatal/Kassel?",
      answer:
        "Das Pater Brown Live-H\u00F6rspiel gastiert in der Stadthalle Baunatal. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show bei Kassel statt?",
      answer:
        "Die Veranstaltung findet in der Stadthalle Baunatal statt, Friedrich-Ebert-Allee 4, 34225 Baunatal. Baunatal liegt direkt s\u00FCdlich von Kassel und ist in ca. 20 Minuten vom Kasseler Hauptbahnhof erreichbar.",
    },
    {
      question: "Wie komme ich zur Stadthalle Baunatal?",
      answer:
        "Mit \u00F6ffentlichen Verkehrsmitteln: Regionalzug oder RegioTram bis Baunatal-Guntershausen, dann Bus bis Stadthalle. Mit dem Auto: Direkt an der A49, gro\u00DFer kostenloser Parkplatz an der Halle.",
    },
    {
      question: "Was kostet ein Ticket f\u00FCr Pater Brown in Baunatal?",
      answer:
        "Tickets f\u00FCr das Live-H\u00F6rspiel in Baunatal sind ab 34,90 \u20AC erh\u00E4ltlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkpl\u00E4tze an der Stadthalle Baunatal?",
      answer:
        "Ja, direkt an der Stadthalle befindet sich ein gro\u00DFer kostenloser Parkplatz mit ausreichend Stellpl\u00E4tzen.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-H\u00F6rspiel in Baunatal/Kassel \u2013 Stadthalle | Tickets",
    description:
      "Pater Brown Live-H\u00F6rspiel in Baunatal bei Kassel, Stadthalle Baunatal. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 34,90 \u20AC. Jetzt sichern!",
    keywords:
      "pater brown kassel, pater brown baunatal, pater brown live kassel, stadthalle baunatal, pater brown tickets kassel, live h\u00F6rspiel kassel",
  },
};

const BaunatalKassel = () => <CityLandingPage config={config} />;

export default BaunatalKassel;
