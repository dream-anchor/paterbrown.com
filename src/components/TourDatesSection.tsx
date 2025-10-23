import { tourDates } from "@/data/tourDates";
import { Calendar } from "lucide-react";

const TourDatesSection = () => {
  return (
    <section className="py-20 px-6 bg-background" role="region" aria-labelledby="tour-dates-heading">
      <div className="container mx-auto max-w-4xl">
        <h2 id="tour-dates-heading" className="text-4xl md:text-5xl font-heading text-center mb-4 tracking-wider text-foreground">
          Tourdaten 2025
        </h2>
        <div className="divider-gold mb-8" role="presentation" aria-hidden="true" />
        
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Sichern Sie sich jetzt Ihre Tickets für das außergewöhnliche Live-Hörspiel-Erlebnis
        </p>

        <div className="space-y-6">
          {tourDates.map((date) => (
            <article 
              key={date.id} 
              className="tour-date-premium flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6 flex-1">
                <Calendar className="text-gold flex-shrink-0 w-8 h-8" aria-hidden="true" />
                <div className="space-y-1">
                  <time 
                    dateTime={date.date.split('.').reverse().join('-')}
                    className="text-2xl md:text-3xl font-heading text-foreground tracking-wide block"
                  >
                    {date.date}
                  </time>
                  <p className="text-gold text-sm uppercase tracking-[0.2em]">{date.city}</p>
                  <p className="text-muted-foreground">{date.venue}</p>
                </div>
              </div>
              
              <a
                href={date.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={`Tickets kaufen für ${date.city} am ${date.date}`}
              >
                Tickets
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TourDatesSection;
