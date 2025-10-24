import { CastMember, ShowCase, TeamMember } from "@/types";
import wanjaImage from "@/assets/cast-wanja.jpg";
import antoineImage from "@/assets/cast-antoine.jpg";
import marvelinImage from "@/assets/marvelin-new.png";
import stefanieSickImage from "@/assets/stefanie-sick-blazer-rot-v3.png";
import wanjaHeaderBg from "@/assets/wanja-header-bg.png";
import antoineHeaderBg from "@/assets/antoine-header-bg.png";

export const castMembers: CastMember[] = [
  {
    id: "wanja",
    name: "Wanja Mues",
    role: "Erzähler",
    character: "Flambeau",
    image: wanjaImage,
    headerBg: wanjaHeaderBg,
    description: "Bekannt aus ZDF \"Ein Fall für Zwei\" als Detektiv Leo Oswald. Seine Stimme verleiht Hörbüchern von James Baldwin, Haruki Murakami und Agatha Christie Kult-Status.",
    highlights: ["ZDF \"Ein Fall für Zwei\"", "Hörbuch-Sprecher", "Theater-Star"]
  },
  {
    id: "antoine",
    name: "Antoine Monot",
    role: "Pater Brown",
    image: antoineImage,
    headerBg: antoineHeaderBg,
    description: "Seit 2014 in ZDF \"Ein Fall für Zwei\" als Rechtsanwalt Benjamin Hornberg. Auch bekannt aus RTL \"Behringer und die Toten\" als unkonventioneller Kommissar.",
    highlights: ["ZDF \"Ein Fall für Zwei\"", "Schauspieler", "Synchronsprecher"]
  },
  {
    id: "marvelin",
    name: "Marvelin",
    role: "Beatboxer & Loop Artist",
    image: marvelinImage,
    description: "Gründer von Beatbox Germany und gefragter Live-Performer. Mit seiner Loop Station erschafft Marvelin komplexe Klangwelten in Echtzeit – von tiefen Beats bis zu atmosphärischen Soundscapes.\n\nMit seiner Band The Razzzones gewann er 2022 den Deutschen Meistertitel und sicherte sich mit seinem Team die Bronzemedaille bei der Weltmeisterschaft 2023.\n\nMarvelin steht für die Verbindung von Kunst, Community und unbändiger Bühnenenergie.",
    highlights: ["Beatbox Germany", "Loop Artist", "Live-Performer"]
  }
];

export const showCases: ShowCase[] = [
  {
    id: "case1",
    title: "Das blaue Kreuz",
    description: "Ein spannender Fall: Pater Brown versucht, ein wertvolles Kreuz vor dem berüchtigten Meisterdieb Flambeau zu schützen – doch auch der brillante Detektiv Valentin ist ihnen dicht auf den Fersen. Ein cleveres Katz-und-Maus-Spiel mit überraschendem Ausgang."
  },
  {
    id: "case2",
    title: "Die Fallenden Brüder",
    description: "Zwei Brüder, zwei Welten: Ein zynischer Oberst und ein frommer Pfarrer treffen in der Morgendämmerung aufeinander. Als in der Dorfschmiede ein Mord geschieht, beginnt ein düsteres Spiel zwischen Schuld und Vergebung."
  }
];

export const teamMembers: TeamMember[] = [
  {
    id: "stefanie",
    name: "Stefanie Sick",
    role: "Produktion & Öffentlichkeitsarbeit",
    image: stefanieSickImage,
    description: "Als Creative Producerin zeichnet Stefanie Sick für die künstlerische Leitung und Gesamtkonzeption von Pater Brown – Das Live-Hörspiel verantwortlich.\n\nMit ihrer Expertise in den Bereichen Produktion und Öffentlichkeitsarbeit bringt sie innovative Theater-Konzepte auf die Bühne und sorgt dafür, dass die einzigartige Verbindung aus klassischem Krimi und moderner Performance ihr Publikum findet."
  }
];
