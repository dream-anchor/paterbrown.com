import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "stuttgart",
  cityName: "Stuttgart",
  cityFilter: "Stuttgart",
  addressRegion: "Baden-Württemberg",
  addressCountry: "DE",
  nearbyCities: [
    { slug: "muenchen", name: "München" },
    { slug: "koeln", name: "Köln" },
  ],
  venue: {
    name: "Theaterhaus Stuttgart",
    address: "Siemensstraße 11, 70469 Stuttgart",
    description:
      "Das Theaterhaus am Pragsattel ist eines der größten freien Theater Deutschlands und ein kulturelles Wahrzeichen Stuttgarts. Mit mehreren Sälen und einem vielseitigen Programm aus Theater, Musik und Kabarett bietet das Theaterhaus den perfekten Rahmen für das Pater-Brown-Live-Hörspiel. Die hervorragende Akustik und die moderne Ausstattung sorgen für ein intensives Live-Erlebnis.",
    oepnv:
      "S-Bahn S4/S5/S6 bis Haltestelle Pragsattel (ca. 5 Minuten Fußweg). Buslinie 52 hält direkt vor dem Theaterhaus.",
    parking:
      "Eigene Tiefgarage am Theaterhaus vorhanden. Alternativ: Parkplätze entlang der Siemensstraße.",
  },
  tips: {
    restaurants: [
      "Weinstube Schellenturm (Weberstr. 72) – Schwäbische Küche in historischem Ambiente",
      "Cube Restaurant (Kleiner Schlossplatz 1) – Moderne Küche mit Blick über die Stadt, im Kunstmuseum",
      "Brauhaus Schönbuch (Bolzstr. 10) – Regionale Brauhausküche in der Innenstadt",
      "Markthalle Stuttgart (Dorotheenstr. 4) – Kulinarische Vielfalt unter Jugendstil-Dach",
    ],
    hotels: [
      "Hotel & Hostel Joshi’s (Lautenschlagerstr. 20) – Modern und zentral am Hauptbahnhof",
      "Steigenberger Graf Zeppelin (Arnulf-Klett-Platz 7) – Traditionshotel direkt am Hauptbahnhof",
      "Motel One Stuttgart-Bad Cannstatt – Budget-Hotel, gut mit S-Bahn erreichbar",
    ],
    sights: [
      "Schlossplatz mit Neuem Schloss – Stuttgarts repräsentative Mitte",
      "Mercedes-Benz Museum – Automobilgeschichte auf 9 Ebenen",
      "Porsche Museum – Faszinierende Sportwagen-Ausstellung in Zuffenhausen",
      "Wilhelma – zoologisch-botanischer Garten in historischer Parkanlage",
      "Fernsehturm Stuttgart – der weltweit erste Fernsehturm aus Stahlbeton, mit Aussichtsplattform",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Stuttgart?",
      answer:
        "Das Pater Brown Live-Hörspiel gastiert im Theaterhaus Stuttgart am Pragsattel. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Stuttgart statt?",
      answer:
        "Die Veranstaltung findet im Theaterhaus Stuttgart statt, Siemensstraße 11, 70469 Stuttgart. Das Theaterhaus liegt am Pragsattel, einem der wichtigsten Kulturstandorte der Stadt.",
    },
    {
      question: "Wie komme ich zum Theaterhaus Stuttgart?",
      answer:
        "Mit der S-Bahn: S4, S5 oder S6 bis Pragsattel, dann ca. 5 Minuten zu Fuß. Mit dem Bus: Linie 52 hält direkt vor dem Theaterhaus. Mit dem Auto: Eigene Tiefgarage vorhanden.",
    },
    {
      question: "Was kostet ein Ticket für Pater Brown in Stuttgart?",
      answer:
        "Tickets für das Live-Hörspiel in Stuttgart sind ab 36,40 € erhältlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkplätze am Theaterhaus?",
      answer:
        "Ja, das Theaterhaus verfügt über eine eigene Tiefgarage. Zusätzlich gibt es Parkplätze entlang der Siemensstraße.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-Hörspiel in Stuttgart – Theaterhaus | Tickets",
    description:
      "Pater Brown Live-Hörspiel in Stuttgart, Theaterhaus am Pragsattel. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 36,40 €. Jetzt sichern!",
    keywords:
      "pater brown stuttgart, pater brown live stuttgart, theaterhaus stuttgart, pater brown tickets stuttgart, live hörspiel stuttgart",
  },
};

const Stuttgart = () => <CityLandingPage config={config} />;

export default Stuttgart;
