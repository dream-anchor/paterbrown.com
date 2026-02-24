import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "neu-isenburg",
  cityName: "Neu-Isenburg",
  cityFilter: "Neu-Isenburg",
  addressRegion: "Hessen",
  addressCountry: "DE",
  heroImage: "/images/buehne/dd-buehne-spots-publikum.webp",
  noCurrentEvent: true,
  comingSoonText:
    "Die Shows in Neu-Isenburg waren ein großer Erfolg! Aktuell sind keine neuen Termine in der Hugenottenhalle geplant. Schauen Sie sich unsere aktuellen Tourtermine an – vielleicht ist eine Show in Ihrer Nähe dabei.",
  nearbyCities: [
    { slug: "giessen", name: "Gießen" },
    { slug: "baunatal-kassel", name: "Baunatal/Kassel" },
  ],
  venue: {
    name: "Hugenottenhalle Neu-Isenburg",
    address: "Frankfurter Str. 152, 63263 Neu-Isenburg",
    description:
      "Die Hugenottenhalle Neu-Isenburg ist das kulturelle Herz der Stadt am südlichen Rand von Frankfurt am Main. Die vielseitige Veranstaltungshalle war bereits Schauplatz erfolgreicher Pater-Brown-Gastspiele und bietet mit ihrer warmen Akustik und dem einladenden Ambiente den perfekten Rahmen für ein Live-Hörspiel.",
    oepnv:
      "S-Bahn S3/S4 bis Neu-Isenburg (ca. 10 Minuten von Frankfurt Hbf), dann ca. 5 Minuten zu Fuß. Buslinie OF-30 hält direkt an der Hugenottenhalle.",
    parking:
      "Parkplätze direkt an der Hugenottenhalle vorhanden. Alternativ: Parkplatz am Marktplatz.",
  },
  tips: {
    restaurants: [
      "Frankfurter Haus (Frankfurter Str. 70) – Regionale Küche in gemütlichem Ambiente",
      "Isenburgsche Burg (Hugenottenallee 45) – Restaurant mit Geschichte",
      "Sachsenhausen (Frankfurt, ca. 15 Min.) – Apfelweinlokale und hessische Gastronomie",
      "Kleinmarkthalle Frankfurt (ca. 20 Min.) – Kulinarische Vielfalt in Frankfurts traditionsreicher Markthalle",
    ],
    hotels: [
      "Kempinski Hotel Frankfurt-Gravenbruch – Luxushotel im Grünen, ca. 5 Min. mit dem Auto",
      "Best Western Macrander (Neu-Isenburg) – Komfortables Hotel mit guter Anbindung",
      "Hotels in Frankfurt-Sachsenhausen – ca. 15 Minuten mit S-Bahn, vielfältiges Angebot",
    ],
    sights: [
      "Frankfurter Römerberg – historisches Herz der Mainmetropole (ca. 20 Min.)",
      "Museumsufer Frankfurt – Deutschlands dichteste Museumsmeile am Main",
      "Städel Museum – 700 Jahre europäische Kunstgeschichte",
      "Palmengarten Frankfurt – botanischer Garten mit tropischen Pflanzenwelten",
    ],
  },
  faq: [
    {
      question: "War Pater Brown schon in Neu-Isenburg?",
      answer:
        "Ja, das Pater Brown Live-Hörspiel hat bereits erfolgreich in der Hugenottenhalle Neu-Isenburg gastiert. Die Shows waren ein voller Erfolg. Aktuelle Tourtermine finden Sie unter paterbrown.com/termine.",
    },
    {
      question: "Kommt Pater Brown wieder nach Neu-Isenburg?",
      answer:
        "Aktuell sind keine neuen Termine in Neu-Isenburg geplant. Sobald weitere Gastspiele feststehen, finden Sie sie hier und auf unserer Termine-Seite. Tragen Sie sich in unseren Newsletter ein, um als Erster informiert zu werden.",
    },
    {
      question: "Wo findet die Show in Neu-Isenburg statt?",
      answer:
        "Das Live-Hörspiel fand in der Hugenottenhalle Neu-Isenburg statt, Frankfurter Str. 152, 63263 Neu-Isenburg. Die Halle liegt zentral in der Stadt und ist von Frankfurt am Main aus schnell erreichbar.",
    },
    {
      question: "Was ist das Pater Brown Live-Hörspiel?",
      answer:
        `Ein einzigartiges Bühnenerlebnis: Antoine Monot und Wanja Mues (bekannt aus „Ein Fall für zwei“, ZDF) spielen live Kriminalgeschichten nach G.K. Chesterton. Beatboxer Marvelin erzeugt dabei alle Geräusche und Soundeffekte live mit dem Mund – ohne Playback. Mehr unter paterbrown.com/live-hoerspiel.`,
    },
    {
      question: "Gibt es ähnliche Shows in der Region?",
      answer:
        "Ja! Das Pater Brown Live-Hörspiel tourt durch ganz Deutschland und die Schweiz. In Hessen finden Shows unter anderem in Gießen und Baunatal/Kassel statt. Alle Termine unter paterbrown.com/termine.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-Hörspiel in Neu-Isenburg – Hugenottenhalle | Rückblick",
    description:
      "Pater Brown Live-Hörspiel in Neu-Isenburg, Hugenottenhalle. Rückblick auf erfolgreiche Gastspiele. Antoine Monot, Wanja Mues & Marvelin. Aktuelle Tourtermine entdecken!",
    keywords:
      "pater brown neu-isenburg, pater brown hugenottenhalle, pater brown live frankfurt, pater brown neu isenburg, live hörspiel neu-isenburg",
  },
};

const NeuIsenburg = () => <CityLandingPage config={config} />;

export default NeuIsenburg;
