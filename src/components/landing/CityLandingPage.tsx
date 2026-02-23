import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import LandingLayout from "./LandingLayout";
import FAQSection from "./FAQSection";
import ResponsiveImage from "./ResponsiveImage";
import CTASection from "./CTASection";
import { CalendarDays, MapPin, Train, Car } from "lucide-react";
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
            ? {
                latitude: Number(event.latitude),
                longitude: Number(event.longitude),
              }
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

  return (
    <LandingLayout
      breadcrumbs={[
        { label: "Termine", href: "/termine" },
        { label: config.cityName },
      ]}
      heroImage="/images/buehne/pater-brown-atmosphaere-silhouette-nebel-af-2000w.webp"
      heroTitle={config.cityName}
      heroSubtitle={`Pater Brown – Das Live-Hörspiel`}
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
          <script type="application/ld+json">
            {JSON.stringify(eventSchema)}
          </script>
        </Helmet>
      )}

      {/* Event Details - Full Width Section */}
      {nextEvent ? (
        <section className="py-20 md:py-28 bg-card/20">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <CalendarDays className="w-6 h-6 text-gold shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-gold font-heading text-3xl md:text-4xl">
                      {nextEvent.date}
                    </span>
                    <span className="text-foreground/40 text-sm ml-3">{nextEvent.day}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-gold shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-foreground text-lg font-medium">{config.venue.name}</p>
                    <p className="text-foreground/50 text-sm">{config.venue.address}</p>
                  </div>
                </div>
              </div>
              {nextEvent.ticketUrl && (
                <a href={nextEvent.ticketUrl} target="_blank" rel="noopener noreferrer">
                  <button className="btn-premium text-lg" type="button">
                    Jetzt Tickets sichern
                  </button>
                </a>
              )}
            </div>
          </div>
        </section>
      ) : config.noCurrentEvent ? (
        <section className="py-20 md:py-28 bg-card/20">
          <div className="max-w-5xl mx-auto px-6 md:px-12 text-center space-y-4">
            <p className="text-foreground/70 text-xl font-light">
              {config.comingSoonText ||
                `Aktuell sind keine Termine in ${config.cityName} geplant. Neue Termine werden bald bekanntgegeben.`}
            </p>
            <Link
              to="/termine"
              className="text-gold hover:text-gold/80 transition-colors text-sm font-medium uppercase tracking-[0.2em] underline-offset-4 hover:underline inline-block"
            >
              Alle Termine anzeigen →
            </Link>
          </div>
        </section>
      ) : null}

      {/* Über die Veranstaltung - Full Width */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium mb-4">Die Show</p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading text-foreground mb-8">
            Über die Veranstaltung
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent max-w-xs mb-10" />
          <div className="text-foreground/80 leading-relaxed space-y-5 text-lg">
            <p>
              <strong className="text-foreground">PATER BROWN – Das Live-Hörspiel</strong>{" "}
              kommt nach {config.cityName}! Erleben Sie die einzigartige Kombination aus Theater,
              Hörspiel und Beatbox-Sounddesign live auf der Bühne.
            </p>
            <p>
              <Link to="/antoine-monot" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">Antoine Monot</Link>{" "}
              (bekannt aus „Ein Fall für zwei", ZDF) schlüpft in die Rolle des scharfsinnigen Pater Brown.{" "}
              <Link to="/wanja-mues" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">Wanja Mues</Link>{" "}
              gibt den charmanten Meisterdieb Flambeau, und Beatboxer{" "}
              <Link to="/marvelin" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">Marvelin</Link>{" "}
              erzeugt live alle Geräusche und Soundeffekte – ausschließlich mit dem Mund.
            </p>
            <p>
              Pro Abend werden zwei spannende Kriminalgeschichten nach G.K. Chesterton aufgeführt. Die
              Vorstellung dauert ca. 2 Stunden inklusive Pause und ist ab{" "}
              {config.addressCountry === "CH" ? "CHF 45" : "34,90 €"} erhältlich.
            </p>
          </div>
        </div>
      </section>

      {/* Bühnenfoto - Full Bleed */}
      <section className="py-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <ResponsiveImage
            basePath="/images/buehne/pater-brown-atmosphaere-silhouette-nebel-af"
            alt={`Stimmungsvolle Silhouette beim Pater Brown Live-Hörspiel in ${config.cityName}`}
            width={2000}
            height={2666}
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
            className="w-full aspect-[21/9] object-cover object-center"
            credit="Alexander Frank"
          />
        </div>
      </section>

      {/* Veranstaltungsort */}
      <section className="py-20 md:py-28 bg-card/10">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium mb-4">Veranstaltungsort</p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading text-foreground mb-8">
            {config.venue.name}
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent max-w-xs mb-10" />
          <p className="text-foreground/80 leading-relaxed text-lg mb-10">{config.venue.description}</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border border-foreground/10 bg-card/20 space-y-3">
              <div className="flex items-center gap-3 text-gold">
                <MapPin className="w-5 h-5" aria-hidden="true" />
                <span className="font-heading text-sm uppercase tracking-wider">Adresse</span>
              </div>
              <p className="text-foreground/60 text-sm">{config.venue.address}</p>
            </div>
            {config.venue.oepnv && (
              <div className="p-6 border border-foreground/10 bg-card/20 space-y-3">
                <div className="flex items-center gap-3 text-gold">
                  <Train className="w-5 h-5" aria-hidden="true" />
                  <span className="font-heading text-sm uppercase tracking-wider">ÖPNV</span>
                </div>
                <p className="text-foreground/60 text-sm">{config.venue.oepnv}</p>
              </div>
            )}
            {config.venue.parking && (
              <div className="p-6 border border-foreground/10 bg-card/20 space-y-3">
                <div className="flex items-center gap-3 text-gold">
                  <Car className="w-5 h-5" aria-hidden="true" />
                  <span className="font-heading text-sm uppercase tracking-wider">Parken</span>
                </div>
                <p className="text-foreground/60 text-sm">{config.venue.parking}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stadt-Tipps */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium mb-4">{config.cityName}</p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading text-foreground mb-8">
            {config.cityName} erleben
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent max-w-xs mb-10" />
          <div className="text-foreground/80 leading-relaxed space-y-8">
            {config.tips.restaurants.length > 0 && (
              <div>
                <h3 className="text-gold font-heading text-2xl mb-4">Restaurants & Bars in der Nähe</h3>
                <ul className="list-disc list-inside space-y-2 pl-2 text-foreground/60">
                  {config.tips.restaurants.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            )}
            {config.tips.hotels.length > 0 && (
              <div>
                <h3 className="text-gold font-heading text-2xl mb-4">Übernachten</h3>
                <ul className="list-disc list-inside space-y-2 pl-2 text-foreground/60">
                  {config.tips.hotels.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            )}
            {config.tips.sights.length > 0 && (
              <div>
                <h3 className="text-gold font-heading text-2xl mb-4">Das sollte man gesehen haben</h3>
                <ul className="list-disc list-inside space-y-2 pl-2 text-foreground/60">
                  {config.tips.sights.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Großes Zitat - Full Width */}
      <section className="py-20 md:py-32 bg-card/10">
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
          <blockquote className="text-3xl md:text-5xl lg:text-6xl font-heading italic text-foreground/90 leading-tight">
            „Zwei Schauspieler. Alle Stimmen. Jeder verdächtig."
          </blockquote>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent max-w-md mx-auto mt-10" />
        </div>
      </section>

      {/* Über das Live-Hörspiel */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium mb-4">Mehr erfahren</p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading text-foreground mb-8">
            Über das Live-Hörspiel
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent max-w-xs mb-10" />
          <div className="text-foreground/80 leading-relaxed space-y-5 text-lg">
            <p>
              <strong className="text-foreground">PATER BROWN – Das Live-Hörspiel</strong>{" "}
              basiert auf den zeitlosen Kriminalgeschichten von{" "}
              <Link to="/g-k-chesterton" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">G.K. Chesterton</Link>.
              Die Figur des{" "}
              <Link to="/pater-brown" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">Pater Brown</Link>{" "}
              – ein unscheinbarer Priester, der mit Einfühlungsvermögen Kriminalfälle löst – fasziniert Leser
              und Zuschauer seit über 100 Jahren.
            </p>
            <p>
              Mehr über das Format erfahren Sie auf der Seite{" "}
              <Link to="/live-hoerspiel" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Was ist ein Live-Hörspiel?
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Crosslinks - Nearby Cities */}
      {config.nearbyCities && config.nearbyCities.length > 0 && (
        <section className="py-20 md:py-28 bg-card/10">
          <div className="max-w-4xl mx-auto px-6 md:px-12">
            <h3 className="text-gold font-heading text-2xl mb-8">Auch in der Nähe</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {config.nearbyCities.map((city) => (
                <Link
                  key={city.slug}
                  to={`/${city.slug}`}
                  className="p-6 border border-foreground/10 bg-card/20 hover:border-gold/30 transition-all duration-300 group"
                >
                  <span className="text-gold font-heading text-xl group-hover:text-gold/80 transition-colors">
                    Pater Brown in {city.name}
                  </span>
                  <p className="text-foreground/40 text-sm mt-2">Live-Hörspiel in {city.name} erleben</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {config.faq.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6 md:px-12">
            <FAQSection
              items={config.faq}
              label="FAQ"
              title={`Häufige Fragen – ${config.cityName}`}
            />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-card/20">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <CTASection />
        </div>
      </section>
    </LandingLayout>
  );
};

export default CityLandingPage;
