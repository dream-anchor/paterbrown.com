import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

const TicketThankYou = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Buchung erfolgreich"
        description="Vielen Dank für Ihren Ticketkauf. Wir freuen uns auf Sie!"
        robots="noindex, nofollow"
        canonical="/danke-ticket"
        ogTitle="Buchung erfolgreich | Pater Brown Live-Hörspiel"
        ogDescription="Vielen Dank für Ihren Ticketkauf. Wir freuen uns auf Sie!"
      />
      <Navigation />

      <main className="flex-1 pt-32 pb-16">
        <section className="py-28 md:py-36 px-6">
          <div className="container mx-auto max-w-3xl text-center">
            <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">
              Buchung
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
              Vielen Dank!
            </h1>
            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mx-auto mb-12" aria-hidden="true" />

            <div className="space-y-6 max-w-2xl mx-auto text-foreground/70 leading-relaxed">
              <p className="text-xl text-gold">
                Ihre Buchung war erfolgreich.
              </p>
              <p className="text-lg font-light">
                Wir freuen uns darauf, Sie beim Pater Brown Live-Hörspiel begrüßen
                zu dürfen. Sie erhalten in Kürze eine Bestätigung per E-Mail.
              </p>
              <p className="text-base text-foreground/50 font-light">
                Bereiten Sie sich auf einen unvergesslichen Abend voller Spannung
                und Rätsellösung vor!
              </p>
            </div>

            <div className="mt-12">
              <Link to="/" className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block">
                Zurück zur Startseite
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TicketThankYou;
