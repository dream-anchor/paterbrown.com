import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "giessen",
  cityName: "Gießen",
  cityFilter: "Gießen",
  addressRegion: "Hessen",
  addressCountry: "DE",
  nearbyCities: [
    { slug: "baunatal-kassel", name: "Baunatal/Kassel" },
    { slug: "koeln", name: "Köln" },
  ],
  venue: {
    name: "Kongresshalle Gießen",
    address: "Berliner Platz 2, 35390 Gießen",
    description:
      "Die Kongresshalle Gießen am Berliner Platz ist das zentrale Veranstaltungshaus der Universitätsstadt. Mit ihrem großen Saal und moderner Veranstaltungstechnik bietet sie den idealen Rahmen für kulturelle Highlights. Die Halle liegt zentral in der Gießener Innenstadt und ist bestens erreichbar.",
    oepnv:
      "Buslinien zum Berliner Platz (direkt vor der Halle). Vom Gießener Bahnhof ca. 10 Minuten zu Fuß.",
    parking:
      "Parkhaus am Berliner Platz direkt an der Kongresshalle. Alternativ: Parkhaus Neustädter Tor.",
  },
  tips: {
    restaurants: [
      "Tandreas (Liche Gasse 10) – Gehobenes Restaurant in der Gießener Altstadt",
      "Ulenspiegel (Ludwigstr. 6) – Gemütliche Kneipe und Küche, seit Jahrzehnten Gießener Institution",
      "Gasthaus Zur Linde (Marktplatz) – Hessische Gasthausküche im Herzen der Stadt",
      "Seltersweg – Gießens Fußgängerzone mit zahlreichen Cafés und Restaurants",
    ],
    hotels: [
      "Hotel Heyligenstaedt (Nahrungsberg 46) – Boutique-Hotel in denkmalgeschütztem Industriegebäude",
      "Maritim Hotel Gießen – Direkt an der Kongresshalle gelegen",
      "Hotel am Ludwigsplatz – Zentral gelegenes Stadthotel",
    ],
    sights: [
      "Liebig-Museum – dem berühmten Chemiker Justus von Liebig gewidmet, einziges erhaltenes Chemie-Labor seiner Art",
      "Mathematikum – erstes mathematisches Mitmach-Museum der Welt",
      "Botanischer Garten der Justus-Liebig-Universität – einer der ältesten botanischen Gärten Deutschlands",
      "Schiffenberg – historische Klosteranlage mit Biergarten und Panoramablick",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Gießen?",
      answer:
        "Das Pater Brown Live-Hörspiel gastiert in der Kongresshalle Gießen. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Gießen statt?",
      answer:
        "Die Veranstaltung findet in der Kongresshalle Gießen statt, Berliner Platz 2, 35390 Gießen. Die Halle liegt zentral in der Innenstadt.",
    },
    {
      question: "Wie komme ich zur Kongresshalle Gießen?",
      answer:
        "Vom Gießener Bahnhof sind es ca. 10 Minuten zu Fuß. Buslinien halten direkt am Berliner Platz. Mit dem Auto: Parkhaus am Berliner Platz direkt an der Halle.",
    },
    {
      question: "Was kostet ein Ticket für Pater Brown in Gießen?",
      answer:
        "Tickets für das Live-Hörspiel in Gießen sind ab 34,90 € erhältlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkplätze an der Kongresshalle?",
      answer:
        "Ja, direkt an der Kongresshalle befindet sich das Parkhaus am Berliner Platz. Alternativ bietet sich das Parkhaus Neustädter Tor an.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-Hörspiel in Gießen – Kongresshalle | Tickets",
    description:
      "Pater Brown Live-Hörspiel in Gießen, Kongresshalle am Berliner Platz. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 34,90 €. Jetzt sichern!",
    keywords:
      "pater brown gießen, pater brown live gießen, kongresshalle gießen, pater brown tickets gießen, live hörspiel gießen",
  },
};

const Giessen = () => <CityLandingPage config={config} />;

export default Giessen;
