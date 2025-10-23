import { CastMember, ShowCase, TeamMember } from "@/types";
import wanjaImage from "@/assets/cast-wanja.jpg";
import antoineImage from "@/assets/cast-antoine.jpg";
import marvelinImage from "@/assets/marvelin.png";
import stefanieSickImage from "@/assets/stefanie-sick.png";
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
    description: "Wanja Mues ist ein vielseitiger Schauspieler, bekannt aus Film, Fernsehen und Theater. Er verleiht Flambeau eine charismatische und nuancierte Präsenz.",
    highlights: ["Film & Fernsehen", "Theaterstar", "Synchronsprecher"]
  },
  {
    id: "antoine",
    name: "Antoine Monot Jr.",
    role: "Erzähler",
    character: "Pater Brown",
    image: antoineImage,
    headerBg: antoineHeaderBg,
    description: "Antoine Monot Jr. bringt als Erzähler von Pater Brown seine einzigartige Stimme und sein schauspielerisches Talent ein, um die Geschichten lebendig werden zu lassen.",
    highlights: ["Schauspieler", "Synchronsprecher", "Regisseur"]
  }
];

export const showCases: ShowCase[] = [
  {
    id: "case1",
    title: "Das blaue Kreuz",
    description: "Der berühmte Meisterdieb Flambeau plant den größten Coup seines Lebens. Ein wertvolles Kreuz soll sein nächstes Opfer werden. Doch er hat nicht mit Pater Brown gerechnet..."
  },
  {
    id: "case2",
    title: "Der Fluch der goldenen Kreuze",
    description: "Eine mysteriöse Serie von Diebstählen erschüttert die Stadt. Goldene Kreuze verschwinden spurlos. Pater Brown und sein alter Widersacher Flambeau müssen zusammenarbeiten..."
  }
];

export const teamMembers: TeamMember[] = [
  {
    id: "marvelin",
    name: "Marvelin",
    role: "Live-Foley & Sound Design",
    image: marvelinImage,
    description: "Marvelin sorgt für die atmosphärischen Klänge und Geräusche, die das Live-Hörspiel zum Leben erwecken. Mit innovativen Live-Foley-Techniken schafft er eine einzigartige Soundkulisse."
  },
  {
    id: "stefanie",
    name: "Stefanie Sick",
    role: "Produktion & Regie",
    image: stefanieSickImage,
    description: "Stefanie Sick ist die kreative Kraft hinter der Produktion. Mit ihrer Erfahrung in Theater und Hörspiel bringt sie die Geschichten von G.K. Chesterton auf die Bühne."
  }
];
