import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "giessen",
  cityName: "Gie\u00DFen",
  cityFilter: "Gie\u00DFen",
  addressRegion: "Hessen",
  addressCountry: "DE",
  nearbyCities: [
    { slug: "baunatal-kassel", name: "Baunatal/Kassel" },
    { slug: "koeln", name: "K\u00F6ln" },
  ],
  venue: {
    name: "Kongresshalle Gie\u00DFen",
    address: "Berliner Platz 2, 35390 Gie\u00DFen",
    description:
      "Die Kongresshalle Gie\u00DFen am Berliner Platz ist das zentrale Veranstaltungshaus der Universit\u00E4tsstadt. Mit ihrem gro\u00DFen Saal und moderner Veranstaltungstechnik bietet sie den idealen Rahmen f\u00FCr kulturelle Highlights. Die Halle liegt zentral in der Gie\u00DFener Innenstadt und ist bestens erreichbar.",
    oepnv:
      "Buslinien zum Berliner Platz (direkt vor der Halle). Vom Gie\u00DFener Bahnhof ca. 10 Minuten zu Fu\u00DF.",
    parking:
      "Parkhaus am Berliner Platz direkt an der Kongresshalle. Alternativ: Parkhaus Neust\u00E4dter Tor.",
  },
  tips: {
    restaurants: [
      "Tandreas (Liche Gasse 10) \u2013 Gehobenes Restaurant in der Gie\u00DFener Altstadt",
      "Ulenspiegel (Ludwigstr. 6) \u2013 Gem\u00FCtliche Kneipe und K\u00FCche, seit Jahrzehnten Gie\u00DFener Institution",
      "Gasthaus Zur Linde (Marktplatz) \u2013 Hessische Gasthausk\u00FCche im Herzen der Stadt",
      "Seltersweg \u2013 Gie\u00DFens Fu\u00DFg\u00E4ngerzone mit zahlreichen Caf\u00E9s und Restaurants",
    ],
    hotels: [
      "Hotel Heyligenstaedt (Nahrungsberg 46) \u2013 Boutique-Hotel in denkmalgesch\u00FCtztem Industriegeb\u00E4ude",
      "Maritim Hotel Gie\u00DFen \u2013 Direkt an der Kongresshalle gelegen",
      "Hotel am Ludwigsplatz \u2013 Zentral gelegenes Stadthotel",
    ],
    sights: [
      "Liebig-Museum \u2013 dem ber\u00FChmten Chemiker Justus von Liebig gewidmet, einziges erhaltenes Chemie-Labor seiner Art",
      "Mathematikum \u2013 erstes mathematisches Mitmach-Museum der Welt",
      "Botanischer Garten der Justus-Liebig-Universit\u00E4t \u2013 einer der \u00E4ltesten botanischen G\u00E4rten Deutschlands",
      "Schiffenberg \u2013 historische Klosteranlage mit Biergarten und Panoramablick",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Gie\u00DFen?",
      answer:
        "Das Pater Brown Live-H\u00F6rspiel gastiert in der Kongresshalle Gie\u00DFen. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Gie\u00DFen statt?",
      answer:
        "Die Veranstaltung findet in der Kongresshalle Gie\u00DFen statt, Berliner Platz 2, 35390 Gie\u00DFen. Die Halle liegt zentral in der Innenstadt.",
    },
    {
      question: "Wie komme ich zur Kongresshalle Gie\u00DFen?",
      answer:
        "Vom Gie\u00DFener Bahnhof sind es ca. 10 Minuten zu Fu\u00DF. Buslinien halten direkt am Berliner Platz. Mit dem Auto: Parkhaus am Berliner Platz direkt an der Halle.",
    },
    {
      question: "Was kostet ein Ticket f\u00FCr Pater Brown in Gie\u00DFen?",
      answer:
        "Tickets f\u00FCr das Live-H\u00F6rspiel in Gie\u00DFen sind ab 34,90 \u20AC erh\u00E4ltlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkpl\u00E4tze an der Kongresshalle?",
      answer:
        "Ja, direkt an der Kongresshalle befindet sich das Parkhaus am Berliner Platz. Alternativ bietet sich das Parkhaus Neust\u00E4dter Tor an.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-H\u00F6rspiel in Gie\u00DFen \u2013 Kongresshalle | Tickets",
    description:
      "Pater Brown Live-H\u00F6rspiel in Gie\u00DFen, Kongresshalle am Berliner Platz. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 34,90 \u20AC. Jetzt sichern!",
    keywords:
      "pater brown gie\u00DFen, pater brown live gie\u00DFen, kongresshalle gie\u00DFen, pater brown tickets gie\u00DFen, live h\u00F6rspiel gie\u00DFen",
  },
};

const Giessen = () => <CityLandingPage config={config} />;

export default Giessen;
