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
    <div className="text-center space-y-12">
      <div>
        <p className="text-foreground/30 text-[10px] uppercase tracking-[0.4em] mb-6">Jetzt erleben</p>
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading text-foreground leading-[0.9]">
          Tickets sichern
        </h2>
      </div>

      {nextEvents.length > 0 && (
        <div className="space-y-px max-w-2xl mx-auto text-left bg-foreground/5">
          {nextEvents.map((event) => (
            <div
              key={event.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 bg-background transition-colors hover:bg-foreground/[0.02]"
            >
              <div className="flex items-center gap-4">
                <CalendarDays className="w-4 h-4 text-foreground/30 shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-foreground font-heading text-lg">{event.date}</span>
                  <span className="text-foreground/30 text-xs ml-2">{event.day}</span>
                  <p className="text-foreground/40 text-sm">{event.city} · {event.venue}</p>
                </div>
              </div>
              {event.ticket_url && (
                <a
                  href={event.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-foreground/50 hover:text-foreground transition-colors uppercase tracking-[0.2em] whitespace-nowrap"
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
          <button className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 transition-all duration-300" type="button">
            Alle Tickets
          </button>
        </a>
        <Link
          to="/termine"
          className="text-foreground/40 hover:text-foreground transition-colors text-xs uppercase tracking-[0.2em]"
        >
          Alle Termine →
        </Link>
      </div>
    </div>
  );
};

export default CTASection;
