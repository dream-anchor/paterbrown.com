import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";
import CinematicPortrait from "@/components/CinematicPortrait";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";
import TicketCTA from "@/components/shared/TicketCTA";

const BREADCRUMBS = [
  { label: "Startseite", href: "/" },
  { label: "Pater Brown", href: "/pater-brown" },
  { label: "Father Brown" },
];

const FatherBrown = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Father Brown – Von G.K. Chesterton zum Live-Hörspiel",
    url: "https://paterbrown.com/father-brown",
    image: "https://paterbrown.com/images/historisch/father-brown-wisdom-buchillustration-original-1200.webp",
    author: { "@type": "Organization", name: "paterbrown.com" },
    publisher: { "@type": "Organization", name: "Dream & Anchor Handelsgesellschaft mbH" },
    description: "Father Brown, im Deutschen als Pater Brown bekannt: Die berühmte Figur von G.K. Chesterton jetzt als Live-Hörspiel auf Tour.",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: "https://paterbrown.com" },
      { "@type": "ListItem", position: 2, name: "Pater Brown", item: "https://paterbrown.com/pater-brown" },
      { "@type": "ListItem", position: 3, name: "Father Brown", item: "https://paterbrown.com/father-brown" },
    ],
  };

  return (
    <LandingLayout
      breadcrumbs={BREADCRUMBS}
      heroImage="/images/buehne/dd-dialog-haende-gestik.webp"
      heroTitle="Father Brown"
      heroSubtitle="Von G.K. Chesterton zum Live-Hörspiel"
      heroCTA
    >
      <SEO
        title="Father Brown – Von G.K. Chesterton zum Live-Hörspiel | paterbrown.com"
        description="Father Brown, im Deutschen als Pater Brown bekannt: Die berühmte Figur von G.K. Chesterton jetzt als Live-Hörspiel auf Tour. Alle Infos & Tickets."
        canonical="/father-brown"
        keywords="father brown, father brown 2026, father brown tour, father brown hörspiel, father braun"
        ogImage="/images/og/father-brown-live-hoerspiel-og.webp"
        schema={[articleSchema, breadcrumbSchema]}
      />

      {/* Father Brown = Pater Brown */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Die Figur</p>
            <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
              Father Brown = Pater Brown
            </h2>
            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
            <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
              Father Brown ist die englische Originalbezeichnung der Figur, die im
              deutschsprachigen Raum als{" "}
              <Link to="/pater-brown" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Pater Brown
              </Link>
              {" "}bekannt wurde. Beide Namen bezeichnen dieselbe Figur – den
              unscheinbaren katholischen Priester, der Kriminalfälle löst.
            </p>
            <p className="text-foreground/70 leading-relaxed text-lg font-light">
              Erfunden wurde die Figur von{" "}
              <Link to="/g-k-chesterton" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                G.K. Chesterton
              </Link>
              {" "}(1874–1936), der zwischen 1911 und 1935 insgesamt
              49 Kurzgeschichten mit Father Brown veröffentlichte.
            </p>
          </div>
          <div className="relative overflow-hidden aspect-[4/3]">
            <img
              src="/images/historisch/father-brown-wisdom-buchillustration-original.webp"
              srcSet="/images/historisch/father-brown-wisdom-buchillustration-original-480.webp 480w, /images/historisch/father-brown-wisdom-buchillustration-original-768.webp 768w, /images/historisch/father-brown-wisdom-buchillustration-original-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="Father Brown – historische Buchillustration der Originalausgabe von G.K. Chesterton"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div></section>

      <TicketCTA variant="informative" />

      {/* BBC-Serie */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-5xl">
        <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">BBC</p>
        <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
          Die BBC-Serie
        </h2>
        <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
        <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
          Seit 2013 läuft die BBC-Serie „Father Brown" mit Mark Williams in der
          Titelrolle. Die Serie spielt im England der 1950er Jahre und hat die Figur
          einem weltweiten Publikum bekannt gemacht.
        </p>
        <p className="text-foreground/70 leading-relaxed text-lg font-light">
          In Deutschland wurde die Figur bereits 1966 durch Heinz Rühmann als
          „Pater Brown" berühmt. Mehr zur Geschichte der Verfilmungen auf der{" "}
          <Link to="/pater-brown" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
            Pater-Brown-Übersichtsseite
          </Link>.
        </p>
      </div></section>

      <TicketCTA variant="concrete" />

      {/* Live-Hörspiel */}
      <section className="py-28 md:py-36 px-6"><div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
          <CinematicPortrait
            src="/images/buehne/pater-brown-dialog-szene-monot-mues-af.webp"
            srcSet="/images/buehne/pater-brown-dialog-szene-monot-mues-af-480.webp 480w, /images/buehne/pater-brown-dialog-szene-monot-mues-af-768.webp 768w, /images/buehne/pater-brown-dialog-szene-monot-mues-af-1200.webp 1200w"
            sizes="(max-width: 768px) 100vw, 55vw"
            alt="Pater Brown Live-Hörspiel – Antoine Monot und Wanja Mues auf der Bühne"
            aspectRatio="aspect-[16/10]"
            objectPosition="50% 50%"
            fadeEdges
          />
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Live erleben</p>
            <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
              Father Brown live
            </h2>
            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8" aria-hidden="true" />
            <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
              Für Fans der BBC-Serie und der Originalgeschichten: Das{" "}
              <Link to="/live-hoerspiel" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Pater Brown Live-Hörspiel
              </Link>
              {" "}bringt Chestertons Krimis auf die Bühne – als immersives Hörerlebnis
              mit professionellen Schauspielern und Live-Beatboxing.
            </p>
            <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
              <Link to="/antoine-monot" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Antoine Monot
              </Link>
              {" "}und{" "}
              <Link to="/wanja-mues" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Wanja Mues
              </Link>
              {" "}(bekannt aus „Ein Fall für zwei") sprechen die Rollen live,
              während{" "}
              <Link to="/marvelin" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                Beatboxer Marvelin
              </Link>
              {" "}alle Geräusche nur mit dem Mund erzeugt.
            </p>
            <p className="text-foreground/70 leading-relaxed text-lg font-light mb-8">
              Die Tour gastiert in Städten wie München, Hamburg, Köln, Berlin
              und Zürich – ideal auch für ein internationales Publikum.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer"><button className="btn-premium" type="button">Tickets sichern</button></a>
              <Link to="/termine" className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block">Alle Termine</Link>
            </div>
          </div>
        </div>
      </div></section>
    </LandingLayout>
  );
};

export default FatherBrown;
