import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";

const CTABlock = () => {
  const { data: nextEvents = [] } = useQuery({
    queryKey: ["cta-next-events"],
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("tour_events")
        .select("id, date, day, city, venue, ticket_url, event_date")
        .eq("is_active", true)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <section className="py-28 md:py-36 bg-card/30">
      <div className="container mx-auto max-w-5xl px-6 text-center space-y-12">
        <div>
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium">
            Jetzt erleben
          </p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] font-heading text-foreground leading-[0.85]">
            Pater Brown live erleben
          </h2>
        </div>

        {nextEvents.length > 0 && (
          <div className="space-y-3 max-w-2xl mx-auto text-left">
            {nextEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 bg-background/50 border border-foreground/10 transition-colors hover:border-gold/20"
              >
                <div className="flex items-center gap-4">
                  <CalendarDays className="w-4 h-4 text-gold/50 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-foreground font-heading text-base">{event.date}</span>
                    <span className="text-foreground/30 text-xs ml-2">{event.day}</span>
                    <p className="text-foreground/50 text-sm">{event.city} · {event.venue}</p>
                  </div>
                </div>
                {event.ticket_url && (
                  <a
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-heading text-gold/70 hover:text-gold transition-colors uppercase tracking-[0.15em] whitespace-nowrap"
                  >
                    Tickets &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
          <Link
            to="/termine"
            className="text-sm md:text-base uppercase tracking-[0.25em] font-semibold px-10 md:px-14 py-4 md:py-5 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block"
          >
            Termine &amp; Tickets
          </Link>
          <Link
            to="/live-hoerspiel"
            className="text-foreground/40 hover:text-foreground transition-colors text-xs font-heading uppercase tracking-[0.15em]"
          >
            Mehr zur Show &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTABlock;
