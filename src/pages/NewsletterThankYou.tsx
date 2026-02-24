import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const NewsletterThankYou = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Newsletter bestätigt"
        description="Vielen Dank! Ihre Newsletter-Anmeldung wurde erfolgreich bestätigt."
        robots="noindex, nofollow"
        canonical="/danke-newsletter"
        ogTitle="Newsletter bestätigt | Pater Brown Live-Hörspiel"
        ogDescription="Vielen Dank! Ihre Newsletter-Anmeldung wurde erfolgreich bestätigt."
      />
      <Navigation />

      <main className="flex-1 pt-32 pb-16">
        <section className="py-28 md:py-36 px-6">
          <div className="container mx-auto max-w-3xl text-center">
            <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">
              Newsletter
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
              Vielen Dank!
            </h1>
            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mx-auto mb-12" aria-hidden="true" />

            <p className="text-xl text-gold leading-relaxed max-w-2xl mx-auto mb-12">
              Du erhältst ab sofort alle News und Updates direkt in dein Postfach.
            </p>

            <a
              href={EVENTIM_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Tickets für Pater Brown Live-Hörspiel bei Eventim kaufen"
            >
              <button className="btn-premium" type="button">Tickets sichern</button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NewsletterThankYou;
