import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import LandingLayout from "@/components/landing/LandingLayout";
import SectionHeading from "@/components/landing/SectionHeading";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import { getTourYearRange } from "@/lib/dateUtils";
import ResponsiveImage from "@/components/landing/ResponsiveImage";
import type { TourDate } from "@/types";

/** Mapping Stadtname → Slug für interne Verlinkung */
const CITY_SLUG_MAP: Record<string, string> = {
  "München": "muenchen",
  "Hamburg": "hamburg",
  "Köln": "koeln",
  "Berlin": "berlin",
  "Bremen": "bremen",
};

/** TheaterEvent JSON-LD für einen einzelnen Termin */
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

  // ItemList Schema für die Gesamtliste
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
      />

      {/* ItemList Schema */}
      {tourDates.length > 0 && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(itemListSchema)}
          </script>
        </Helmet>
      )}

      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <p className="text-gold uppercase tracking-[0.3em] text-sm font-light">
          Termine & Tickets {yearRange}
        </p>
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-heading tracking-wider text-gold uppercase">
          Alle Termine
        </h1>
        <p className="text-xl text-foreground/80 font-light leading-relaxed max-w-2xl mx-auto mt-6">
          Erlebe Pater Brown als Live-Hörspiel in deiner Stadt – sichere dir
          jetzt deine Tickets.
        </p>
      </div>

      {/* Ensemble-Bühnenfoto als Teaser */}
      <div className="mb-12 rounded-lg overflow-hidden">
        <ResponsiveImage
          basePath="/images/hero/pater-brown-live-hoerspiel-buehne-totale-af"
          alt="Pater Brown Live-Hörspiel Bühne: Antoine Monot und Wanja Mues auf der Bühne mit blauem Licht und Nebel"
          width={2000}
          height={1500}
          sizes="(max-width: 768px) 100vw, 800px"
          priority
          className="rounded-lg"
          credit="Alexander Frank"
        />
      </div>

      {/* Lade-Status */}
      {isLoading && (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-lg">Lade Termine...</p>
        </div>
      )}

      {error && (
        <div className="text-center text-destructive py-12">
          <p className="text-lg">Fehler beim Laden der Termine</p>
        </div>
      )}

      {!isLoading && !error && tourDates.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-lg">
            Aktuell sind keine Termine verfügbar. Neue Termine werden bald
            bekanntgegeben.
          </p>
        </div>
      )}

      {/* Termin-Liste */}
      {!isLoading && tourDates.length > 0 && (
        <div className="space-y-2" role="list">
          {tourDates.map((date) => (
            <article
              key={date.id}
              className="tour-date-premium flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 group"
              role="listitem"
            >
              {/* Event Schema pro Termin */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(generateEventSchema(date)),
                }}
              />
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 flex-1">
                <div className="flex flex-col min-w-[160px]">
                  <time
                    className="text-3xl md:text-4xl font-heading text-gold group-hover:scale-105 transition-transform"
                    dateTime={date.eventDate}
                  >
                    {date.date}
                  </time>
                  <span className="text-sm text-muted-foreground mt-1">
                    {date.day}
                  </span>
                </div>
                <div className="flex flex-col">
                  {CITY_SLUG_MAP[date.city] ? (
                    <Link
                      to={`/${CITY_SLUG_MAP[date.city]}`}
                      className="text-2xl md:text-3xl text-foreground font-light hover:text-gold transition-colors"
                    >
                      {date.city}
                    </Link>
                  ) : (
                    <span className="text-2xl md:text-3xl text-foreground font-light">
                      {date.city}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground mt-1">
                    {date.venue}
                  </span>
                </div>
                {date.note && (
                  <span className="self-start px-3 py-1.5 bg-gold/10 text-gold text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold border border-gold/30 whitespace-nowrap">
                    {date.note}
                  </span>
                )}
              </div>
              {date.ticketUrl && (
                <a
                  href={date.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-gold active:text-gold transition-all duration-300 font-medium uppercase tracking-[0.15em] text-base border-b-2 border-transparent hover:border-gold pb-1 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background inline-flex items-center min-h-[44px]"
                  aria-label={`Tickets kaufen für ${date.city} am ${date.date}`}
                >
                  Tickets <span aria-hidden="true">→</span>
                </a>
              )}
            </article>
          ))}
        </div>
      )}

      {/* CTA Bottom */}
      <div className="text-center mt-16 space-y-6">
        <a
          href={EVENTIM_AFFILIATE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="btn-premium" type="button">
            Alle Termine auf Eventim ansehen
          </button>
        </a>
        <p className="text-muted-foreground text-sm">
          Tickets über{" "}
          <a
            href={EVENTIM_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
          >
            Eventim (DE)
          </a>{" "}
          und{" "}
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

      {/* SEO Content Block */}
      <section className="mt-16 space-y-8">
        <SectionHeading label="Über die Tour" title="Pater Brown auf Tour" />
        <div className="text-foreground/80 leading-relaxed space-y-4">
          <p>
            <strong className="text-foreground">
              <Link
                to="/live-hoerspiel"
                className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
              >
                PATER BROWN – Das Live-Hörspiel
              </Link>
            </strong>{" "}
            tourt durch Deutschland und die Schweiz. Die Show vereint Theater,
            Hörspiel und Beatbox-Sounddesign zu einem einzigartigen
            Live-Erlebnis. Zwei spannende Krimis nach G.K. Chesterton werden
            pro Abend aufgeführt – alle Geräusche entstehen live auf der
            Bühne.
          </p>
          <p>
            <Link
              to="/antoine-monot"
              className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
            >
              <strong className="text-foreground hover:text-gold transition-colors">Antoine Monot</strong>
            </Link>{" "}
            (bekannt aus „Ein Fall für Zwei", ZDF) schlüpft in die Rolle des
            scharfsinnigen{" "}
            <Link
              to="/pater-brown"
              className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
            >
              Pater Brown
            </Link>.{" "}
            <Link
              to="/wanja-mues"
              className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
            >
              <strong className="text-foreground hover:text-gold transition-colors">Wanja Mues</strong>
            </Link>{" "}
            (ebenfalls „Ein Fall für Zwei") gibt den charmanten Meisterdieb Flambeau.
            Das Sounddesign übernimmt{" "}
            <Link
              to="/marvelin"
              className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
            >
              <strong className="text-foreground hover:text-gold transition-colors">Marvelin</strong>
            </Link>
            , einer der besten Beatboxer Europas – er erzeugt{" "}
            <Link
              to="/live-hoerspiel"
              className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline"
            >
              alle Geräusche live mit dem Mund
            </Link>.
          </p>
          <p>
            Die Vorstellungen dauern ca. 2 Stunden inklusive Pause. Tickets
            sind ab 34,90 € (Deutschland) bzw. CHF 45 (Schweiz) erhältlich.
            Die Show ist für Zuschauer ab ca. 12 Jahren empfohlen.
          </p>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Termine;
