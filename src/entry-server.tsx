import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
// @ts-ignore - FilledContext exists at runtime
import type { FilledContext } from "react-helmet-async";
import {
  QueryClient,
  QueryClientProvider,
  dehydrate,
} from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Routes, Route } from "react-router-dom";

// Eager imports — renderToString ist synchron, lazy() geht hier nicht
import Index from "./pages/Index";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import NewsletterSent from "./pages/NewsletterSent";
import NewsletterThankYou from "./pages/NewsletterThankYou";
import TicketThankYou from "./pages/TicketThankYou";
import Termine from "./pages/Termine";
import LiveHoerspiel from "./pages/LiveHoerspiel";
import PaterBrown from "./pages/PaterBrown";
import Muenchen from "./pages/Muenchen";
import Hamburg from "./pages/Hamburg";
import Koeln from "./pages/Koeln";
import Berlin from "./pages/Berlin";
import Bremen from "./pages/Bremen";
import WanjaMues from "./pages/WanjaMues";
import AntoineMonot from "./pages/AntoineMonot";
import MarvelinPage from "./pages/Marvelin";
import StefanieSick from "./pages/StefanieSick";
import Hoerspiel from "./pages/Hoerspiel";
import GKChesterton from "./pages/GKChesterton";
import FatherBrown from "./pages/FatherBrown";
import KrimiHoerspiel from "./pages/KrimiHoerspiel";

/** Mapping: Stadtseiten-URL → Supabase city-Filter */
const CITY_ROUTES: Record<string, string> = {
  "/muenchen": "München",
  "/hamburg": "Hamburg",
  "/koeln": "Köln",
  "/berlin": "Berlin",
  "/bremen": "Bremen",
};

export async function render(url: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
    },
  });

  // Pre-fetch tour events für Startseite + /termine
  if (url === "/" || url === "/termine") {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const today = new Date().toISOString().split("T")[0];

        // Startseite: nur event_date für Jahresberechnung
        if (url === "/") {
          await queryClient.prefetchQuery({
            queryKey: ["seo-tour-year"],
            queryFn: async () => {
              const { data } = await supabase
                .from("tour_events")
                .select("event_date")
                .eq("is_active", true)
                .gte("event_date", today);
              return data || [];
            },
          });
        }

        // /termine: alle Felder für vollständige Termin-Liste
        if (url === "/termine") {
          await queryClient.prefetchQuery({
            queryKey: ["termine-page-events"],
            queryFn: async () => {
              const { data } = await supabase
                .from("tour_events")
                .select("*")
                .eq("is_active", true);
              return (data || [])
                .map((event: Record<string, unknown>) => ({
                  id: event.id,
                  date: event.date,
                  day: event.day,
                  city: event.city,
                  venue: event.venue,
                  note: event.note || undefined,
                  ticketUrl: event.ticket_url || undefined,
                  geo:
                    event.latitude && event.longitude
                      ? {
                          latitude: Number(event.latitude),
                          longitude: Number(event.longitude),
                        }
                      : undefined,
                  eventDate: event.event_date,
                }))
                .filter(
                  (e: Record<string, unknown>) => (e.eventDate as string) >= today
                )
                .sort(
                  (a: Record<string, unknown>, b: Record<string, unknown>) =>
                    new Date(a.eventDate as string).getTime() -
                    new Date(b.eventDate as string).getTime()
                );
            },
          });

          // CTA-Section Daten auch prefetchen
          await queryClient.prefetchQuery({
            queryKey: ["cta-next-events"],
            queryFn: async () => {
              const { data } = await supabase
                .from("tour_events")
                .select("id, date, day, city, venue, ticket_url, event_date")
                .eq("is_active", true)
                .gte("event_date", today)
                .order("event_date", { ascending: true })
                .limit(3);
              return data || [];
            },
          });
        }
      }
    } catch {
      // Supabase nicht erreichbar — fallback auf leere Daten
    }
  }

  // Stadtseiten: City-spezifische Events + CTA prefetchen
  const cityFilter = CITY_ROUTES[url];
  if (cityFilter) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const today = new Date().toISOString().split("T")[0];

        // City-spezifische Events
        await queryClient.prefetchQuery({
          queryKey: ["city-events", cityFilter],
          queryFn: async () => {
            const { data } = await supabase
              .from("tour_events")
              .select("*")
              .eq("is_active", true)
              .ilike("city", `%${cityFilter}%`)
              .gte("event_date", today)
              .order("event_date", { ascending: true });
            return (data || []).map((event: Record<string, unknown>) => ({
              id: event.id,
              date: event.date,
              day: event.day,
              city: event.city,
              venue: event.venue,
              ticketUrl: event.ticket_url || undefined,
              eventDate: event.event_date,
              geo:
                event.latitude && event.longitude
                  ? {
                      latitude: Number(event.latitude),
                      longitude: Number(event.longitude),
                    }
                  : undefined,
            }));
          },
        });

        // CTA-Section
        await queryClient.prefetchQuery({
          queryKey: ["cta-next-events"],
          queryFn: async () => {
            const { data } = await supabase
              .from("tour_events")
              .select("id, date, day, city, venue, ticket_url, event_date")
              .eq("is_active", true)
              .gte("event_date", today)
              .order("event_date", { ascending: true })
              .limit(3);
            return data || [];
          },
        });
      }
    } catch {
      // Supabase nicht erreichbar — fallback auf leere Daten
    }
  }

  // Seiten mit CTA-Section: Tour-Daten prefetchen
  const pagesWithCTA = ["/live-hoerspiel", "/pater-brown", "/wanja-mues", "/antoine-monot", "/marvelin", "/stefanie-sick", "/hoerspiel", "/g-k-chesterton", "/father-brown", "/krimi-hoerspiel"];
  if (pagesWithCTA.includes(url)) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const today = new Date().toISOString().split("T")[0];

        await queryClient.prefetchQuery({
          queryKey: ["cta-next-events"],
          queryFn: async () => {
            const { data } = await supabase
              .from("tour_events")
              .select("id, date, day, city, venue, ticket_url, event_date")
              .eq("is_active", true)
              .gte("event_date", today)
              .order("event_date", { ascending: true })
              .limit(3);
            return data || [];
          },
        });
      }
    } catch {
      // Supabase nicht erreichbar — fallback auf leere Daten
    }
  }

  const helmetContext = {} as FilledContext;

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <StaticRouter location={url}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/impressum" element={<Impressum />} />
                <Route path="/datenschutz" element={<Datenschutz />} />
                <Route
                  path="/newsletter-gesendet"
                  element={<NewsletterSent />}
                />
                <Route
                  path="/danke-newsletter"
                  element={<NewsletterThankYou />}
                />
                <Route path="/danke-ticket" element={<TicketThankYou />} />
                <Route path="/termine" element={<Termine />} />
                <Route path="/live-hoerspiel" element={<LiveHoerspiel />} />
                <Route path="/pater-brown" element={<PaterBrown />} />
                <Route path="/muenchen" element={<Muenchen />} />
                <Route path="/hamburg" element={<Hamburg />} />
                <Route path="/koeln" element={<Koeln />} />
                <Route path="/berlin" element={<Berlin />} />
                <Route path="/bremen" element={<Bremen />} />
                <Route path="/wanja-mues" element={<WanjaMues />} />
                <Route path="/antoine-monot" element={<AntoineMonot />} />
                <Route path="/marvelin" element={<MarvelinPage />} />
                <Route path="/stefanie-sick" element={<StefanieSick />} />
                <Route path="/hoerspiel" element={<Hoerspiel />} />
                <Route path="/g-k-chesterton" element={<GKChesterton />} />
                <Route path="/father-brown" element={<FatherBrown />} />
                <Route path="/krimi-hoerspiel" element={<KrimiHoerspiel />} />
              </Routes>
            </StaticRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );

  const { helmet } = helmetContext;
  const dehydratedState = dehydrate(queryClient);
  queryClient.clear();

  return { html, helmet, dehydratedState };
}
