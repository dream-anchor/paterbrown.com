import { CastMember, ShowCase, TeamMember } from "@/types";
import castWanjaImage from "@/assets/cast-wanja.jpg";
import castAntoineImage from "@/assets/cast-antoine.jpg";
import marvelinImage from "@/assets/marvelin.png";
import stefanieSickImage from "@/assets/stefanie-sick.png";
import wanjaHeaderBg from "@/assets/wanja-header-bg.png";
import antoineHeaderBg from "@/assets/antoine-header-bg.png";

export const castMembers: CastMember[] = [
  {
    id: "wanja",
    name: "Wanja Mues",
    role: "Erzähler & Schauspieler",
    character: "Pater Brown",
    image: castWanjaImage,
    headerBg: wanjaHeaderBg,
    description: "Wanja Mues ist einer der vielseitigsten deutschen Schauspieler seiner Generation. Bekannt aus zahlreichen Film- und TV-Produktionen verleiht er Pater Brown eine unverwechselbare Stimme voller Tiefe und Authentizität.",
    highlights: [
      "Synchronstimme von Andrew Lincoln (The Walking Dead)",
      "Grimme-Preis-Nominierung",
      "Über 20 Jahre Bühnenerfahrung"
    ]
  },
  {
    id: "antoine",
    name: "Antoine Monot Jr.",
    role: "Erzähler & Schauspieler",
    character: "Flambeau",
    image: castAntoineImage,
    headerBg: antoineHeaderBg,
    description: "Antoine Monot Jr. ist ein Multitalent zwischen Film, Theater und Musik. Mit seiner dynamischen Präsenz und seinem einzigartigen Charisma erweckt er den geheimnisvollen Meisterdieb Flambeau zum Leben.",
    highlights: [
      "Deutscher Filmpreis & Jupiter Award",
      "Synchronstimme von Charlie Day (It's Always Sunny)",
      "Musiker und Theaterregisseur"
    ]
  }
];

export const showCases: ShowCase[] = [
  {
    id: "case1",
    title: "Das Paradies der Diebe",
    description: "Pater Brown trifft auf den genialen Meisterdieb Flambeau. Ein Wettstreit der Intelligenz beginnt, bei dem der bescheidene Priester zeigt, dass wahre Größe nicht im Ruhm, sondern in der Demut liegt."
  },
  {
    id: "case2",
    title: "Der fliegende Stern",
    description: "Ein mysteriöser Diebstahl versetzt die High Society in Aufruhr. Pater Brown und Flambeau müssen zusammenarbeiten, um das Rätsel um den legendären Saphir zu lösen."
  }
];

export const teamMembers: TeamMember[] = [
  {
    id: "marvelin",
    name: "Marvelin",
    role: "Beatbox & Live-Sounds",
    image: marvelinImage,
    description: "Marvelin ist einer der innovativsten Beatboxer Deutschlands. Mit seinen atemberaubenden Live-Sounds erschafft er die perfekte Klangkulisse für die Geschichten von Pater Brown - von atmosphärischen Soundscapes bis hin zu präzisen Sound-Effekten."
  },
  {
    id: "stefanie",
    name: "Stefanie Sick",
    role: "Produktion & Regie",
    image: stefanieSickImage,
    description: "Stefanie Sick ist die kreative Kraft hinter dem Projekt. Mit jahrelanger Erfahrung in Theater und Audio-Produktion hat sie ein einzigartiges Format geschaffen, das klassische Literatur neu erlebbar macht."
  }
];
