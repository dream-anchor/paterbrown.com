import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "stuttgart",
  cityName: "Stuttgart",
  cityFilter: "Stuttgart",
  addressRegion: "Baden-W\u00FCrttemberg",
  addressCountry: "DE",
  nearbyCities: [
    { slug: "muenchen", name: "M\u00FCnchen" },
    { slug: "koeln", name: "K\u00F6ln" },
  ],
  venue: {
    name: "Theaterhaus Stuttgart",
    address: "Siemensstra\u00DFe 11, 70469 Stuttgart",
    description:
      "Das Theaterhaus am Pragsattel ist eines der gr\u00F6\u00DFten freien Theater Deutschlands und ein kulturelles Wahrzeichen Stuttgarts. Mit mehreren S\u00E4len und einem vielseitigen Programm aus Theater, Musik und Kabarett bietet das Theaterhaus den perfekten Rahmen f\u00FCr das Pater-Brown-Live-H\u00F6rspiel. Die hervorragende Akustik und die moderne Ausstattung sorgen f\u00FCr ein intensives Live-Erlebnis.",
    oepnv:
      "S-Bahn S4/S5/S6 bis Haltestelle Pragsattel (ca. 5 Minuten Fu\u00DFweg). Buslinie 52 h\u00E4lt direkt vor dem Theaterhaus.",
    parking:
      "Eigene Tiefgarage am Theaterhaus vorhanden. Alternativ: Parkpl\u00E4tze entlang der Siemensstra\u00DFe.",
  },
  tips: {
    restaurants: [
      "Weinstube Schellenturm (Weberstr. 72) \u2013 Schw\u00E4bische K\u00FCche in historischem Ambiente",
      "Cube Restaurant (Kleiner Schlossplatz 1) \u2013 Moderne K\u00FCche mit Blick \u00FCber die Stadt, im Kunstmuseum",
      "Brauhaus Sch\u00F6nbuch (Bolzstr. 10) \u2013 Regionale Brauhausk\u00FCche in der Innenstadt",
      "Markthalle Stuttgart (Dorotheenstr. 4) \u2013 Kulinarische Vielfalt unter Jugendstil-Dach",
    ],
    hotels: [
      "Hotel & Hostel Joshi\u2019s (Lautenschlagerstr. 20) \u2013 Modern und zentral am Hauptbahnhof",
      "Steigenberger Graf Zeppelin (Arnulf-Klett-Platz 7) \u2013 Traditionshotel direkt am Hauptbahnhof",
      "Motel One Stuttgart-Bad Cannstatt \u2013 Budget-Hotel, gut mit S-Bahn erreichbar",
    ],
    sights: [
      "Schlossplatz mit Neuem Schloss \u2013 Stuttgarts repr\u00E4sentative Mitte",
      "Mercedes-Benz Museum \u2013 Automobilgeschichte auf 9 Ebenen",
      "Porsche Museum \u2013 Faszinierende Sportwagen-Ausstellung in Zuffenhausen",
      "Wilhelma \u2013 zoologisch-botanischer Garten in historischer Parkanlage",
      "Fernsehturm Stuttgart \u2013 der weltweit erste Fernsehturm aus Stahlbeton, mit Aussichtsplattform",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Stuttgart?",
      answer:
        "Das Pater Brown Live-H\u00F6rspiel gastiert im Theaterhaus Stuttgart am Pragsattel. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Stuttgart statt?",
      answer:
        "Die Veranstaltung findet im Theaterhaus Stuttgart statt, Siemensstra\u00DFe 11, 70469 Stuttgart. Das Theaterhaus liegt am Pragsattel, einem der wichtigsten Kulturstandorte der Stadt.",
    },
    {
      question: "Wie komme ich zum Theaterhaus Stuttgart?",
      answer:
        "Mit der S-Bahn: S4, S5 oder S6 bis Pragsattel, dann ca. 5 Minuten zu Fu\u00DF. Mit dem Bus: Linie 52 h\u00E4lt direkt vor dem Theaterhaus. Mit dem Auto: Eigene Tiefgarage vorhanden.",
    },
    {
      question: "Was kostet ein Ticket f\u00FCr Pater Brown in Stuttgart?",
      answer:
        "Tickets f\u00FCr das Live-H\u00F6rspiel in Stuttgart sind ab 36,40 \u20AC erh\u00E4ltlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkpl\u00E4tze am Theaterhaus?",
      answer:
        "Ja, das Theaterhaus verf\u00FCgt \u00FCber eine eigene Tiefgarage. Zus\u00E4tzlich gibt es Parkpl\u00E4tze entlang der Siemensstra\u00DFe.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-H\u00F6rspiel in Stuttgart \u2013 Theaterhaus | Tickets",
    description:
      "Pater Brown Live-H\u00F6rspiel in Stuttgart, Theaterhaus am Pragsattel. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 36,40 \u20AC. Jetzt sichern!",
    keywords:
      "pater brown stuttgart, pater brown live stuttgart, theaterhaus stuttgart, pater brown tickets stuttgart, live h\u00F6rspiel stuttgart",
  },
};

const Stuttgart = () => <CityLandingPage config={config} />;

export default Stuttgart;
