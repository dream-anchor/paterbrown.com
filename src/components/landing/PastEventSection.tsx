import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Bell } from "lucide-react";

interface PastEvent {
  date: string;
  day: string;
  venue: string;
  city: string;
}

interface PastEventSectionProps {
  cityName: string;
  venueName: string;
  lastEvent: PastEvent;
  eventCount: number;
}

const PastEventSection = ({ cityName, venueName, lastEvent, eventCount }: PastEventSectionProps) => {
  return (
    <section className="py-28 md:py-36 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="p-8 md:p-12 border border-gold/20 bg-gold/[0.03]">
          <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium mb-8">
            Rückblick
          </p>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading text-foreground leading-tight mb-6">
            Wir waren in {cityName}!
          </h2>

          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4">
              <CalendarDays className="w-5 h-5 text-gold/50 shrink-0" aria-hidden="true" />
              <div>
                <span className="text-foreground font-heading text-xl">{lastEvent.date}</span>
                <span className="text-foreground/30 text-sm ml-3">{lastEvent.day}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-5 h-5 text-gold/50 shrink-0" aria-hidden="true" />
              <span className="text-foreground font-heading text-lg">{venueName}</span>
            </div>
          </div>

          <p className="text-foreground/60 leading-relaxed text-lg font-light max-w-3xl mb-10">
            {eventCount > 1
              ? `${eventCount} Vorstellungen in ${cityName} – jede ein voller Erfolg. `
              : `Die Show in ${cityName} war ein voller Erfolg. `}
            Sobald neue Termine feststehen, finden Sie sie hier. Bleiben Sie informiert!
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/termine"
              className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-gold/40 hover:border-gold/70 text-gold hover:text-gold/90 bg-gold/5 hover:bg-gold/10 backdrop-blur-sm transition-all duration-300 inline-block text-center"
            >
              Aktuelle Termine
            </Link>
            <a
              href="#newsletter"
              className="flex items-center justify-center gap-2 text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/20 hover:border-foreground/40 text-foreground/70 hover:text-foreground/90 bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300"
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              Benachrichtigt werden
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PastEventSection;
