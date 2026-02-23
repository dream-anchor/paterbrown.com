import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { SEO } from "@/components/SEO";
import LandingLayout from "@/components/landing/LandingLayout";
import Section from "@/components/ui/Section";
import SerifText from "@/components/ui/SerifText";
import GhostButton from "@/components/ui/GhostButton";
import ResponsiveImage from "@/components/landing/ResponsiveImage";
import { useIsMobile } from "@/hooks/use-mobile";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import { getTourYearRange } from "@/lib/dateUtils";
import type { TourDate } from "@/types";

const CITY_SLUG_MAP: Record<string, string> = {
  "München": "muenchen",
  "Hamburg": "hamburg",
  "Köln": "koeln",
  "Berlin": "berlin",
  "Bremen": "bremen",
};

const generateEventSchema = (date: TourDate & { eventDate: string }) => {
  const isoDate = `${date.eventDate}T19:00:00`;
  const eventDateTime = new Date(isoDate);
  const doorTime = new Date(
    eventDateTime.getTime() - 30 * 60000
  ).toISOString();

  return {
    "@context": "https://schema.org",
    "@type": "TheaterEvent",
    name: `Pater Brown – Das Live-Hörspiel – ${date.city}`,
    description:
      "Ein spannendes Live-Hörspiel mit Antoine Monot und Wanja Mues, bekannt aus der ZDF-Serie 'Ein Fall für Zwei', und Beatboxer Marvelin.",
    startDate: isoDate,
    endDate: isoDate,
    doorTime,
    duration: "PT2H",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: date.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: date.city,
        addressCountry: date.city.includes("Zürich") ? "CH" : "DE",
      },
      ...(date.geo && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: date.geo.latitude,
          longitude: date.geo.longitude,
        },
      }),
    },
    image: ["https://paterbrown.com/images/og/pater-brown-termine-tickets-og.webp"],
    performer: [
      {
        "@type": "Person",
        name: "Antoine Monot",
        sameAs: [
          "https://de.wikipedia.org/wiki/Antoine_Monot",
          "https://www.imdb.com/name/nm0598741/",
        ],
      },
      {
        "@type": "Person",
        name: "Wanja Mues",
        sameAs: [
          "https://de.wikipedia.org/wiki/Wanja_Mues",
          "https://www.imdb.com/name/nm0611635/",
        ],
      },
      { "@type": "Person", name: "Marvelin" },
    ],
    organizer: {
      "@type": "Organization",
      name: "Dream & Anchor",
      url: "https://paterbrown.com",
    },
    offers: date.ticketUrl
      ? {
          "@type": "Offer",
          url: date.ticketUrl,
          availability: "https://schema.org/InStock",
          validFrom: `${new Date().getFullYear()}-01-01`,
          priceCurrency: date.city.includes("Zürich") ? "CHF" : "EUR",
          price: date.city.includes("Zürich") ? "45" : "35",
        }
      : undefined,
    inLanguage: "de-DE",
    workPerformed: {
      "@type": "CreativeWork",
      name: "Pater Brown Hörspiele nach G.K. Chesterton",
      author: { "@type": "Person", name: "G.K. Chesterton" },
    },
  };
};

const Termine = () => {
  const isMobile = useIsMobile();

  const {
    data: tourDates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["termine-page-events"],
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tour_events")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      const today = new Date()
        .toLocaleDateString("de-DE", {
          timeZone: "Europe/Berlin",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .split(".")
        .reverse()
        .join("-");

      return (data || [])
        .map((event) => ({
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
          (event: { eventDate: string }) => event.eventDate >= today
        )
        .sort(
          (a: { eventDate: string }, b: { eventDate: string }) =>
            new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        );
    },
  });

  const yearRange = getTourYearRange(tourDates);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Pater Brown Live-Hörspiel – Alle Termine ${yearRange}`,
    numberOfItems: tourDates.length,
    itemListElement: tourDates.map((date, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: date.ticketUrl || "https://paterbrown.com/termine",
      name: `Pater Brown – ${date.city}, ${date.date}`,
    })),
  };

  return (
    <LandingLayout
      breadcrumbs={[{ label: "Termine" }]}
      heroTitle="Alle Termine"
      heroSubtitle={`Erlebe Pater Brown als Live-Hörspiel in deiner Stadt – sichere dir jetzt deine Tickets.`}
      showCTA={false}
    >
      <SEO
        title={`Pater Brown Live-Hörspiel – Alle Termine & Tickets ${yearRange}`}
        description={`Pater Brown Live-Hörspiel Tour ${yearRange}: München, Hamburg, Köln, Stuttgart, Berlin, Leipzig, Zürich u.v.m. Jetzt Tickets sichern ab 34,90 €!`}
        canonical="/termine"
        keywords="pater brown termine, pater brown tour, pater brown tickets, pater brown live on tour, pater brown hörspiel termine"
        ogTitle={`PATER BROWN Live-Hörspiel – Termine & Tickets ${yearRange}`}
        ogDescription="Alle Termine der Pater Brown Live-Hörspiel Tour. Jetzt Tickets sichern!"
        ogImage="/images/og/pater-brown-termine-tickets-og.webp"
        schema={tourDates.length > 0 ? itemListSchema : undefined}
      />

      {/* ── Bühnenfoto Teaser ── */}
      <Section container="wide" className="py-12 md:py-16">
        <div className="card-glow rounded-[3px] overflow-hidden">
          <ResponsiveImage
            basePath="/images/hero/pater-brown-live-hoerspiel-buehne-totale-af"
            alt="Pater Brown Live-Hörspiel Bühne: Antoine Monot und Wanja Mues auf der Bühne mit blauem Licht und Nebel"
            width={2000}
            height={1500}
            sizes="(max-width: 768px) 88vw, 1100px"
            priority
            credit="Alexander Frank"
          />
        </div>
      </Section>

      {/* ── Trailer ── */}
      <Section container="narrow" className="py-8 md:py-12">
        <div className="text-center mb-8">
          <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
            Einblick
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading text-foreground">
            Erlebe Pater Brown
          </h2>
        </div>
        <div className="card-glow rounded-[3px] overflow-hidden">
          {isMobile ? (
            <div
              className="relative w-full max-w-sm mx-auto"
              style={{ paddingTop: "177.78%" }}
            >
              <iframe
                src="https://player.vimeo.com/video/1146186958?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Pater Brown Trailer"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                src="https://player.vimeo.com/video/1146186984?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Pater Brown Trailer 16x9 mit UT"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </Section>

      {/* ── Terminliste ── */}
      <Section container="wide" className="py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
            Tour {yearRange}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground">
            Termine & Tickets
          </h2>
        </div>

        {isLoading && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg font-serif normal-case">Lade Termine...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-destructive py-12">
            <p className="text-lg font-serif normal-case">Fehler beim Laden der Termine</p>
          </div>
        )}

        {!isLoading && !error && tourDates.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <SerifText size="lg" className="text-foreground/50">
              Aktuell sind keine Termine verfügbar. Neue Termine werden bald
              bekanntgegeben.
            </SerifText>
          </div>
        )}

        {!isLoading && tourDates.length > 0 && (
          <div className="space-y-3 max-w-4xl mx-auto" role="list">
            {tourDates.map((date) => {
              const citySlug = CITY_SLUG_MAP[date.city];
              return (
                <article
                  key={date.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border border-border/30 rounded-[3px] bg-card/20 transition-all hover:border-primary/30 hover:bg-card/40"
                  role="listitem"
                >
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                      __html: JSON.stringify(generateEventSchema(date)),
                    }}
                  />

                  <div className="flex items-start sm:items-center gap-4 sm:gap-8 flex-1 min-w-0">
                    <CalendarDays className="w-5 h-5 text-primary/40 shrink-0 mt-1 sm:mt-0" aria-hidden="true" />

                    <div className="min-w-[120px] sm:min-w-[140px]">
                      <time
                        className="text-lg sm:text-xl font-heading text-foreground"
                        dateTime={date.eventDate}
                      >
                        {date.date}
                      </time>
                      <p className="text-xs text-foreground/40 mt-0.5">{date.day}</p>
                    </div>

                    <div className="min-w-0">
                      {citySlug ? (
                        <Link
                          to={`/${citySlug}`}
                          className="text-foreground font-heading text-base sm:text-lg hover:text-primary transition-colors"
                        >
                          {date.city}
                        </Link>
                      ) : (
                        <span className="text-foreground font-heading text-base sm:text-lg">
                          {date.city}
                        </span>
                      )}
                      <p className="text-sm text-foreground/50 font-serif normal-case tracking-[0.05em] truncate">
                        {date.venue}
                      </p>
                    </div>

                    {date.note && (
                      <span className="hidden md:inline-flex px-3 py-1 bg-primary/10 text-primary text-[10px] uppercase tracking-[0.15em] font-heading border border-primary/30 whitespace-nowrap rounded-[2px]">
                        {date.note}
                      </span>
                    )}
                  </div>

                  {date.ticketUrl ? (
                    <GhostButton href={date.ticketUrl} size="sm">
                      Tickets
                    </GhostButton>
                  ) : (
                    <span className="text-xs font-heading text-foreground/30 uppercase tracking-[0.1em]">
                      Bald verfügbar
                    </span>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12 space-y-4">
          <GhostButton href={EVENTIM_AFFILIATE_URL} size="lg">
            Alle Termine auf Eventim
          </GhostButton>
          <p className="text-foreground/40 text-xs font-serif normal-case">
            Tickets über{" "}
            <a
              href={EVENTIM_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/70 hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              Eventim (DE)
            </a>{" "}
            und{" "}
            <a
              href="https://www.ticketcorner.ch/artist/pater-brown-das-live-hoerspiel/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/70 hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              Ticketcorner (CH)
            </a>
          </p>
        </div>
      </Section>

      {/* ── SEO Content ── */}
      <Section container="narrow" className="py-16 md:py-24">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
          Über die Tour
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Pater Brown auf Tour
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />

        <div className="space-y-4">
          <SerifText size="lg" className="text-foreground/70">
            <strong className="text-foreground">
              <Link
                to="/live-hoerspiel"
                className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                PATER BROWN – Das Live-Hörspiel
              </Link>
            </strong>{" "}
            tourt durch Deutschland und die Schweiz. Die Show vereint Theater,
            Hörspiel und Beatbox-Sounddesign zu einem einzigartigen
            Live-Erlebnis. Zwei spannende Krimis nach G.K. Chesterton werden
            pro Abend aufgeführt – alle Geräusche entstehen live auf der Bühne.
          </SerifText>
          <SerifText size="lg" className="text-foreground/70">
            <Link
              to="/antoine-monot"
              className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
            >
              <strong className="text-foreground">Antoine Monot</strong>
            </Link>{" "}
            (bekannt aus „Ein Fall für Zwei", ZDF) schlüpft in die Rolle des
            scharfsinnigen{" "}
            <Link
              to="/pater-brown"
              className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
            >
              Pater Brown
            </Link>.{" "}
            <Link
              to="/wanja-mues"
              className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
            >
              <strong className="text-foreground">Wanja Mues</strong>
            </Link>{" "}
            (ebenfalls „Ein Fall für Zwei") gibt den charmanten Meisterdieb Flambeau.
            Das Sounddesign übernimmt{" "}
            <Link
              to="/marvelin"
              className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
            >
              <strong className="text-foreground">Marvelin</strong>
            </Link>
            , einer der besten Beatboxer Europas – er erzeugt{" "}
            <Link
              to="/live-hoerspiel"
              className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
            >
              alle Geräusche live mit dem Mund
            </Link>.
          </SerifText>
          <SerifText size="lg" className="text-foreground/70">
            Die Vorstellungen dauern ca. 2 Stunden inklusive Pause. Tickets
            sind ab 34,90 € (Deutschland) bzw. CHF 45 (Schweiz) erhältlich.
            Die Show ist für Zuschauer ab ca. 12 Jahren empfohlen.
          </SerifText>
        </div>
      </Section>
    </LandingLayout>
  );
};

export default Termine;
