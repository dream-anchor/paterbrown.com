import { TourDate } from "@/types";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

export const tourDates: TourDate[] = [
  {
    id: "1",
    date: "12.11.2025",
    day: "Mi. 20:00",
    city: "Augsburg",
    venue: "Spectrum Club",
    note: "Preview",
    ticketUrl: EVENTIM_AFFILIATE_URL,
    geo: { latitude: 48.3705, longitude: 10.8978 }
  },
  {
    id: "2",
    date: "08.01.2026",
    day: "Do. 20:00",
    city: "Hamburg",
    venue: "Friedrich-Ebert-Halle",
    note: "Premiere",
    ticketUrl: EVENTIM_AFFILIATE_URL,
    geo: { latitude: 53.5511, longitude: 9.9937 }
  },
  {
    id: "3",
    date: "09.01.2026",
    day: "Fr. 20:00",
    city: "Bremen",
    venue: "Die Glocke - Kleiner Saal",
    ticketUrl: EVENTIM_AFFILIATE_URL,
    geo: { latitude: 53.0793, longitude: 8.8017 }
  },
  {
    id: "4",
    date: "11.02.2026",
    day: "Mi. 20:00",
    city: "Neu-Isenburg / Frankfurt a.M.",
    venue: "Hugenottenhalle",
    ticketUrl: EVENTIM_AFFILIATE_URL,
    geo: { latitude: 50.0539, longitude: 8.6991 }
  },
  {
    id: "5",
    date: "17.02.2026",
    day: "Di. 20:00",
    city: "München",
    venue: "Alte Kongresshalle",
    ticketUrl: EVENTIM_AFFILIATE_URL,
    geo: { latitude: 48.1351, longitude: 11.5820 }
  },
  {
    id: "6",
    date: "18.02.2026",
    day: "Mi. 20:00",
    city: "Zürich",
    venue: "Volkshaus - Weisser Saal",
    ticketUrl: EVENTIM_AFFILIATE_URL,
    geo: { latitude: 47.3769, longitude: 8.5417 }
  }
];
