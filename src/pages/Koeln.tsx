import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "koeln",
  cityName: "Köln",
  cityFilter: "Köln",
  addressRegion: "Nordrhein-Westfalen",
  addressCountry: "DE",
  heroImage: "/images/buehne/af-duo-stift-nebel.webp",
  venue: {
    name: "Volksbühne am Rudolfplatz",
    address: "Aachener Str. 5, 50674 Köln",
    description:
      "Die Volksbühne am Rudolfplatz ist ein traditionsreiches Theater mitten in der Kölner Innenstadt. Direkt am Rudolfplatz gelegen, dem Tor zum Belgischen Viertel, verbindet die Volksbühne seit Jahrzehnten anspruchsvolles Unterhaltungstheater mit kölscher Lebensart. Das intime Theater mit seinem warmen Ambiente bietet optimale Voraussetzungen für ein Live-Hörspiel – die besondere Atmosphäre des Hauses lässt die Geschichten von Pater Brown lebendig werden.",
    oepnv:
      "U-Bahn Linien 1, 7 bis Rudolfplatz (direkt am Theater). Straßenbahn Linien 1, 7, 12, 15 halten ebenfalls am Rudolfplatz. Vom Hauptbahnhof ca. 10 Minuten mit der U-Bahn.",
    parking:
      "Parkhaus am Rudolfplatz (Aachener Str. 2). Alternativ: Parkhaus Cäcilienstr. oder Parkhaus an der Komödienstraße. Tipp: Das Belgische Viertel ist eine Parken-Bewirtschaftungszone.",
  },
  tips: {
    restaurants: [
      "Hallmackenreuther (Brüsseler Platz 9) – Kölner Kult-Café am Brüsseler Platz, perfekt für einen Absacker",
      "Salon Schmitz (Aachener Str. 28) – Restaurant, Metzgerei und Bar in einem, direkt um die Ecke",
      "Früh am Dom – Traditionsbrauhaus mit kölscher Küche, ca. 10 Min. mit U-Bahn",
      "Belgisches Viertel – zahlreiche Restaurants, Bars und Cafés in Gehweite",
    ],
    hotels: [
      "Lint Hotel Köln – Boutique-Hotel im Belgischen Viertel, nur wenige Gehminuten entfernt",
      "25hours Hotel The Circle – Design-Hotel direkt am Rudolfplatz",
      "Hotel Mondial am Dom – Klassisches Hotel nahe Dom und Hauptbahnhof",
    ],
    sights: [
      "Kölner Dom – UNESCO-Weltkulturerbe, Wahrzeichen der Stadt (ca. 10 Min. mit U-Bahn)",
      "Belgisches Viertel – Kölns trendigstes Quartier, direkt am Rudolfplatz",
      "Museum Ludwig – Sammlung moderner Kunst mit Werken von Pop Art bis zur Gegenwart",
      "Rheinufer & Hohenzollernbrücke – Spaziergang mit Blick auf den beleuchteten Dom",
      "Schokoladenmuseum – interaktives Museum am Rheinufer",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Köln?",
      answer:
        "Das Pater Brown Live-Hörspiel gastiert in der Volksbühne am Rudolfplatz in Köln. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Köln statt?",
      answer:
        "Die Veranstaltung findet in der Volksbühne am Rudolfplatz statt, Aachener Str. 5, 50674 Köln. Das Theater liegt mitten in der Kölner Innenstadt am Übergang zum Belgischen Viertel.",
    },
    {
      question: "Wie komme ich zur Volksbühne am Rudolfplatz?",
      answer:
        "Mit der U-Bahn: Linien 1 oder 7 bis Rudolfplatz – das Theater ist direkt an der Haltestelle. Vom Hauptbahnhof Köln sind es ca. 10 Minuten mit der U-Bahn. Mit dem Auto: Parkhaus am Rudolfplatz direkt neben dem Theater.",
    },
    {
      question: "Was kostet ein Ticket für Pater Brown in Köln?",
      answer:
        "Tickets für das Live-Hörspiel in Köln sind ab 34,90 € erhältlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Restaurants in der Nähe der Volksbühne?",
      answer:
        "Ja, die Volksbühne liegt am Rand des Belgischen Viertels – einem der beliebtesten Ausgehviertel Kölns. In unmittelbarer Umgebung finden Sie zahlreiche Restaurants, Bars und Cafés.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-Hörspiel in Köln – Volksbühne am Rudolfplatz | Tickets",
    description:
      "Pater Brown Live-Hörspiel in Köln, Volksbühne am Rudolfplatz. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 34,90 €. Jetzt sichern!",
    keywords:
      "pater brown köln, pater brown live köln, volksbühne rudolfplatz köln, pater brown tickets köln, live hörspiel köln",
  },
};

const Koeln = () => <CityLandingPage config={config} />;

export default Koeln;
