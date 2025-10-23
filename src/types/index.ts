export interface TourDate {
  id: string;
  date: string;
  day: string;
  city: string;
  venue: string;
  note?: string;
  ticketUrl: string;
}

export interface CastMember {
  id: string;
  name: string;
  role: string;
  character?: string;
  image: string;
  headerBg?: string;
  description: string;
  highlights?: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  description: string;
}

export interface ShowCase {
  id: string;
  title: string;
  description: string;
}
