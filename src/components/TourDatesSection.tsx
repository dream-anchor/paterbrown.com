import { tourDates } from "@/data/tourDates";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const TourDatesSection = () => {
  return (
    <section 
      id="tour-dates"
      className="py-24 px-6 bg-gradient-to-b from-background to-card/20"
      aria-labelledby="tour-dates-heading"
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
        
        <div className="space-y-2 max-w-4xl mx-auto" role="list">
          {tourDates.map((date) => (
            <article 
              key={date.id}
              className="tour-date-premium flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 group"
              role="listitem"
            >
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
              <a 
                href={date.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-gold transition-all duration-300 font-medium uppercase tracking-[0.15em] text-base border-b-2 border-transparent hover:border-gold pb-1"
                aria-label={`Tickets kaufen für ${date.city} am ${date.date}`}
              >
                Tickets <span aria-hidden="true">→</span>
              </a>
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
            <button className="btn-premium" type="button">
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
