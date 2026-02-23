import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import Section from "@/components/ui/Section";
import GhostButton from "@/components/ui/GhostButton";
import { Mail } from "lucide-react";

const NewsletterSent = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="E-Mail best\u00E4tigen"
        description="Bitte best\u00E4tigen Sie Ihre Newsletter-Anmeldung per E-Mail."
        robots="noindex, nofollow"
        canonical="/newsletter-gesendet"
        ogTitle="E-Mail best\u00E4tigen | Pater Brown Live-H\u00F6rspiel"
        ogDescription="Bitte best\u00E4tigen Sie Ihre Newsletter-Anmeldung per E-Mail."
      />
      <Navigation />

      <main className="flex-1 pt-32 pb-16">
        <Section container="narrow">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[3px] bg-primary/10 border border-primary/30 mb-8">
              <Mail className="w-10 h-10 text-primary" />
            </div>

            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
              Newsletter
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
              Fast geschafft!
            </h1>
            <div className="divider-gold mb-12 max-w-[120px] mx-auto" aria-hidden="true" />

            <div className="space-y-6 max-w-2xl mx-auto font-serif text-foreground/70 leading-relaxed tracking-[0.03em]">
              <p className="text-xl text-primary">
                Wir haben dir eine Best{"\u00E4"}tigungs-E-Mail gesendet.
              </p>
              <p className="text-lg">
                Bitte {"\u00FC"}berpr{"\u00FC"}fe dein Postfach und klicke auf den Best{"\u00E4"}tigungslink,
                um deine Anmeldung abzuschlie{"\u00DF"}en.
              </p>
              <p className="text-sm text-foreground/50 mt-6">
                Keine E-Mail erhalten? {"\u00DC"}berpr{"\u00FC"}fe auch deinen Spam-Ordner.
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

export default NewsletterSent;
