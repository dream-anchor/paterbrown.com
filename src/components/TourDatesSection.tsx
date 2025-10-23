import { Calendar } from "lucide-react";
import { tourDates } from "@/data/tourDates";

const TourDatesSection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-card/20 to-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading mb-4 tracking-wider text-foreground">
            Tourdaten 2025
          </h2>
          <div className="divider-gold mb-8" />
          <p className="text-lg text-muted-foreground">
            Sichern Sie sich jetzt Ihre Tickets für das Live-Hörspiel
          </p>
        </div>

        <div className="space-y-6">
          {tourDates.map((date) => (
            <a
              key={date.id}
              href={date.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tour-date-premium group block"
              aria-label={`Tickets für ${date.city} am ${date.date} kaufen`}
            >
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <Calendar className="w-8 h-8 text-gold" aria-hidden="true" />
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center">
                  <div className="text-2xl md:text-3xl font-heading tracking-wide text-gold">
                    {date.date}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xl md:text-2xl font-heading tracking-wider text-foreground">
                      {date.city}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {date.venue}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="inline-block px-6 py-3 bg-gold/10 border border-gold/30 text-gold font-heading tracking-wider transition-all group-hover:bg-gold group-hover:text-background">
                      TICKETS
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TourDatesSection;
