import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import LandingLayout from "./LandingLayout";
import FAQSection from "./FAQSection";
import ResponsiveImage from "./ResponsiveImage";
import Section from "@/components/ui/Section";
import SerifText from "@/components/ui/SerifText";
import GhostButton from "@/components/ui/GhostButton";
import Quote from "@/components/ui/Quote";
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
        name: `Pater Brown \u2013 Das Live-H\u00F6rspiel \u2013 ${config.cityName}`,
        description: `Live-H\u00F6rspiel mit Antoine Monot, Wanja Mues & Marvelin in ${config.cityName}, ${config.venue.name}`,
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
    { icon: Hotel, title: "\u00DCbernachten", items: config.tips.hotels },
    { icon: Landmark, title: "Sehensw\u00FCrdigkeiten", items: config.tips.sights },
  ].filter(s => s.items.length > 0);

  return (
    <LandingLayout
      breadcrumbs={[
        { label: "Termine", href: "/termine" },
        { label: config.cityName },
      ]}
      heroTitle={config.cityName}
      heroSubtitle="Das Live-H\u00F6rspiel"
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

      {/* ─── Event Details ─── */}
      {nextEvent ? (
        <Section container="wide" className="py-16 md:py-24">
          <div className="card-glow rounded-[3px] p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-5">
                <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading">
                  N\u00E4chster Termin
                </p>
                <div className="flex items-center gap-4">
                  <CalendarDays className="w-5 h-5 text-primary/50 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-foreground font-heading text-3xl md:text-4xl">{nextEvent.date}</span>
                    <span className="text-foreground/30 text-sm ml-3">{nextEvent.day}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="w-5 h-5 text-primary/50 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-foreground font-heading text-lg">{config.venue.name}</p>
                    <p className="text-foreground/40 text-sm font-serif normal-case tracking-[0.05em]">{config.venue.address}</p>
                  </div>
                </div>
              </div>
              {nextEvent.ticketUrl && (
                <GhostButton href={nextEvent.ticketUrl} size="lg">
                  Tickets sichern
                </GhostButton>
              )}
            </div>
          </div>
        </Section>
      ) : config.noCurrentEvent ? (
        <Section container="narrow" className="py-16 md:py-24">
          <div className="text-center space-y-6">
            <SerifText size="xl" className="text-foreground/50">
              {config.comingSoonText || `Aktuell sind keine Termine in ${config.cityName} geplant.`}
            </SerifText>
            <GhostButton to="/termine" size="sm">
              Alle Termine
            </GhostButton>
          </div>
        </Section>
      ) : null}

      {/* ─── Die Show ─── */}
      <Section container="narrow" className="py-16 md:py-24">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
          Die Show
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground mb-4">
          Krimi, Klang & G\u00E4nsehaut
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />

        <div className="space-y-4">
          <SerifText size="lg" className="text-foreground/70">
            <strong className="text-foreground">PATER BROWN \u2013 Das Live-H\u00F6rspiel</strong>{" "}
            kommt nach {config.cityName}. Erleben Sie die einzigartige Kombination aus Theater,
            H\u00F6rspiel und Beatbox-Sounddesign live auf der B\u00FChne.
          </SerifText>
          <SerifText size="lg" className="text-foreground/70">
            <Link to="/antoine-monot" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">Antoine Monot</Link>{" "}
            schl\u00FCpft in die Rolle des scharfsinnigen Pater Brown.{" "}
            <Link to="/wanja-mues" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">Wanja Mues</Link>{" "}
            gibt den charmanten Meisterdieb Flambeau, und{" "}
            <Link to="/marvelin" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">Marvelin</Link>{" "}
            erzeugt live alle Ger\u00E4usche \u2013 ausschlie\u00DFlich mit dem Mund.
          </SerifText>
          <p className="text-foreground/40 font-heading text-sm uppercase tracking-[0.15em]">
            2 Krimis \u00B7 ca. 2 Stunden \u00B7 ab{" "}
            {config.addressCountry === "CH" ? "CHF 45" : "34,90 \u20AC"}
          </p>
        </div>

        <div className="mt-8">
          <Link
            to="/live-hoerspiel"
            className="text-primary text-xs font-heading uppercase tracking-[0.15em] hover:text-foreground transition-colors"
          >
            Mehr zur Show &rarr;
          </Link>
        </div>
      </Section>

      {/* ─── B\u00FChnenfoto \u2013 Full Bleed ─── */}
      <div className="w-full overflow-hidden">
        <ResponsiveImage
          basePath="/images/buehne/pater-brown-atmosphaere-silhouette-nebel-af"
          alt={`Stimmungsvolle Silhouette beim Pater Brown Live-H\u00F6rspiel in ${config.cityName}`}
          width={2000}
          height={2666}
          sizes="100vw"
          priority
          className="w-full aspect-[21/9] object-cover object-center"
          credit="Alexander Frank"
        />
      </div>

      {/* ─── Gro\u00DFes Zitat ─── */}
      <Section container="narrow" className="py-20 md:py-32">
        <div className="text-center">
          <Quote
            text="Zwei Schauspieler. Alle Stimmen. Jeder verd\u00E4chtig."
            citation="Das Live-H\u00F6rspiel"
          />
        </div>
      </Section>

      {/* ─── Veranstaltungsort ─── */}
      <Section container="wide" className="py-16 md:py-24">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
          Veranstaltungsort
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground mb-4">
          {config.venue.name}
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />

        <SerifText size="lg" className="text-foreground/60 mb-12 max-w-3xl">
          {config.venue.description}
        </SerifText>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-6 card-glow rounded-[3px] space-y-3">
            <MapPin className="w-5 h-5 text-primary/40" aria-hidden="true" />
            <p className="text-primary text-[10px] uppercase tracking-[0.2em] font-heading">Adresse</p>
            <p className="text-foreground/70 text-sm font-serif normal-case tracking-[0.05em]">{config.venue.address}</p>
          </div>
          {config.venue.oepnv && (
            <div className="p-6 card-glow rounded-[3px] space-y-3">
              <Train className="w-5 h-5 text-primary/40" aria-hidden="true" />
              <p className="text-primary text-[10px] uppercase tracking-[0.2em] font-heading">\u00D6PNV</p>
              <p className="text-foreground/70 text-sm font-serif normal-case tracking-[0.05em]">{config.venue.oepnv}</p>
            </div>
          )}
          {config.venue.parking && (
            <div className="p-6 card-glow rounded-[3px] space-y-3">
              <Car className="w-5 h-5 text-primary/40" aria-hidden="true" />
              <p className="text-primary text-[10px] uppercase tracking-[0.2em] font-heading">Parken</p>
              <p className="text-foreground/70 text-sm font-serif normal-case tracking-[0.05em]">{config.venue.parking}</p>
            </div>
          )}
        </div>
      </Section>

      {/* ─── Stadt-Tipps ─── */}
      {tipSections.length > 0 && (
        <Section container="wide" className="py-16 md:py-24">
          <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
            {config.cityName} entdecken
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground mb-4">
            Rund um den Abend
          </h2>
          <div className="divider-gold mb-10 max-w-xs" aria-hidden="true" />

          <div className="grid md:grid-cols-3 gap-4">
            {tipSections.map(({ icon: Icon, title, items }) => (
              <div key={title} className="p-6 card-glow rounded-[3px]">
                <Icon className="w-5 h-5 text-primary/40 mb-4" aria-hidden="true" />
                <h3 className="text-primary text-[11px] uppercase tracking-[0.2em] font-heading mb-6">{title}</h3>
                <ul className="space-y-3">
                  {items.map((tip, i) => (
                    <li key={i} className="text-foreground/60 text-sm font-serif normal-case tracking-[0.05em] leading-relaxed pl-3 border-l border-primary/20">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ─── Mehr erfahren ─── */}
      <Section container="narrow" className="py-16 md:py-24">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
          Mehr erfahren
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground mb-4">
          G.K. Chesterton neu erz\u00E4hlt
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />

        <div className="space-y-4">
          <SerifText size="lg" className="text-foreground/70">
            <strong className="text-foreground">PATER BROWN \u2013 Das Live-H\u00F6rspiel</strong>{" "}
            basiert auf den zeitlosen Kriminalgeschichten von{" "}
            <Link to="/g-k-chesterton" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">G.K. Chesterton</Link>.
            Die Figur des{" "}
            <Link to="/pater-brown" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">Pater Brown</Link>{" "}
            \u2013 ein unscheinbarer Priester, der mit Einf\u00FChlungsverm\u00F6gen Kriminalf\u00E4lle l\u00F6st \u2013 fasziniert seit \u00FCber 100 Jahren.
          </SerifText>
          <Link
            to="/live-hoerspiel"
            className="text-primary text-xs font-heading uppercase tracking-[0.15em] hover:text-foreground transition-colors inline-block"
          >
            Was ist ein Live-H\u00F6rspiel? &rarr;
          </Link>
        </div>
      </Section>

      {/* ─── Nearby Cities ─── */}
      {config.nearbyCities && config.nearbyCities.length > 0 && (
        <Section container="wide" className="py-16 md:py-24">
          <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-8">
            Auch in der N\u00E4he
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {config.nearbyCities.map((city) => (
              <Link
                key={city.slug}
                to={`/${city.slug}`}
                className="p-8 card-glow rounded-[3px] group transition-all"
              >
                <span className="text-3xl md:text-4xl font-heading text-foreground group-hover:text-primary transition-colors">
                  {city.name}
                </span>
                <p className="text-foreground/40 text-sm font-serif normal-case tracking-[0.05em] mt-2">
                  Pater Brown Live &rarr;
                </p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* ─── FAQ ─── */}
      {config.faq.length > 0 && (
        <Section container="narrow" className="py-16 md:py-24">
          <FAQSection items={config.faq} label="FAQ" title="H\u00E4ufige Fragen" />
        </Section>
      )}
    </LandingLayout>
  );
};

export default CityLandingPage;
