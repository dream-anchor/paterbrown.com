import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import LandingLayout from "./LandingLayout";
import FAQSection from "./FAQSection";
import { CalendarDays, MapPin, Train, Car, Utensils, Hotel, Landmark } from "lucide-react";

interface VenueInfo {
  name: string;
  address: string;
  description: string;
  oepnv?: string;
  parking?: string;
}

export interface CityPageConfig {
  slug: string;
  cityName: string;
  cityFilter: string;
  addressRegion?: string;
  addressCountry: string;
  venue: VenueInfo;
  tips: {
    restaurants: string[];
    hotels: string[];
    sights: string[];
  };
  faq: { question: string; answer: string }[];
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  nearbyCities?: { slug: string; name: string }[];
  noCurrentEvent?: boolean;
  comingSoonText?: string;
  heroImage?: string;
}

const CityLandingPage = ({ config }: { config: CityPageConfig }) => {
  const { data: events = [] } = useQuery({
    queryKey: ["city-events", config.cityFilter],
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("tour_events")
        .select("*")
        .eq("is_active", true)
        .ilike("city", `%${config.cityFilter}%`)
        .gte("event_date", today)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return (data || []).map((event) => ({
        id: event.id,
        date: event.date,
        day: event.day,
        city: event.city,
        venue: event.venue,
        ticketUrl: event.ticket_url || undefined,
        eventDate: event.event_date,
        geo:
          event.latitude && event.longitude
            ? { latitude: Number(event.latitude), longitude: Number(event.longitude) }
            : undefined,
      }));
    },
  });

  const nextEvent = events[0];

  const eventSchema = nextEvent
    ? {
        "@context": "https://schema.org",
        "@type": "TheaterEvent",
        name: `Pater Brown – Das Live-Hörspiel – ${config.cityName}`,
        description: `Live-Hörspiel mit Antoine Monot, Wanja Mues & Marvelin in ${config.cityName}, ${config.venue.name}`,
        startDate: `${nextEvent.eventDate}T20:00:00`,
        duration: "PT2H",
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: config.venue.name,
          address: {
            "@type": "PostalAddress",
            streetAddress: config.venue.address.split(",")[0]?.trim(),
            addressLocality: config.cityName,
            ...(config.addressRegion && { addressRegion: config.addressRegion }),
            addressCountry: config.addressCountry,
          },
        },
        image: [`https://paterbrown.com/images/og/pater-brown-${config.slug}-live-hoerspiel-og.webp`],
        performer: [
          { "@type": "Person", name: "Antoine Monot", sameAs: ["https://de.wikipedia.org/wiki/Antoine_Monot", "https://www.imdb.com/name/nm0598741/"] },
          { "@type": "Person", name: "Wanja Mues", sameAs: ["https://de.wikipedia.org/wiki/Wanja_Mues", "https://www.imdb.com/name/nm0611635/"] },
          { "@type": "Person", name: "Marvelin" },
        ],
        organizer: { "@type": "Organization", name: "Dream & Anchor", url: "https://paterbrown.com" },
        offers: nextEvent.ticketUrl
          ? {
              "@type": "Offer",
              url: nextEvent.ticketUrl,
              availability: "https://schema.org/InStock",
              priceCurrency: config.addressCountry === "CH" ? "CHF" : "EUR",
              price: config.addressCountry === "CH" ? "45" : "35",
            }
          : undefined,
        inLanguage: "de-DE",
      }
    : undefined;

  const tipSections = [
    { icon: Utensils, title: "Restaurants & Bars", items: config.tips.restaurants },
    { icon: Hotel, title: "Übernachten", items: config.tips.hotels },
    { icon: Landmark, title: "Sehenswürdigkeiten", items: config.tips.sights },
  ].filter(s => s.items.length > 0);

  return (
    <LandingLayout
      breadcrumbs={[
        { label: "Termine", href: "/termine" },
        { label: config.cityName },
      ]}
      heroImage={config.heroImage}
      heroTitle={config.cityName}
      heroSubtitle="Das Live-Hörspiel"
      showCTA
    >
      <SEO
        title={config.seo.title}
        description={config.seo.description}
        canonical={`/${config.slug}`}
        keywords={config.seo.keywords}
        ogImage={`/images/og/pater-brown-${config.slug}-live-hoerspiel-og.webp`}
        schema={eventSchema}
      />

      {/* ── Event Details ── */}
      {nextEvent ? (
        <section className="py-28 md:py-36 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="p-8 md:p-12 border border-foreground/10 bg-card/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-5">
                  <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium">
                    Nächster Termin
                  </p>
                  <div className="flex items-center gap-4">
                    <CalendarDays className="w-5 h-5 text-gold/50 shrink-0" aria-hidden="true" />
                    <div>
                      <span className="text-foreground font-heading text-3xl md:text-4xl">{nextEvent.date}</span>
                      <span className="text-foreground/30 text-sm ml-3">{nextEvent.day}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-gold/50 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-foreground font-heading text-lg">{config.venue.name}</p>
                      <p className="text-foreground/40 text-sm">{config.venue.address}</p>
                    </div>
                  </div>
                </div>
                {nextEvent.ticketUrl && (
                  <a
                    href={nextEvent.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm md:text-base uppercase tracking-[0.25em] font-semibold px-10 md:px-14 py-4 md:py-5 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block"
                  >
                    Tickets sichern
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : config.noCurrentEvent ? (
        <section className="py-28 md:py-36 px-6">
          <div className="container mx-auto max-w-4xl text-center space-y-6">
            <p className="text-foreground/50 leading-relaxed text-xl font-light">
              {config.comingSoonText || `Aktuell sind keine Termine in ${config.cityName} geplant.`}
            </p>
            <Link
              to="/termine"
              className="text-xs uppercase tracking-[0.25em] font-semibold px-6 py-3 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block"
            >
              Alle Termine
            </Link>
          </div>
        </section>
      ) : null}

      {/* ── Die Show ── */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium">Die Show</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] font-heading text-foreground leading-[0.85] mb-8">
            Krimi, Klang & Gänsehaut
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" />

          <div className="space-y-4 max-w-3xl">
            <p className="text-foreground/70 leading-relaxed text-lg font-light">
              <strong className="text-foreground">PATER BROWN – Das Live-Hörspiel</strong>{" "}
              kommt nach {config.cityName}. Erleben Sie die einzigartige Kombination aus Theater,
              Hörspiel und Beatbox-Sounddesign live auf der Bühne.
            </p>
            <p className="text-foreground/70 leading-relaxed text-lg font-light">
              <Link to="/antoine-monot" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">Antoine Monot</Link>{" "}
              schlüpft in die Rolle des scharfsinnigen Pater Brown.{" "}
              <Link to="/wanja-mues" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">Wanja Mues</Link>{" "}
              gibt den charmanten Meisterdieb Flambeau, und{" "}
              <Link to="/marvelin" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">Marvelin</Link>{" "}
              erzeugt live alle Geräusche – ausschließlich mit dem Mund.
            </p>
            <p className="text-foreground/40 font-heading text-sm uppercase tracking-[0.15em]">
              2 Krimis · ca. 2 Stunden · ab{" "}
              {config.addressCountry === "CH" ? "CHF 45" : "34,90 €"}
            </p>
          </div>

          <div className="mt-8">
            <Link
              to="/live-hoerspiel"
              className="text-gold text-xs font-heading uppercase tracking-[0.15em] hover:text-foreground transition-colors"
            >
              Mehr zur Show &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bühnenfoto – Full Bleed ── */}
      <div
        className="w-full min-h-[250px] md:min-h-[400px] bg-cover bg-center"
        style={{ backgroundImage: `url(/images/buehne/pater-brown-atmosphaere-silhouette-nebel-af-1200.webp)` }}
        role="img"
        aria-label={`Stimmungsvolle Silhouette beim Pater Brown Live-Hörspiel in ${config.cityName}`}
      />

      {/* ── Großes Zitat ── */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <blockquote className="text-3xl md:text-5xl lg:text-6xl font-heading italic text-foreground/90 leading-tight">
            „Zwei Schauspieler. Alle Stimmen. Jeder verdächtig.“
          </blockquote>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent max-w-md mx-auto mt-10 mb-6" />
          <p className="text-gold text-sm uppercase tracking-[0.3em]">Das Live-Hörspiel</p>
        </div>
      </section>

      {/* ── Veranstaltungsort ── */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-6xl">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium">Veranstaltungsort</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] font-heading text-foreground leading-[0.85] mb-8">
            {config.venue.name}
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" />

          <p className="text-foreground/60 leading-relaxed text-lg font-light mb-12 max-w-3xl">
            {config.venue.description}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 border border-foreground/10 bg-card/10 space-y-3">
              <MapPin className="w-5 h-5 text-gold/40" aria-hidden="true" />
              <p className="text-gold text-[10px] uppercase tracking-[0.2em] font-heading">Adresse</p>
              <p className="text-foreground/70 text-sm leading-relaxed">{config.venue.address}</p>
            </div>
            {config.venue.oepnv && (
              <div className="p-6 border border-foreground/10 bg-card/10 space-y-3">
                <Train className="w-5 h-5 text-gold/40" aria-hidden="true" />
                <p className="text-gold text-[10px] uppercase tracking-[0.2em] font-heading">ÖPNV</p>
                <p className="text-foreground/70 text-sm leading-relaxed">{config.venue.oepnv}</p>
              </div>
            )}
            {config.venue.parking && (
              <div className="p-6 border border-foreground/10 bg-card/10 space-y-3">
                <Car className="w-5 h-5 text-gold/40" aria-hidden="true" />
                <p className="text-gold text-[10px] uppercase tracking-[0.2em] font-heading">Parken</p>
                <p className="text-foreground/70 text-sm leading-relaxed">{config.venue.parking}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stadt-Tipps ── */}
      {tipSections.length > 0 && (
        <section className="py-28 md:py-36 px-6">
          <div className="container mx-auto max-w-6xl">
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium">
              {config.cityName} entdecken
            </p>
            <h2 className="text-5xl sm:text-6xl md:text-[8rem] font-heading text-foreground leading-[0.85] mb-8">
              Rund um den Abend
            </h2>
            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-12" />

            <div className="grid md:grid-cols-3 gap-4">
              {tipSections.map(({ icon: Icon, title, items }) => (
                <div key={title} className="p-6 border border-foreground/10 bg-card/10">
                  <Icon className="w-5 h-5 text-gold/40 mb-4" aria-hidden="true" />
                  <h3 className="text-gold text-[11px] uppercase tracking-[0.2em] font-heading mb-6">{title}</h3>
                  <ul className="space-y-3">
                    {items.map((tip, i) => (
                      <li key={i} className="text-foreground/60 text-sm leading-relaxed pl-3 border-l border-gold/20">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Mehr erfahren ── */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium">Mehr erfahren</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] font-heading text-foreground leading-[0.85] mb-8">
            G.K. Chesterton neu erzählt
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" />

          <div className="space-y-4 max-w-3xl">
            <p className="text-foreground/70 leading-relaxed text-lg font-light">
              <strong className="text-foreground">PATER BROWN – Das Live-Hörspiel</strong>{" "}
              basiert auf den zeitlosen Kriminalgeschichten von{" "}
              <Link to="/g-k-chesterton" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">G.K. Chesterton</Link>.
              Die Figur des{" "}
              <Link to="/pater-brown" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">Pater Brown</Link>{" "}
              – ein unscheinbarer Priester, der mit Einfühlungsvermögen Kriminalfälle löst – fasziniert seit über 100 Jahren.
            </p>
            <Link
              to="/live-hoerspiel"
              className="text-gold text-xs font-heading uppercase tracking-[0.15em] hover:text-foreground transition-colors inline-block"
            >
              Was ist ein Live-Hörspiel? &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Nearby Cities ── */}
      {config.nearbyCities && config.nearbyCities.length > 0 && (
        <section className="py-28 md:py-36 px-6">
          <div className="container mx-auto max-w-6xl">
            <p className="text-gold text-sm uppercase tracking-[0.3em] mb-8 font-medium">
              Auch in der Nähe
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {config.nearbyCities.map((city) => (
                <Link
                  key={city.slug}
                  to={`/${city.slug}`}
                  className="p-8 border border-foreground/10 bg-card/10 group transition-all hover:border-gold/20"
                >
                  <span className="text-3xl md:text-4xl font-heading text-foreground group-hover:text-gold transition-colors">
                    {city.name}
                  </span>
                  <p className="text-foreground/40 text-sm mt-2">
                    Pater Brown Live &rarr;
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {config.faq.length > 0 && (
        <section className="py-28 md:py-36 px-6">
          <div className="container mx-auto max-w-4xl">
            <FAQSection items={config.faq} label="FAQ" title="Häufige Fragen" />
          </div>
        </section>
      )}
    </LandingLayout>
  );
};

export default CityLandingPage;
