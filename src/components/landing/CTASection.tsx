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
    <section className="py-16 mt-8">
      <div className="premium-card p-8 md:p-12 text-center space-y-8">
        <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium">
          Jetzt erleben
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading tracking-wider text-foreground uppercase">
          Tickets sichern
        </h2>

        {nextEvents.length > 0 && (
          <div className="grid gap-4 max-w-2xl mx-auto text-left">
            {nextEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-foreground/10 bg-card/30"
              >
                <div className="flex items-center gap-4">
                  <CalendarDays className="w-5 h-5 text-gold shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-gold font-heading text-xl tracking-wider">
                      {event.date}
                    </span>
                    <span className="text-foreground/50 text-sm ml-2">
                      {event.day}
                    </span>
                    <p className="text-foreground/80 text-sm">
                      {event.city} · {event.venue}
                    </p>
                  </div>
                </div>
                {event.ticket_url && (
                  <a
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gold hover:text-gold/80 transition-colors uppercase tracking-wider whitespace-nowrap"
                  >
                    Tickets <span aria-hidden="true">→</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href={EVENTIM_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="btn-premium" type="button">
              Jetzt Tickets sichern
            </button>
          </a>
          <Link
            to="/termine"
            className="text-gold hover:text-gold/80 transition-colors text-sm font-medium uppercase tracking-wider underline-offset-4 hover:underline"
          >
            Alle Termine anzeigen <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
