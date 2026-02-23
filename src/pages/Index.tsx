import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, CalendarDays } from "lucide-react";
import { z } from "zod";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CTABlock from "@/components/shared/CTABlock";
import Section from "@/components/ui/Section";
import SerifText from "@/components/ui/SerifText";
import Quote from "@/components/ui/Quote";
import GhostButton from "@/components/ui/GhostButton";
import ResponsiveImage from "@/components/landing/ResponsiveImage";
import { SEO } from "@/components/SEO";
import { getSEOTourYear } from "@/lib/dateUtils";

import heroBackground from "@/assets/hero-background-modern.jpg";
import logoImage from "@/assets/pater-brown-logo.png";

/* ─── Daten ────────────────────────────────────────────── */

const CAST = [
  {
    name: "Antoine Monot",
    role: "Pater Brown",
    image: "/images/portraits/antoine-monot-portrait-pater-brown-gl",
    href: "/antoine-monot",
  },
  {
    name: "Wanja Mues",
    role: "Flambeau",
    image: "/images/portraits/wanja-mues-portrait-pater-brown-gl",
    href: "/wanja-mues",
  },
  {
    name: "Marvelin",
    role: "Beatboxer & Sound Designer",
    image: "/images/buehne/pater-brown-buehne-ensemble-marvelin-af",
    href: "/marvelin",
  },
];

const QUOTES = [
  {
    text: "Ein Abend voller Spannung, Humor und Gänsehaut.",
    citation: "Das sagen unsere Besucher",
  },
  {
    text: "Ein tolles Konzept mit erstklassigen Sprechern, die die Figuren zum Leben erweckten.",
    citation: "@majokeli2024, Instagram",
  },
  {
    text: "War ein mega Abend. Muss man sich unbedingt anschauen.",
    citation: "@wieczorek3309, Instagram",
  },
];

const CITY_SLUGS: Record<string, string> = {
  "München": "/muenchen",
  "Hamburg": "/hamburg",
  "Köln": "/koeln",
  "Berlin": "/berlin",
  "Bremen": "/bremen",
  "Leipzig": "/leipzig",
  "Stuttgart": "/stuttgart",
  "Zürich": "/zuerich",
};

const newsletterSchema = z.object({
  email: z.string().trim().email({ message: "Bitte gültige E-Mail-Adresse eingeben" }).max(255),
  name: z.string().trim().max(100).regex(/^[a-zA-ZäöüÄÖÜß\s-]*$/).optional(),
});

/* ─── Seite ────────────────────────────────────────────── */

const Index = () => {
  const { data: tourEvents = [] } = useQuery({
    queryKey: ["seo-tour-year"],
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const { data } = await supabase
        .from("tour_events")
        .select("event_date")
        .eq("is_active", true)
        .gte("event_date", new Date().toISOString().split("T")[0]);
      return data || [];
    },
  });

  const { data: nextEvents = [] } = useQuery({
    queryKey: ["home-next-events"],
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

  const seoYear = getSEOTourYear(tourEvents);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        title={`Pater Brown Live-Hörspiel | Tickets & Termine ${seoYear}`}
        description="Erleben Sie Pater Brown live auf der Bühne mit Wanja Mues und Antoine Monot. Ein einzigartiges Live-Hörspiel-Erlebnis mit Beatboxer Marvelin."
        keywords="Pater Brown, Live-Hörspiel, Wanja Mues, Antoine Monot, Marvelin, Theater, Krimi, G.K. Chesterton"
        canonical="/"
        ogTitle={`Pater Brown \u2013 Das Live-Hörspiel`}
        ogDescription="Mit Wanja Mues und Antoine Monot. Jetzt Tickets sichern!"
        ogImage="/images/og/pater-brown-live-hoerspiel-tour-og.webp"
      />

      <Navigation />

      {/* ─── HERO ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ minHeight: "100dvh" }}>
        {/* Hintergrundbild */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackground})` }}
          role="img"
          aria-label="Atmosphärische Bühnenbeleuchtung für Pater Brown Live-Hörspiel"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-transparent" />

        {/* Content am unteren Rand (flex justify-end) */}
        <div className="relative z-10 flex-1 flex flex-col justify-end pb-16 md:pb-24">
          <div className="w-[88%] max-w-[1400px] mx-auto">
            <p
              className="text-primary/60 text-xs md:text-sm uppercase tracking-[0.4em] mb-4 font-heading cinematic-enter"
              style={{ animationDelay: "0.1s" }}
            >
              Das Live-Hörspiel
            </p>
            <h1
              className="text-5xl sm:text-7xl md:text-[8rem] lg:text-[11rem] font-heading text-foreground leading-[0.85] cinematic-enter"
              style={{ animationDelay: "0.2s" }}
            >
              Pater
              <br />
              Brown
            </h1>
            <p
              className="font-serif text-xl md:text-2xl tracking-[0.05em] leading-[1.3] normal-case text-foreground/60 mt-6 max-w-lg cinematic-enter"
              style={{ animationDelay: "0.4s" }}
            >
              Mit Antoine Monot &amp; Wanja Mues.
              <br className="hidden sm:block" />
              Krimi. Live. Unvergesslich.
            </p>

            <div
              className="mt-10 flex flex-wrap items-center gap-6 cinematic-enter"
              style={{ animationDelay: "0.6s" }}
            >
              <GhostButton to="/termine" size="lg">
                Termine &amp; Tickets
              </GhostButton>
              <Link
                to="/live-hoerspiel"
                className="text-foreground/40 hover:text-foreground text-xs font-heading uppercase tracking-[0.15em] transition-colors"
              >
                Mehr zur Show &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll-Hinweis */}
        <div className="relative z-10 flex justify-center pb-8 cinematic-enter" style={{ animationDelay: "0.8s" }}>
          <ChevronDown className="w-5 h-5 text-foreground/20 animate-bounce" aria-hidden="true" />
        </div>
      </section>

      <main id="main-content">
        {/* ─── SHOW-TEASER ──────────────────────────────── */}
        <Section container="wide" className="py-20 md:py-32">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
                Die Geschichte dahinter
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground mb-6">
                Kult trifft Innovation
              </h2>
              <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
              <SerifText size="lg" className="text-foreground/70 mb-4">
                Die modernen Adaptionen der G. K. Chesterton-Vorlagen bewahren deren
                literarischen Reiz und verleihen ihnen zugleich eine frische, zeitgemäße Form.
              </SerifText>
              <SerifText className="text-foreground/50 mb-8">
                Zwei Schauspieler, ein Beatboxer, kein Bühnenbild &ndash; und trotzdem sehen
                Sie alles vor sich. Das ist die Magie des Live-Hörspiels.
              </SerifText>
              <Link
                to="/pater-brown"
                className="text-primary text-xs font-heading uppercase tracking-[0.15em] hover:text-foreground transition-colors"
              >
                Mehr über Pater Brown &rarr;
              </Link>
            </div>
            <div className="card-glow rounded-[3px] overflow-hidden">
              <ResponsiveImage
                basePath="/images/buehne/pater-brown-dialog-szene-monot-mues-af"
                alt="Antoine Monot und Wanja Mues in einer Dialog-Szene auf der Bühne"
                width={1800}
                height={1200}
                sizes="(max-width: 768px) 88vw, 40vw"
                className="aspect-[4/3] object-cover"
              />
            </div>
          </div>
        </Section>

        {/* ─── CAST-KACHELN ─────────────────────────────── */}
        <Section container="wide" className="py-16 md:py-28">
          <div className="text-center mb-12">
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
              Das Ensemble
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground">
              Die Darsteller
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 lg:gap-10">
            {CAST.map((member) => (
              <Link
                key={member.name}
                to={member.href}
                className="group relative block card-glow rounded-[3px] overflow-hidden"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <ResponsiveImage
                    basePath={member.image}
                    alt={`${member.name} \u2013 ${member.role}`}
                    width={900}
                    height={1200}
                    sizes="(max-width: 640px) 88vw, 30vw"
                    className="object-cover h-full transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl md:text-2xl font-heading text-primary">
                    {member.name}
                  </h3>
                  <p className="font-serif text-foreground/60 text-sm tracking-[0.05em] normal-case">
                    {member.role}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        {/* ─── PRESSESTIMMEN ────────────────────────────── */}
        <Section container="narrow" className="py-20 md:py-32">
          <div className="text-center mb-12">
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
              Stimmen
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground">
              Was Besucher sagen
            </h2>
          </div>

          <div className="space-y-16">
            {QUOTES.map((q, i) => (
              <div
                key={i}
                className="cinematic-enter"
                style={{ animationDelay: `${i * 250}ms` }}
              >
                <Quote text={q.text} citation={q.citation} />
                {i < QUOTES.length - 1 && (
                  <div className="divider-gold mt-12" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* ─── NÄCHSTE TERMINE ──────────────────────────── */}
        <Section container="wide" className="py-16 md:py-28">
          <div className="text-center mb-12">
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
              Auf Tour
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading text-foreground">
              Nächste Termine
            </h2>
          </div>

          {nextEvents.length > 0 && (
            <div className="max-w-3xl mx-auto space-y-3 mb-12">
              {nextEvents.map((event) => {
                const citySlug = CITY_SLUGS[event.city];
                return (
                  <div
                    key={event.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 border border-border/50 rounded-[3px] transition-all hover:border-primary/30 bg-card/30"
                  >
                    <div className="flex items-center gap-4">
                      <CalendarDays className="w-4 h-4 text-primary/50 shrink-0" aria-hidden="true" />
                      <div>
                        <span className="text-foreground font-heading text-base">{event.date}</span>
                        <span className="text-foreground/30 text-xs ml-2">{event.day}</span>
                        <p className="text-foreground/50 text-sm font-serif normal-case">
                          {citySlug ? (
                            <Link to={citySlug} className="hover:text-primary transition-colors">
                              {event.city}
                            </Link>
                          ) : (
                            event.city
                          )}
                          {" \u00b7 "}
                          {event.venue}
                        </p>
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
                );
              })}
            </div>
          )}

          <div className="text-center">
            <GhostButton to="/termine">Alle Termine</GhostButton>
          </div>
        </Section>

        {/* ─── NEWSLETTER ──────────────────────────────── */}
        <NewsletterInline />
      </main>

      <CTABlock />
      <Footer />
    </div>
  );
};

/* ─── Newsletter (inline, Brevo-Integration) ──────────── */

const NewsletterInline = () => {
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setValidationError("");
    const formData = new FormData(e.currentTarget);
    const result = newsletterSchema.safeParse({
      email: formData.get("EMAIL") as string,
      name: (formData.get("FULLNAME") as string) || undefined,
    });
    if (!result.success) {
      e.preventDefault();
      setValidationError(result.error.issues[0].message);
    }
  };

  return (
    <Section container="narrow" id="newsletter" className="py-20 md:py-32">
      <div className="text-center mb-10">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
          Newsletter
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground">
          Verpasse keine neuen Termine
        </h2>
        <SerifText className="text-foreground/50 mt-4 max-w-lg mx-auto">
          Trage dich ein und erhalte Updates zu neuen Shows, exklusive Einblicke und Behind-the-Scenes.
        </SerifText>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="max-w-md mx-auto mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-[3px]" role="alert" aria-live="polite">
          <p className="text-sm text-destructive">{validationError}</p>
        </div>
      )}

      {/* Brevo Error */}
      <div id="error-message" className="sib-form-message-panel hidden max-w-md mx-auto mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-[3px]" role="alert" aria-live="polite">
        <p className="text-sm text-destructive">Deine Anmeldung konnte nicht gespeichert werden. Bitte versuche es erneut.</p>
      </div>

      {/* Brevo Success */}
      <div id="success-message" className="sib-form-message-panel hidden max-w-md mx-auto mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-[3px]" role="alert" aria-live="polite">
        <p className="text-sm text-green-500">Deine Anmeldung war erfolgreich.</p>
      </div>

      <form
        method="POST"
        action="https://cf890442.sibforms.com/serve/MUIFAKTFM5ftDcjl36_R-0XNz_CSkr1PkKZNd9YnbE94F0mFmNvrQIaf4EXUr3IIV6yqH-KhSn6ulGWuj4VHTdC2NSGKsFLB0taZdyiFDl--e0IocY12JACdrvSmELOqYGZ_ThPKerjpMa3yXXIpb7nKnLjbmfyh0oe4T8q7_YZwcThoMRwHHn-PGQoHWNJCjra5HoFkWlazNJKy"
        target="_self"
        className="max-w-md mx-auto space-y-4"
        onSubmit={handleSubmit}
      >
        {/* Name */}
        <div>
          <label htmlFor="FULLNAME" className="sr-only">Dein Name</label>
          <input
            className="w-full px-6 py-4 bg-transparent border border-primary/30 rounded-[3px] text-foreground font-sans placeholder:text-muted-foreground/60 placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-xs focus:outline-none focus:border-primary glow-warm transition-all"
            maxLength={200}
            type="text"
            id="FULLNAME"
            name="FULLNAME"
            autoComplete="name"
            placeholder="Dein Name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="EMAIL" className="sr-only">Deine E-Mail Adresse</label>
          <input
            className="w-full px-6 py-4 bg-transparent border border-primary/30 rounded-[3px] text-foreground font-sans placeholder:text-muted-foreground/60 placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-xs focus:outline-none focus:border-primary glow-warm transition-all"
            type="email"
            id="EMAIL"
            name="EMAIL"
            autoComplete="email"
            placeholder="Deine E-Mail Adresse"
            required
            aria-required="true"
          />
        </div>

        {/* GDPR */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 rounded-[2px] border border-primary/30 bg-transparent checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer appearance-none relative after:content-['\2713'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-background after:text-xs after:font-bold after:opacity-0 checked:after:opacity-100"
              value="1"
              id="OPT_IN"
              name="OPT_IN"
              required
            />
            <span className="text-sm text-foreground/50 leading-relaxed normal-case">
              Ich möchte den Newsletter erhalten und akzeptiere die{" "}
              <a href="/datenschutz" className="text-primary/70 hover:text-primary underline transition-colors">
                Datenschutzerklärung
              </a>.
            </span>
          </label>
        </div>

        {/* Brevo Declaration */}
        <p className="text-[10px] text-foreground/30 leading-relaxed text-center pt-2 normal-case">
          Wir verwenden{" "}
          <a href="https://www.brevo.com/de/legal/privacypolicy/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/50 transition-colors">
            Brevo
          </a>{" "}
          als Marketing-Plattform.
        </p>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 bg-primary text-primary-foreground font-heading uppercase tracking-[0.15em] text-sm rounded-[3px] hover:bg-primary/90 transition-colors"
          >
            Anmelden
          </button>
        </div>

        {/* Hidden Fields */}
        <input type="text" name="email_address_check" value="" className="hidden" />
        <input type="hidden" name="locale" value="de" />
      </form>
    </Section>
  );
};

export default Index;
