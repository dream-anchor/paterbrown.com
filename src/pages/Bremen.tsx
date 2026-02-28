import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "bremen",
  cityName: "Bremen",
  cityFilter: "Bremen",
  addressRegion: "Bremen",
  addressCountry: "DE",
  heroImage: "/images/buehne/dd-duo-zeigefinger-blau.webp",
  nearbyCities: [{ slug: "hamburg", name: "Hamburg" }],
  venue: {
    name: "Die Glocke – Kleiner Saal",
    address: "Domsheide 4–5, 28195 Bremen",
    description:
      "Die Glocke ist Bremens renommiertes Konzerthaus direkt an der Domsheide im Herzen der Altstadt. Der Kleine Saal mit seinem warmen Klang und intimer Atmosphäre bietet den perfekten Rahmen für das Pater-Brown-Live-Hörspiel. Das historische Gebäude liegt nur wenige Schritte vom Bremer Dom, dem Rathaus und den Stadtmusikanten entfernt.",
    oepnv:
      "Straßenbahn Linien 2, 3 bis Domsheide (direkt vor der Tür). Vom Hauptbahnhof ca. 10 Minuten zu Fuß oder 2 Stationen mit der Straßenbahn.",
    parking:
      "Parkhaus Am Dom / Parkhaus Mitte direkt in der Nähe. Alternativ: Parkhaus Violenstraße. Tipp: Die Innenstadt ist per ÖPNV bestens erreichbar.",
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
      question: "War Pater Brown schon in Bremen?",
      answer:
        "Ja! Pater Brown – Das Live-Hörspiel gastierte in der Glocke Bremen. Sobald neue Termine in Bremen feststehen, finden Sie sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo fand die Show in Bremen statt?",
      answer:
        "Die Veranstaltung fand in der Glocke statt – Bremens renommiertem Konzerthaus an der Domsheide, direkt im Herzen der Altstadt, nur wenige Schritte vom Dom und den Stadtmusikanten entfernt.",
    },
    {
      question: "Was ist das Pater Brown Live-Hörspiel?",
      answer:
        `Ein einzigartiges Bühnenerlebnis: Antoine Monot und Wanja Mues (bekannt aus „Ein Fall für zwei", ZDF) spielen live Kriminalgeschichten nach G.K. Chesterton. Beatboxer Marvelin erzeugt dabei alle Geräusche und Soundeffekte live mit dem Mund – ohne Playback. Mehr unter paterbrown.com/live-hoerspiel.`,
    },
    {
      question: "Kommt Pater Brown wieder nach Bremen?",
      answer:
        "Neue Termine werden auf unserer Termine-Seite veröffentlicht. Tragen Sie sich in unseren Newsletter ein, um als Erster informiert zu werden, wenn Pater Brown wieder nach Bremen kommt.",
    },
    {
      question: "Für wen ist die Show geeignet?",
      answer:
        "Das Live-Hörspiel ist für Krimi-Fans, Hörspiel-Liebhaber, Theaterbesucher und alle geeignet, die ein besonderes Live-Erlebnis suchen. Die Show wird ab ca. 12 Jahren empfohlen.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-Hörspiel in Bremen – Die Glocke | paterbrown.com",
    description:
      "Pater Brown Live-Hörspiel in Bremen, Die Glocke. Antoine Monot, Wanja Mues & Marvelin bringen Chestertons Krimis live auf die Bühne. Rückblick & neue Termine.",
    keywords:
      "pater brown bremen, pater brown live bremen, die glocke bremen, pater brown tickets bremen, live hörspiel bremen",
  },
};

const Bremen = () => <CityLandingPage config={config} />;

export default Bremen;
