import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "hamburg",
  cityName: "Hamburg",
  cityFilter: "Hamburg",
  addressRegion: "Hamburg",
  addressCountry: "DE",
  heroImage: "/images/buehne/pater-brown-szene-gestik-nahaufnahme-af.webp",
  nearbyCities: [{ slug: "bremen", name: "Bremen" }],
  venue: {
    name: "Friedrich-Ebert-Halle",
    address: "Alter Postweg 34, 21075 Hamburg-Harburg",
    description:
      "Die Friedrich-Ebert-Halle in Hamburg-Harburg ist eine der traditionsreichsten Veranstaltungsstätten im Süden Hamburgs. Mit ihrer vielseitigen Ausstattung und der angenehmen Atmosphäre bietet sie den perfekten Rahmen für kulturelle Veranstaltungen. Die Halle liegt verkehrsgünstig im Herzen von Harburg und ist sowohl mit öffentlichen Verkehrsmitteln als auch mit dem Auto gut erreichbar.",
    oepnv:
      "S-Bahn S3/S31 bis Harburg Rathaus (ca. 5 Minuten Fußweg). Buslinien 14, 143 und 443 halten in unmittelbarer Nähe.",
    parking:
      "Parkplätze direkt vor der Halle vorhanden. Alternativ: Parkhaus am Harburger Ring oder Parkhaus am Rathaus Harburg.",
  },
  tips: {
    restaurants: [
      "Leuchtfeuer (Kanalplatz 6, Harburg) – Modernes Restaurant am Binnenhafen",
      "Goldener Engel (Harburger Rathausstr. 18) – Traditionelle deutsche Küche",
      "Schwerelos (Channel Hamburg) – Außergewöhnliches Restaurant-Erlebnis im Harburger Binnenhafen",
      "In der Hamburger Innenstadt (ca. 25 Min. mit S-Bahn): Portugiesenviertel mit zahlreichen Fisch-Restaurants",
    ],
    hotels: [
      "Privathotel Lindtner – Elegantes 4-Sterne-Hotel in Harburg mit Wellnessbereich",
      "B&B Hotel Hamburg-Harburg – Preiswertes Hotel nahe dem Hauptbahnhof Harburg",
      "25hours Hotel HafenCity – Stylishes Hotel an der Elbe (ca. 25 Min. mit S-Bahn)",
    ],
    sights: [
      "Hamburger Hafen & Speicherstadt – UNESCO-Weltkulturerbe",
      "Elbphilharmonie – Hamburgs architektonisches Wahrzeichen, Aussichtsplattform kostenlos",
      "Miniatur Wunderland – die größte Modelleisenbahn der Welt",
      "Reeperbahn & St. Pauli – Hamburgs berühmtes Vergnügungsviertel",
      "Harburger Binnenhafen – aufstrebendes Kreativviertel direkt vor Ort",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Hamburg?",
      answer:
        "Das Pater Brown Live-Hörspiel gastiert in der Friedrich-Ebert-Halle in Hamburg-Harburg. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Hamburg statt?",
      answer:
        "Die Veranstaltung findet in der Friedrich-Ebert-Halle statt, Alter Postweg 34, 21075 Hamburg-Harburg. Die Halle liegt zentral in Harburg, südlich der Elbe.",
    },
    {
      question: "Wie komme ich zur Friedrich-Ebert-Halle?",
      answer:
        "Mit der S-Bahn: S3 oder S31 bis Harburg Rathaus, dann ca. 5 Minuten zu Fuß. Mit dem Auto: Parkplätze direkt vor der Halle. Aus der Hamburger Innenstadt ist Harburg in ca. 25 Minuten per S-Bahn erreichbar.",
    },
    {
      question: "Was kostet ein Ticket für Pater Brown in Hamburg?",
      answer:
        "Tickets für das Live-Hörspiel in Hamburg sind ab 34,90 € erhältlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkplätze an der Friedrich-Ebert-Halle?",
      answer:
        "Ja, direkt vor der Friedrich-Ebert-Halle gibt es ausreichend Parkplätze. Alternativ stehen Parkhäuser am Harburger Ring und am Rathaus Harburg zur Verfügung.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-Hörspiel in Hamburg – Friedrich-Ebert-Halle | Tickets",
    description:
      "Pater Brown Live-Hörspiel in Hamburg-Harburg, Friedrich-Ebert-Halle. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 34,90 €. Jetzt sichern!",
    keywords:
      "pater brown hamburg, pater brown live hamburg, friedrich-ebert-halle harburg, pater brown tickets hamburg, live hörspiel hamburg",
  },
};

const Hamburg = () => <CityLandingPage config={config} />;

export default Hamburg;
