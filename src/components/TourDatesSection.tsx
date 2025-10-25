import { memo } from "react";
import { tourDates } from "@/data/tourDates";
import { usePrefetch } from "@/hooks/usePrefetch";
import type { TourDate } from "@/types";

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
    "description": "Ein spannendes Live-Hörspiel mit Wanja Mues und Antoine Monot, bekannt aus der ZDF-Serie 'Ein Fall für Zwei', und Beatboxer Marvelin.",
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
      "https://paterbrownlive.com/og-image.png"
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
        "name": "Antoine Monot Jr.",
        "sameAs": [
          "https://de.wikipedia.org/wiki/Antoine_Monot_jr.",
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
      "url": "https://paterbrownlive.com"
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
  // Prefetch main Eventim page after 2 seconds
  usePrefetch("https://www.eventim.de/artist/pater-brown/", { trigger: 'delay', delay: 2000 });

  return (
    <section 
      id="tour-dates"
      className="py-24 px-6 bg-gradient-to-b from-card/20 to-background"
      aria-labelledby="tour-dates-heading"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-24">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">Live-Hörspiel Termine</p>
          <h2 id="tour-dates-heading" className="text-6xl md:text-8xl font-heading tracking-wider text-foreground uppercase">
            Tour Dates
          </h2>
        </div>

        <div className="space-y-4 max-w-5xl mx-auto">
          {tourDates.map((date, index) => {
            const prefetchProps = usePrefetch(date.ticketUrl, { trigger: 'hover' });
            
            return (
              <div key={index}>
                <script 
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateEventSchema(date))
                  }}
                />
                <a
                  href={date.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-card/30 hover:bg-card/50 border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                  {...prefetchProps}
                >
                  <div className="flex flex-col md:flex-row gap-6 flex-1">
                    <div className="min-w-[120px]">
                      <div className="text-3xl font-heading text-gold">
                        {date.date}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {date.day}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl text-foreground font-light">
                        {date.city}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {date.venue}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 text-gold group-hover:translate-x-2 transition-transform">
                    Tickets →
                  </div>
                </a>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground text-sm">
            Tickets verfügbar über{" "}
            <a
              href="https://www.eventim.de/artist/pater-brown/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              Eventim (DE)
            </a>
            {" "}und{" "}
            <a
              href="https://www.ticketcorner.ch/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              Ticketcorner (CH)
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default memo(TourDatesSection);
