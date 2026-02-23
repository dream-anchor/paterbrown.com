import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import GhostButton from "@/components/ui/GhostButton";

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
    <section className="py-20 md:py-28 bg-card">
      <div className="w-[88%] max-w-[1400px] mx-auto text-center space-y-12">
        <div>
          <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
            Jetzt erleben
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground">
            Pater Brown live erleben
          </h2>
        </div>

        {nextEvents.length > 0 && (
          <div className="space-y-px max-w-2xl mx-auto text-left">
            {nextEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 bg-background/50 border border-border/50 rounded-[3px] transition-colors hover:border-primary/30"
              >
                <div className="flex items-center gap-4">
                  <CalendarDays className="w-4 h-4 text-primary/50 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-foreground font-heading text-base">{event.date}</span>
                    <span className="text-foreground/30 text-xs ml-2">{event.day}</span>
                    <p className="text-foreground/50 text-sm font-serif">{event.city} · {event.venue}</p>
                  </div>
                </div>
                {event.ticket_url && (
                  <a
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-heading text-primary/70 hover:text-primary transition-colors uppercase tracking-[0.15em] whitespace-nowrap"
                  >
                    Tickets &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
          <GhostButton to="/termine" size="lg">
            Termine &amp; Tickets
          </GhostButton>
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
