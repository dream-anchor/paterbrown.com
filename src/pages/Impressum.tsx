import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import paterbrown from "@/assets/pater-brown-logo.png";
import heroBackground from "@/assets/hero-background.jpg";

const Impressum = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div 
        className="relative bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
        
        <div className="relative container mx-auto px-6 py-12">
          <Link to="/" className="inline-block mb-8 hover:opacity-80 transition-opacity">
            <img 
              src={paterbrown} 
              alt="Pater Brown Logo" 
              className="h-16 w-auto"
            />
          </Link>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-6 py-24 max-w-4xl">
        <article className="prose prose-invert prose-headings:text-gold prose-h1:text-4xl prose-h1:mb-8 prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-4 prose-p:text-foreground/80 prose-a:text-gold prose-a:no-underline hover:prose-a:text-gold/80 max-w-none">
          <h1>Impressum</h1>
          <p>
            Dream &amp; Anchor Handelsgesellschaft mbH 
          </p>
          
          <h4>Kontakt</h4>
          <p>
            Telefon: +49 89 909015 3943<br/>
            E-Mail: <a href="mailto:hello@dream-anchor.com">hello@dream-anchor.com</a>
          </p>
          
          <h4>Vertretungsberechtigter Geschäftsführer</h4>
          <p>
            Antoine Monot (Geschäftsführer Gesellschafter)<br/>
          </p>
          
          <h4>Registereintrag</h4>
          <p>
            Registergericht: Amtsgericht München<br/>
            Registernummer: 241987
          </p>
          
          <h4>Umsatzsteuer-Identifikationsnummer</h4>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE320291075</p>
          
          <h4>EU-Streitschlichtung</h4>
          <p>Die EU-Kommission hat eine Internetplattform zur Online-Beilegung von Streitigkeiten (OS-Plattform) zwischen Unternehmern und Verbrauchern eingerichtet. Die OS-Plattform ist erreichbar unter <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer">https://ec.europa.eu/consumers/odr/</a>.</p>
          
          <h4>Verbraucherstreitbeilegung/Universalschlichtungsstelle</h4>
          <p>
            Wir sind nicht bereit und nicht verpflichtet, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
          
          <h4>Dieses Impressum gilt auch für folgende Social-Media-Profile</h4>
          <p>
            Instagram: <a href="https://www.instagram.com/paterbrown.live" target="_blank">https://www.instagram.com/paterbrown.live</a>
          </p>
          
          <h4>Quellenangaben für verwendete Bilder und Grafiken</h4>
          <p>
            Gio Löwe – <a href="https://www.gio-lowe.com/photo/index.html" target="_blank">https://www.gio-lowe.com/photo/index.html</a>
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Impressum;
