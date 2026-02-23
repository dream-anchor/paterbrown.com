import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "bremen",
  cityName: "Bremen",
  cityFilter: "Bremen",
  addressRegion: "Bremen",
  addressCountry: "DE",
  nearbyCities: [{ slug: "hamburg", name: "Hamburg" }],
  noCurrentEvent: true,
  comingSoonText:
    "Pater Brown kommt bald nach Bremen! Aktuell sind keine Termine geplant – sobald neue Termine feststehen, finden Sie sie hier und auf unserer Termine-Seite.",
  venue: {
    name: "Venue wird bekanntgegeben",
    address: "Bremen",
    description:
      "Bremen verfügt über zahlreiche exzellente Veranstaltungsorte, die sich perfekt für ein Live-Hörspiel eignen – von der historischen Glocke bis zum Theater am Goetheplatz. Sobald der Veranstaltungsort feststeht, finden Sie hier alle Details zur Anfahrt und zum Venue.",
  },
  tips: {
    restaurants: [
      "Ratskeller Bremen (Am Markt 1) – einer der ältesten Weinrestaurants Deutschlands, im historischen Rathaus",
      "Das Kleine Lokal (Besselstr. 40) – Gemütliches Restaurant mit regionaler Küche im Viertel",
      "Schnoor-Viertel – das älteste Stadtviertel Bremens mit zahlreichen Cafés und Restaurants",
      "Schlachte – die Weserpromenade mit Biergärten und Restaurants",
    ],
    hotels: [
      "Atlantic Grand Hotel (Bredenstr. 2) – Bremens feinstes Hotel direkt am Marktplatz",
      "ATLANTIC Hotel Universum (Wiener Str. 4) – Modernes Hotel nahe Universität und Bürgerpark",
      "Motel One Bremen – Budget-Hotel in zentraler Lage",
    ],
    sights: [
      "Bremer Stadtmusikanten – die berühmte Bronzestatue am Rathaus, Wahrzeichen der Stadt",
      "Marktplatz mit Rathaus und Roland – UNESCO-Weltkulturerbe",
      "Schnoor-Viertel – malerisches Gässchenviertel mit Fachwerkhäusern aus dem 15./16. Jahrhundert",
      "Böttcherstraße – expressionistische Backsteinarchitektur, Museen und Kunsthandwerk",
      "Universum Bremen – interaktives Wissenschaftsmuseum",
    ],
  },
  faq: [
    {
      question: "Kommt Pater Brown nach Bremen?",
      answer:
        "Ja, Pater Brown – Das Live-Hörspiel plant Gastspiele in Bremen. Sobald ein konkreter Termin feststeht, finden Sie ihn auf unserer Termine-Seite unter paterbrown.com/termine. Tragen Sie sich in unseren Newsletter ein, um als Erster informiert zu werden.",
    },
    {
      question: "Wo findet die Show in Bremen statt?",
      answer:
        "Der Veranstaltungsort in Bremen wird noch bekanntgegeben. Bremen bietet hervorragende Spielstätten wie die Glocke, das Theater am Goetheplatz oder das Metropol Theater. Sobald der Venue feststeht, informieren wir Sie hier.",
    },
    {
      question: "Was ist das Pater Brown Live-Hörspiel?",
      answer:
        `Ein einzigartiges Bühnenerlebnis: Antoine Monot und Wanja Mues (bekannt aus \u201EEin Fall für zwei\u201C, ZDF) spielen live Kriminalgeschichten nach G.K. Chesterton. Beatboxer Marvelin erzeugt dabei alle Geräusche und Soundeffekte live mit dem Mund \u2013 ohne Playback. Mehr unter paterbrown.com/live-hoerspiel.`,
    },
    {
      question: "Was kostet ein Ticket für Pater Brown?",
      answer:
        "Tickets für das Pater Brown Live-Hörspiel sind in der Regel ab 34,90 € erhältlich. Der genaue Preis kann je nach Venue und Sitzplatzkategorie variieren.",
    },
    {
      question: "Für wen ist die Show geeignet?",
      answer:
        "Das Live-Hörspiel ist für Krimi-Fans, Hörspiel-Liebhaber, Theaterbesucher und alle geeignet, die ein besonderes Live-Erlebnis suchen. Die Show wird ab ca. 12 Jahren empfohlen.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-Hörspiel in Bremen – Bald auf Tour | paterbrown.com",
    description:
      "Pater Brown Live-Hörspiel bald in Bremen! Antoine Monot, Wanja Mues & Marvelin bringen Chestertons Krimis live auf die Bühne. Termine & Tickets.",
    keywords:
      "pater brown bremen, pater brown live bremen, pater brown tickets bremen, live hörspiel bremen, pater brown tour bremen",
  },
};

const Bremen = () => <CityLandingPage config={config} />;

export default Bremen;
