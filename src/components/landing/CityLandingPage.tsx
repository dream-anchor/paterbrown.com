import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import LandingLayout from "./LandingLayout";
import FAQSection from "./FAQSection";
import ResponsiveImage from "./ResponsiveImage";
import CTASection from "./CTASection";
import { CalendarDays, MapPin, Train, Car, Utensils, Hotel, Landmark } from "lucide-react";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

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

  // Event Schema
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
      heroTitle={config.cityName}
      heroSubtitle={`Das Live-Hörspiel`}
    >
      <SEO
        title={config.seo.title}
        description={config.seo.description}
        canonical={`/${config.slug}`}
        keywords={config.seo.keywords}
        ogImage={`/images/og/pater-brown-${config.slug}-live-hoerspiel-og.webp`}
      />

      {eventSchema && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(eventSchema)}</script>
        </Helmet>
      )}

      {/* ─── Event Details ─── */}
      {nextEvent ? (
        <section className="py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            <div className="border border-foreground/10 p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-5">
                  <p className="text-foreground/40 text-[10px] uppercase tracking-[0.3em]">Nächster Termin</p>
                  <div className="flex items-center gap-4">
                    <CalendarDays className="w-5 h-5 text-gold shrink-0" aria-hidden="true" />
                    <div>
                      <span className="text-foreground font-heading text-3xl md:text-4xl">{nextEvent.date}</span>
                      <span className="text-foreground/30 text-sm ml-3">{nextEvent.day}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-gold shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-foreground text-lg">{config.venue.name}</p>
                      <p className="text-foreground/40 text-sm">{config.venue.address}</p>
                    </div>
                  </div>
                </div>
                {nextEvent.ticketUrl && (
                  <a href={nextEvent.ticketUrl} target="_blank" rel="noopener noreferrer">
                    <button className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 transition-all duration-300" type="button">
                      Tickets sichern
                    </button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : config.noCurrentEvent ? (
        <section className="py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-6 md:px-12 text-center space-y-4">
            <p className="text-foreground/50 text-xl font-light">
              {config.comingSoonText || `Aktuell sind keine Termine in ${config.cityName} geplant.`}
            </p>
            <Link to="/termine" className="text-foreground/60 hover:text-foreground transition-colors text-sm uppercase tracking-[0.2em] inline-block">
              Alle Termine →
            </Link>
          </div>
        </section>
      ) : null}

      {/* ─── Über die Veranstaltung ─── */}
      <section className="py-20 md:py-28 border-t border-foreground/5">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <p className="text-foreground/30 text-[10px] uppercase tracking-[0.4em] mb-6">Die Show</p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading text-foreground mb-10 leading-[0.9]">
            Krimi, Klang<br />& Gänsehaut
          </h2>
          <div className="text-foreground/60 leading-relaxed space-y-5 text-lg max-w-3xl">
            <p>
              <strong className="text-foreground/90">PATER BROWN – Das Live-Hörspiel</strong>{" "}
              kommt nach {config.cityName}. Erleben Sie die einzigartige Kombination aus Theater,
              Hörspiel und Beatbox-Sounddesign live auf der Bühne.
            </p>
            <p>
              <Link to="/antoine-monot" className="text-foreground/80 hover:text-foreground transition-colors underline underline-offset-4 decoration-foreground/20 hover:decoration-foreground/40">Antoine Monot</Link>{" "}
              schlüpft in die Rolle des scharfsinnigen Pater Brown.{" "}
              <Link to="/wanja-mues" className="text-foreground/80 hover:text-foreground transition-colors underline underline-offset-4 decoration-foreground/20 hover:decoration-foreground/40">Wanja Mues</Link>{" "}
              gibt den charmanten Meisterdieb Flambeau, und{" "}
              <Link to="/marvelin" className="text-foreground/80 hover:text-foreground transition-colors underline underline-offset-4 decoration-foreground/20 hover:decoration-foreground/40">Marvelin</Link>{" "}
              erzeugt live alle Geräusche – ausschließlich mit dem Mund.
            </p>
            <p className="text-foreground/40">
              2 Krimis · ca. 2 Stunden · ab{" "}
              {config.addressCountry === "CH" ? "CHF 45" : "34,90 €"}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Bühnenfoto – Full Bleed ─── */}
      <section className="py-0">
        <ResponsiveImage
          basePath="/images/buehne/pater-brown-atmosphaere-silhouette-nebel-af"
          alt={`Stimmungsvolle Silhouette beim Pater Brown Live-Hörspiel in ${config.cityName}`}
          width={2000}
          height={2666}
          sizes="100vw"
          priority
          className="w-full aspect-[21/9] object-cover object-center"
          credit="Alexander Frank"
        />
      </section>

      {/* ─── Großes Zitat ─── */}
      <section className="py-24 md:py-36">
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
          <blockquote className="text-3xl md:text-5xl lg:text-7xl font-heading italic text-foreground/80 leading-[0.95]">
            „Zwei Schauspieler.<br />Alle Stimmen.<br />Jeder verdächtig."
          </blockquote>
        </div>
      </section>

      {/* ─── Veranstaltungsort ─── */}
      <section className="py-20 md:py-28 border-t border-foreground/5">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <p className="text-foreground/30 text-[10px] uppercase tracking-[0.4em] mb-6">Veranstaltungsort</p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading text-foreground mb-10 leading-[0.9]">
            {config.venue.name}
          </h2>
          <p className="text-foreground/50 leading-relaxed text-lg mb-12 max-w-3xl">{config.venue.description}</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/5">
            <div className="p-8 bg-background space-y-3">
              <MapPin className="w-5 h-5 text-foreground/30" aria-hidden="true" />
              <p className="text-foreground/30 text-[10px] uppercase tracking-[0.3em]">Adresse</p>
              <p className="text-foreground/70 text-sm">{config.venue.address}</p>
            </div>
            {config.venue.oepnv && (
              <div className="p-8 bg-background space-y-3">
                <Train className="w-5 h-5 text-foreground/30" aria-hidden="true" />
                <p className="text-foreground/30 text-[10px] uppercase tracking-[0.3em]">ÖPNV</p>
                <p className="text-foreground/70 text-sm">{config.venue.oepnv}</p>
              </div>
            )}
            {config.venue.parking && (
              <div className="p-8 bg-background space-y-3">
                <Car className="w-5 h-5 text-foreground/30" aria-hidden="true" />
                <p className="text-foreground/30 text-[10px] uppercase tracking-[0.3em]">Parken</p>
                <p className="text-foreground/70 text-sm">{config.venue.parking}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Stadt-Tipps – als Karten ─── */}
      {tipSections.length > 0 && (
        <section className="py-20 md:py-28 border-t border-foreground/5">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            <p className="text-foreground/30 text-[10px] uppercase tracking-[0.4em] mb-6">{config.cityName} entdecken</p>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading text-foreground mb-14 leading-[0.9]">
              Rund um<br />den Abend
            </h2>

            <div className="grid md:grid-cols-3 gap-px bg-foreground/5">
              {tipSections.map(({ icon: Icon, title, items }) => (
                <div key={title} className="p-8 bg-background">
                  <Icon className="w-5 h-5 text-foreground/20 mb-4" aria-hidden="true" />
                  <h3 className="text-foreground/60 text-[11px] uppercase tracking-[0.25em] font-medium mb-6">{title}</h3>
                  <ul className="space-y-3">
                    {items.map((tip, i) => (
                      <li key={i} className="text-foreground/50 text-sm leading-relaxed pl-3 border-l border-foreground/10">
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

      {/* ─── Über das Live-Hörspiel ─── */}
      <section className="py-20 md:py-28 border-t border-foreground/5">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <p className="text-foreground/30 text-[10px] uppercase tracking-[0.4em] mb-6">Mehr erfahren</p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading text-foreground mb-10 leading-[0.9]">
            G.K. Chesterton<br />neu erzählt
          </h2>
          <div className="text-foreground/50 leading-relaxed space-y-5 text-lg max-w-3xl">
            <p>
              <strong className="text-foreground/80">PATER BROWN – Das Live-Hörspiel</strong>{" "}
              basiert auf den zeitlosen Kriminalgeschichten von{" "}
              <Link to="/g-k-chesterton" className="text-foreground/70 hover:text-foreground transition-colors underline underline-offset-4 decoration-foreground/20">G.K. Chesterton</Link>.
              Die Figur des{" "}
              <Link to="/pater-brown" className="text-foreground/70 hover:text-foreground transition-colors underline underline-offset-4 decoration-foreground/20">Pater Brown</Link>{" "}
              – ein unscheinbarer Priester, der mit Einfühlungsvermögen Kriminalfälle löst – fasziniert seit über 100 Jahren.
            </p>
            <p>
              <Link to="/live-hoerspiel" className="text-foreground/70 hover:text-foreground transition-colors underline underline-offset-4 decoration-foreground/20">
                Was ist ein Live-Hörspiel? →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ─── Nearby Cities ─── */}
      {config.nearbyCities && config.nearbyCities.length > 0 && (
        <section className="py-20 md:py-28 border-t border-foreground/5">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            <p className="text-foreground/30 text-[10px] uppercase tracking-[0.4em] mb-6">Auch in der Nähe</p>
            <div className="grid sm:grid-cols-2 gap-px bg-foreground/5">
              {config.nearbyCities.map((city) => (
                <Link
                  key={city.slug}
                  to={`/${city.slug}`}
                  className="p-8 bg-background hover:bg-foreground/[0.02] transition-colors group"
                >
                  <span className="text-3xl md:text-4xl font-heading text-foreground group-hover:text-foreground/80 transition-colors">
                    {city.name}
                  </span>
                  <p className="text-foreground/30 text-sm mt-2">Pater Brown Live →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ ─── */}
      {config.faq.length > 0 && (
        <section className="py-20 md:py-28 border-t border-foreground/5">
          <div className="max-w-4xl mx-auto px-6 md:px-12">
            <FAQSection items={config.faq} label="FAQ" title={`Häufige Fragen`} />
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="py-20 md:py-28 border-t border-foreground/5">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <CTASection />
        </div>
      </section>
    </LandingLayout>
  );
};

export default CityLandingPage;
