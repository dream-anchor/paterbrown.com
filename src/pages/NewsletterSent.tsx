import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Mail } from "lucide-react";

const NewsletterSent = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="E-Mail bestätigen"
        description="Bitte bestätigen Sie Ihre Newsletter-Anmeldung per E-Mail."
        robots="noindex, nofollow"
        canonical="/newsletter-gesendet"
        ogTitle="E-Mail bestätigen | Pater Brown Live-Hörspiel"
        ogDescription="Bitte bestätigen Sie Ihre Newsletter-Anmeldung per E-Mail."
      />
      <Navigation />

      <main className="flex-1 pt-32 pb-16">
        <section className="py-28 md:py-36 px-6">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gold/10 border border-gold/30 mb-8">
              <Mail className="w-10 h-10 text-gold" />
            </div>

            <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">
              Newsletter
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
              Fast geschafft!
            </h1>
            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mx-auto mb-12" aria-hidden="true" />

            <div className="space-y-6 max-w-2xl mx-auto text-foreground/70 leading-relaxed">
              <p className="text-xl text-gold">
                Wir haben dir eine Bestätigungs-E-Mail gesendet.
              </p>
              <p className="text-lg font-light">
                Bitte überprüfe dein Postfach und klicke auf den Bestätigungslink,
                um deine Anmeldung abzuschließen.
              </p>
              <p className="text-sm text-foreground/50 mt-6">
                Keine E-Mail erhalten? Überprüfe auch deinen Spam-Ordner.
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

export default NewsletterSent;
