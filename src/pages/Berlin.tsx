import CityLandingPage from "@/components/landing/CityLandingPage";
import type { CityPageConfig } from "@/components/landing/CityLandingPage";

const config: CityPageConfig = {
  slug: "berlin",
  cityName: "Berlin",
  cityFilter: "Berlin",
  addressRegion: "Berlin",
  addressCountry: "DE",
  venue: {
    name: "DIE WÜHLMÄUSE",
    address: "Pommernallee 2-4, 14052 Berlin (Charlottenburg)",
    description:
      "DIE WÜHLMÄUSE in Berlin-Charlottenburg sind eines der legendärsten Kabarett- und Comedy-Theater Deutschlands. Gegründet von Dieter Hallervorden, hat sich das Theater als erstklassige Bühne für Unterhaltung auf höchstem Niveau etabliert. Die intime Atmosphäre und die hervorragende Akustik machen die Wühlmäuse zum perfekten Ort für ein Live-Hörspiel. Hier, wo schon unzählige Größen der deutschen Unterhaltungskunst aufgetreten sind, erwartet Sie Pater Brown in einem ganz besonderen Ambiente.",
    oepnv:
      "U-Bahn U2 bis Theodor-Heuss-Platz (ca. 3 Minuten Fußweg). Buslinie M49 und X34 halten ebenfalls in unmittelbarer Nähe.",
    parking:
      "Parkplätze in der Umgebung vorhanden (Pommernallee, Kaiserdamm). Alternativ: Parkhaus am ICC/Messe Berlin in ca. 5 Minuten Fußweite.",
  },
  tips: {
    restaurants: [
      "Restaurant 44 im Swissôtel (Augsburger Str. 44, Kurfürstendamm) – Gehobene Küche am Ku'damm",
      "Die Henne (Leuschnerdamm 25, Kreuzberg) – Berliner Traditionslokal seit 1907, berühmt für das beste Brathähnchen der Stadt",
      "Dicke Wirtin (Carmerstr. 9, Charlottenburg) – Berliner Kneipe nahe der Bühne",
      "Kurfürstendamm – zahlreiche Restaurants und Cafés in ca. 10 Minuten Fußweg",
    ],
    hotels: [
      "Hotel am Steinplatz – Autograph Collection (Steinplatz 4) – Stilvolles Boutique-Hotel in Charlottenburg",
      "25hours Hotel Bikini Berlin – Design-Hotel mit Blick auf den Zoo, ca. 10 Min. entfernt",
      "Motel One Berlin-Upper West – Modernes Budget-Hotel am Breitscheidplatz",
    ],
    sights: [
      "Schloss Charlottenburg – prachtvolle Barockresidenz mit weitläufigem Schlossgarten, nur wenige U-Bahn-Stationen entfernt",
      "Kurfürstendamm & KaDeWe – Berlins berühmte Shoppingmeile und das größte Kaufhaus Kontinentaleuropas",
      "Brandenburger Tor & Reichstag – Berlins ikonische Wahrzeichen (ca. 20 Min. mit U-Bahn)",
      "Museumsinsel – UNESCO-Weltkulturerbe mit fünf Weltklasse-Museen",
      "East Side Gallery – die längste Open-Air-Galerie der Welt an der ehemaligen Berliner Mauer",
    ],
  },
  faq: [
    {
      question: "Wann ist Pater Brown in Berlin?",
      answer:
        "Das Pater Brown Live-Hörspiel gastiert in DIE WÜHLMÄUSE in Berlin-Charlottenburg. Den genauen Termin und Tickets finden Sie auf unserer Termine-Seite unter paterbrown.com/termine.",
    },
    {
      question: "Wo findet die Show in Berlin statt?",
      answer:
        "Die Veranstaltung findet im Theater DIE WÜHLMÄUSE statt, Pommernallee 2-4, 14052 Berlin-Charlottenburg. Das legendäre Kabarett-Theater liegt nahe dem Theodor-Heuss-Platz.",
    },
    {
      question: "Wie komme ich zu den Wühlmäusen in Berlin?",
      answer:
        "Mit der U-Bahn: U2 bis Theodor-Heuss-Platz, dann ca. 3 Minuten zu Fuß. Mit dem Bus: M49 oder X34 halten in unmittelbarer Nähe. Mit dem Auto: Parkplätze in der Pommernallee und am Kaiserdamm.",
    },
    {
      question: "Was kostet ein Ticket für Pater Brown in Berlin?",
      answer:
        "Tickets für das Live-Hörspiel in Berlin sind ab 40,90 € erhältlich. Alle Preiskategorien und Tickets finden Sie auf Eventim.",
    },
    {
      question: "Gibt es Parkplätze am Theater Die Wühlmäuse?",
      answer:
        "In der Umgebung des Theaters gibt es Straßenparkplätze entlang der Pommernallee und des Kaiserdamms. Alternativ können Sie das Parkhaus am ICC/Messe Berlin nutzen, das ca. 5 Gehminuten entfernt liegt.",
    },
  ],
  seo: {
    title:
      "Pater Brown Live-Hörspiel in Berlin – DIE WÜHLMÄUSE | Tickets",
    description:
      "Pater Brown Live-Hörspiel in Berlin, DIE WÜHLMÄUSE in Charlottenburg. Mit Antoine Monot, Wanja Mues & Marvelin. Tickets ab 40,90 €. Jetzt sichern!",
    keywords:
      "pater brown berlin, pater brown live berlin, die wühlmäuse berlin, pater brown tickets berlin, live hörspiel berlin",
  },
};

const Berlin = () => <CityLandingPage config={config} />;

export default Berlin;
