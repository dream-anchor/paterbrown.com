import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import { TourDate } from "@/types";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";
import { LiveViewerCount } from "@/components/LiveViewerCount";

const generateEventSchema = (date: TourDate) => {
  // Parse German date format DD.MM.YYYY to ISO format
  const [day, month, year] = date.date.split('.');
  const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T19:00:00`;
  
  // Door time is typically 30 minutes before the event
  const eventDateTime = new Date(isoDate);
  const doorTime = new Date(eventDateTime.getTime() - 30 * 60000).toISOString();
  
  return {
    "@context": "https://schema.org",
    "@type": "TheaterEvent",
    "name": `Pater Brown - Das Live-Hörspiel - ${date.city}`,
    "description": "Ein spannendes Live-Hörspiel mit Antoine Monot und Wanja Mues, bekannt aus der ZDF-Serie 'Ein Fall für Zwei', und Beatboxer Marvelin.",
    "startDate": isoDate,
    "endDate": isoDate,
    "doorTime": doorTime,
    "duration": "PT2H",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": date.venue,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": date.city,
        "addressCountry": date.city.includes("Zürich") ? "CH" : "DE"
      },
      ...(date.geo && {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": date.geo.latitude,
          "longitude": date.geo.longitude
        }
      })
    },
      "image": [
        "https://paterbrown.com/og-image.png"
      ],
    "performer": [
      {
        "@type": "Person",
        "name": "Wanja Mues",
        "sameAs": [
          "https://de.wikipedia.org/wiki/Wanja_Mues",
          "https://www.imdb.com/name/nm0611635/"
        ]
      },
        {
          "@type": "Person",
          "name": "Antoine Monot",
          "sameAs": [
            "https://de.wikipedia.org/wiki/Antoine_Monot",
            "https://www.imdb.com/name/nm0598741/"
          ]
        },
      {
        "@type": "Person",
        "name": "Marvelin"
      }
    ],
      "organizer": {
        "@type": "Organization",
        "name": "Dream & Anchor",
        "url": "https://paterbrown.com"
      },
    "offers": {
      "@type": "Offer",
      "url": date.ticketUrl,
      "availability": "https://schema.org/InStock",
      "validFrom": "2025-01-01",
      "priceCurrency": date.city.includes("Zürich") ? "CHF" : "EUR",
      "price": date.city.includes("Zürich") ? "45" : "35",
      "priceRange": date.city.includes("Zürich") ? "CHF 35-55" : "€25-45"
    },
    "inLanguage": "de-DE",
    "workPerformed": {
      "@type": "CreativeWork",
      "name": "Pater Brown Hörspiele nach G.K. Chesterton",
      "author": {
        "@type": "Person",
        "name": "G.K. Chesterton"
      }
    }
  };
};

const TourDatesSection = () => {
  const isBlackWeek = isBlackWeekActive();
  
  const { data: tourDates = [], isLoading, error } = useQuery({
    queryKey: ['tour-events', 'v2', new Date().toISOString().split('T')[0]],
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 60, // Refetch every 60 minutes
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tour_events')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Transform database format to component format and sort by event_date
      const transformed = (data || []).map(event => ({
        id: event.id,
        date: event.date,
        day: event.day,
        city: event.city,
        venue: event.venue,
        note: event.note || undefined,
        ticketUrl: event.ticket_url,
        geo: event.latitude && event.longitude ? {
          latitude: Number(event.latitude),
          longitude: Number(event.longitude)
        } : undefined,
        eventDate: event.event_date
      })) as (TourDate & { eventDate: string })[];
      
      // Get current date in German timezone (Europe/Berlin)
      const today = new Date().toLocaleDateString('de-DE', { 
        timeZone: 'Europe/Berlin',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).split('.').reverse().join('-'); // Convert DD.MM.YYYY → YYYY-MM-DD
      
      // Filter out past events and sort by event_date chronologically
      return transformed
        .filter(event => event.eventDate >= today)
        .sort((a, b) => 
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        );
    },
  });

  return (
    <section
      id="tour-dates"
      className="py-24 px-6 bg-gradient-to-b from-background to-card/20"
      aria-labelledby="tour-dates-heading"
      role="region"
    >
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-24">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">Live Tour 2025/26</p>
          <h2 id="tour-dates-heading" className="text-6xl md:text-8xl font-heading tracking-wider text-foreground uppercase mb-8">
            Termine
          </h2>
          <p className="text-xl md:text-2xl text-foreground/80 font-light leading-relaxed max-w-2xl mx-auto mt-6">
            Erlebe Pater Brown live in deiner Stadt – <br />
            sichere dir jetzt deine Tickets:
          </p>
        </div>

        {/* Live Viewer Count - FOMO Element */}
        {isBlackWeek && <LiveViewerCount />}
        
        {isLoading && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg">Lade Termine...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center text-destructive py-12">
            <p className="text-lg">Fehler beim Laden der Termine</p>
          </div>
        )}
        
        {!isLoading && !error && tourDates.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg">Keine Termine verfügbar</p>
          </div>
        )}
        
        <div className="space-y-2 max-w-4xl mx-auto" role="list">
          {!isLoading && tourDates.map((date) => (
            <article 
              key={date.id}
              className="tour-date-premium flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 group"
              role="listitem"
            >
              <script type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(generateEventSchema(date))
                }}
              />
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 flex-1">
                <div className="flex flex-col min-w-[160px]">
                  <time 
                    className="text-3xl md:text-4xl font-heading text-gold group-hover:scale-105 transition-transform"
                    dateTime={date.date}
                  >
                    {date.date}
                  </time>
                  <span className="text-sm text-muted-foreground mt-1">
                    {date.day}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl text-foreground font-light">
                    {date.city}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    {date.venue}
                  </span>
                </div>
                {date.note && (
                  <span className="self-start px-4 py-1.5 bg-gold/10 text-gold text-xs uppercase tracking-[0.2em] font-bold border border-gold/30">
                    {date.note}
                  </span>
                )}
              </div>
            <div className="flex items-center">
              <a 
                href={date.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-gold transition-all duration-300 font-medium uppercase tracking-[0.15em] text-base border-b-2 border-transparent hover:border-gold pb-1 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background"
                aria-label={`Tickets kaufen für ${date.city} am ${date.date}`}
              >
                Tickets <span aria-hidden="true">→</span>
              </a>
            </div>
            </article>
          ))}
        </div>
        
        <div className="text-center mt-20">
          <a 
            href={EVENTIM_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Alle Termine auf Eventim ansehen"
          >
            <button className="btn-premium focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background" type="button">
              Alle Termine ansehen
            </button>
          </a>
          
          <p className="text-muted-foreground text-sm mt-8">
            Tickets über{' '}
            <a 
              href={EVENTIM_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
            >
              Eventim (DE)
            </a>
            {' '}und{' '}
            <a 
              href="https://www.ticketcorner.ch/artist/pater-brown-das-live-hoerspiel/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
            >
              Ticketcorner (CH)
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default TourDatesSection;
