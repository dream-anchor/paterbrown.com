import { getTourYear } from "@/lib/dateUtils";

interface TourEvent {
  id: string;
  city: string;
  event_date: string;
  ticket_url: string | null;
  note: string | null;
}

interface HeroTourInfoProps {
  previewEvents: TourEvent[];
  tour2026Events: TourEvent[];
}

const HeroTourInfo = ({ previewEvents, tour2026Events }: HeroTourInfoProps) => {
  if (!previewEvents.length && !tour2026Events.length) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-8 text-center cinematic-enter max-w-3xl mx-auto" style={{ animationDelay: '0.8s' }}>
      {previewEvents.length > 0 && (
        <div>
          <p className="text-foreground/40 text-[10px] uppercase tracking-[0.3em] mb-2">
            Preview {getTourYear(previewEvents.map(e => ({ event_date: e.event_date })))}
          </p>
          <div className="text-sm text-foreground/70 space-y-0.5">
            {previewEvents.map(event => (
              <a 
                key={event.id}
                href={event.ticket_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-foreground transition-colors"
              >
                {event.city}
              </a>
            ))}
          </div>
        </div>
      )}

      {tour2026Events.length > 0 && (
        <div>
          <p className="text-foreground/40 text-[10px] uppercase tracking-[0.3em] mb-2">
            Tour {getTourYear(tour2026Events.map(e => ({ event_date: e.event_date })))}
          </p>
          <div className="text-sm text-foreground/70 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {tour2026Events.map(event => (
              <a 
                key={event.id}
                href={event.ticket_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {event.city}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroTourInfo;
