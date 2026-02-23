import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import Section from "@/components/ui/Section";
import GhostButton from "@/components/ui/GhostButton";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const NewsletterThankYou = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Newsletter best\u00E4tigt"
        description="Vielen Dank! Ihre Newsletter-Anmeldung wurde erfolgreich best\u00E4tigt."
        robots="noindex, nofollow"
        canonical="/danke-newsletter"
        ogTitle="Newsletter best\u00E4tigt | Pater Brown Live-H\u00F6rspiel"
        ogDescription="Vielen Dank! Ihre Newsletter-Anmeldung wurde erfolgreich best\u00E4tigt."
      />
      <Navigation />

      <main className="flex-1 pt-32 pb-16">
        <Section container="narrow">
          <div className="text-center">
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
              Newsletter
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
              Vielen Dank!
            </h1>
            <div className="divider-gold mb-12 max-w-[120px] mx-auto" aria-hidden="true" />

            <p className="text-xl font-serif text-primary leading-relaxed max-w-2xl mx-auto mb-12">
              Du erh{"\u00E4"}ltst ab sofort alle News und Updates direkt in dein Postfach.
            </p>

            <GhostButton
              href={EVENTIM_AFFILIATE_URL}
              aria-label="Tickets f\u00FCr Pater Brown Live-H\u00F6rspiel bei Eventim kaufen"
            >
              Tickets sichern
            </GhostButton>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default NewsletterThankYou;
