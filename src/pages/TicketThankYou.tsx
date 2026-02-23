import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import Section from "@/components/ui/Section";
import GhostButton from "@/components/ui/GhostButton";

const TicketThankYou = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Buchung erfolgreich"
        description="Vielen Dank f\u00FCr Ihren Ticketkauf. Wir freuen uns auf Sie!"
        robots="noindex, nofollow"
        canonical="/danke-ticket"
        ogTitle="Buchung erfolgreich | Pater Brown Live-H\u00F6rspiel"
        ogDescription="Vielen Dank f\u00FCr Ihren Ticketkauf. Wir freuen uns auf Sie!"
      />
      <Navigation />

      <main className="flex-1 pt-32 pb-16">
        <Section container="narrow">
          <div className="text-center">
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
              Buchung
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
              Vielen Dank!
            </h1>
            <div className="divider-gold mb-12 max-w-[120px] mx-auto" aria-hidden="true" />

            <div className="space-y-6 max-w-2xl mx-auto font-serif text-foreground/70 leading-relaxed tracking-[0.03em]">
              <p className="text-xl text-primary">
                Ihre Buchung war erfolgreich.
              </p>
              <p className="text-lg">
                Wir freuen uns darauf, Sie beim Pater Brown Live-H{"\u00F6"}rspiel begr{"\u00FC"}{"\u00DF"}en
                zu d{"\u00FC"}rfen. Sie erhalten in K{"\u00FC"}rze eine Best{"\u00E4"}tigung per E-Mail.
              </p>
              <p className="text-base text-foreground/50">
                Bereiten Sie sich auf einen unvergesslichen Abend voller Spannung
                und R{"\u00E4"}tsell{"\u00F6"}sung vor!
              </p>
            </div>

            <div className="mt-12">
              <GhostButton to="/">
                Zur{"\u00FC"}ck zur Startseite
              </GhostButton>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default TicketThankYou;
