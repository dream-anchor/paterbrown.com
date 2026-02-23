import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import { CalendarDays } from "lucide-react";

const CTASection = () => {
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
    <section className="text-center space-y-10">
      <div>
        <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium mb-4">
          Jetzt erleben
        </p>
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading text-foreground">
          Tickets sichern
        </h2>
      </div>

      {nextEvents.length > 0 && (
        <div className="space-y-3 max-w-2xl mx-auto text-left">
          {nextEvents.map((event) => (
            <div
              key={event.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border border-foreground/10 bg-card/20 transition-colors hover:border-gold/20"
            >
              <div className="flex items-center gap-4">
                <CalendarDays className="w-5 h-5 text-gold shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-gold font-heading text-xl">
                    {event.date}
                  </span>
                  <span className="text-foreground/40 text-sm ml-2">{event.day}</span>
                  <p className="text-foreground/60 text-sm">{event.city} · {event.venue}</p>
                </div>
              </div>
              {event.ticket_url && (
                <a
                  href={event.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gold hover:text-gold/80 transition-colors uppercase tracking-[0.15em] whitespace-nowrap"
                >
                  Tickets →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
        <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer">
          <button className="btn-premium" type="button">
            Jetzt Tickets sichern
          </button>
        </a>
        <Link
          to="/termine"
          className="text-gold hover:text-gold/80 transition-colors text-sm font-medium uppercase tracking-[0.2em] underline-offset-4 hover:underline"
        >
          Alle Termine anzeigen →
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
