import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

const Impressum = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Impressum"
        description="Impressum und rechtliche Informationen zu Pater Brown Live-Hörspiel. Dream & Anchor Handelsgesellschaft mbH."
        robots="index, follow"
        canonical="/impressum"
        ogTitle="Impressum | Pater Brown Live-Hörspiel"
        ogDescription="Rechtliche Informationen zu Pater Brown. Dream & Anchor Handelsgesellschaft mbH."
      />
      <Navigation />

      <main className="flex-1 pt-32 pb-16">
        <section className="py-28 md:py-36 px-6">
          <div className="container mx-auto max-w-3xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">
            Rechtliches
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
            Impressum
          </h1>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-12" aria-hidden="true" />

          <div className="space-y-10 text-foreground/70 leading-relaxed">
            <p className="text-lg">
              Dream &amp; Anchor Handelsgesellschaft mbH<br />
              Nördliche Münchner Straße 27a<br />
              82031 Grünwald
            </p>

            <div className="space-y-2">
              <h2 className="text-gold text-xs uppercase tracking-[0.2em] font-heading mb-3">
                Kontakt
              </h2>
              <p>
                Telefon: +49 89 909015 3943<br />
                E-Mail:{" "}
                <a href="mailto:hello@dream-anchor.com" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  hello@dream-anchor.com
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-gold text-xs uppercase tracking-[0.2em] font-heading mb-3">
                Vertretungsberechtigter Geschäftsführer
              </h2>
              <p>Antoine Monot (Geschäftsführer Gesellschafter)</p>
            </div>

            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24" aria-hidden="true" />

            <div className="space-y-2">
              <h2 className="text-gold text-xs uppercase tracking-[0.2em] font-heading mb-3">
                Registereintrag
              </h2>
              <p>
                Registergericht: Amtsgericht München<br />
                Registernummer: 241987
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-gold text-xs uppercase tracking-[0.2em] font-heading mb-3">
                Umsatzsteuer-Identifikationsnummer
              </h2>
              <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE320291075</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-gold text-xs uppercase tracking-[0.2em] font-heading mb-3">
                EU-Streitschlichtung
              </h2>
              <p>
                Die EU-Kommission hat eine Internetplattform zur Online-Beilegung
                von Streitigkeiten (OS-Plattform) zwischen Unternehmern und
                Verbrauchern eingerichtet. Die OS-Plattform ist erreichbar unter{" "}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  https://ec.europa.eu/consumers/odr/
                </a>
                .
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-gold text-xs uppercase tracking-[0.2em] font-heading mb-3">
                Verbraucherstreitbeilegung
              </h2>
              <p>
                Wir sind nicht bereit und nicht verpflichtet, an einem
                Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
                teilzunehmen.
              </p>
            </div>

            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24" aria-hidden="true" />

            <div className="space-y-2">
              <h2 className="text-gold text-xs uppercase tracking-[0.2em] font-heading mb-3">
                Social-Media-Profile
              </h2>
              <p>
                Dieses Impressum gilt auch für:{" "}
                <a href="https://www.instagram.com/paterbrown.live" target="_blank" rel="noreferrer" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  instagram.com/paterbrown.live
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-gold text-xs uppercase tracking-[0.2em] font-heading mb-3">
                Quellenangaben Bilder
              </h2>
              <p>
                Gio Löwe (Fotos Wanja Mues, Antoine Monot) –{" "}
                <a href="https://www.gio-lowe.com/photo/index.html" target="_blank" rel="noreferrer" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  gio-lowe.com
                </a>
                <br />
                Andreas Achmann (Foto Stefanie Sick) –{" "}
                <a href="https://andreas-achmann.com/" target="_blank" rel="noreferrer" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  andreas-achmann.com
                </a>
                <br />
                Gregor Weidemüller (Foto Marvelin)
                <br />
                Alexander Frank (Bühnenfotos)
                <br />
                Dunja Dietrich (Bühnenfotos)
              </p>
            </div>

            <div className="pt-4">
              <Link
                to="/"
                className="text-gold text-xs font-heading uppercase tracking-[0.15em] hover:text-foreground transition-colors"
              >
                Zurück zur Startseite &rarr;
              </Link>
            </div>
          </div>
        </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Impressum;
