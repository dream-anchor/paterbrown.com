import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";
import paterbrown from "@/assets/pater-brown-logo.png";
import heroBackground from "@/assets/hero-background.jpg";

const Impressum = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Impressum"
        description="Impressum und rechtliche Informationen zu Pater Brown Live-Hörspiel. Dream & Anchor Handelsgesellschaft mbH."
        robots="index, follow"
        canonical="/impressum"
      />
      <div 
        className="relative bg-cover bg-top bg-no-repeat min-h-[300px]"
        style={{ 
          backgroundImage: `url(${heroBackground})`,
          backgroundPositionY: '-200px'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        
        <div className="relative container mx-auto px-6 py-4">
          <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
            <img 
              src={paterbrown} 
              alt="Pater Brown Logo" 
              className="h-[84px] w-auto"
            />
          </Link>
        </div>
      </div>

      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="premium-card p-8 md:p-12 space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
              <p className="text-gold uppercase tracking-[0.3em] text-sm font-light">
                Rechtliches
              </p>
              <h1 className="text-6xl md:text-8xl font-heading tracking-wider text-gold mb-12 uppercase">
                Impressum
              </h1>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gold to-transparent h-[1px]" />

            {/* Firmeninfo */}
            <div className="space-y-6">
              <p className="text-foreground/90 text-lg">
                Dream &amp; Anchor Handelsgesellschaft mbH<br/>
                Nördliche Münchner Straße 27a<br/>
                82031 Grünwald
              </p>
            </div>

            {/* Kontakt */}
            <div className="space-y-4">
              <h2 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                Kontakt
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                Telefon: +49 89 909015 3943<br/>
                E-Mail: <a href="mailto:hello@dream-anchor.com" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">hello@dream-anchor.com</a>
              </p>
            </div>

            {/* Geschäftsführer */}
            <div className="space-y-4">
              <h2 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                Vertretungsberechtigter Geschäftsführer
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                Antoine Monot (Geschäftsführer Gesellschafter)
              </p>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gold/30 to-transparent h-[1px]" />

            {/* Rechtliches */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Registereintrag
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  Registergericht: Amtsgericht München<br/>
                  Registernummer: 241987
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Umsatzsteuer-Identifikationsnummer
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE320291075
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  EU-Streitschlichtung
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  Die EU-Kommission hat eine Internetplattform zur Online-Beilegung von Streitigkeiten (OS-Plattform) zwischen Unternehmern und Verbrauchern eingerichtet. Die OS-Plattform ist erreichbar unter{' '}
                  <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                    https://ec.europa.eu/consumers/odr/
                  </a>.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Verbraucherstreitbeilegung/Universalschlichtungsstelle
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  Wir sind nicht bereit und nicht verpflichtet, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gold/30 to-transparent h-[1px]" />

            {/* Social Media */}
            <div className="space-y-4">
              <h2 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                Dieses Impressum gilt auch für folgende Social-Media-Profile
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                Instagram:{' '}
                <a href="https://www.instagram.com/paterbrown.live" target="_blank" rel="noreferrer" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  https://www.instagram.com/paterbrown.live
                </a>
              </p>
            </div>

            {/* Credits */}
            <div className="space-y-4">
              <h2 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                Quellenangaben für verwendete Bilder
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                Gio Löwe (Fotos Wanja Mues, Antoine Monot) –{' '}
                <a href="https://www.gio-lowe.com/photo/index.html" target="_blank" rel="noreferrer" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  https://www.gio-lowe.com/photo/index.html
                </a>
                <br />
                Andreas Achmann (Foto Stefanie Sick) –{' '}
                <a href="https://andreas-achmann.com/" target="_blank" rel="noreferrer" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  https://andreas-achmann.com/
                </a>
                <br />
                Gregor Weidemüller (Foto Marvelin)
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Impressum;
