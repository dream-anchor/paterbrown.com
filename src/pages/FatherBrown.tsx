import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";
import Section from "@/components/ui/Section";
import SerifText from "@/components/ui/SerifText";
import GhostButton from "@/components/ui/GhostButton";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const BREADCRUMBS = [
  { label: "Startseite", href: "/" },
  { label: "Pater Brown", href: "/pater-brown" },
  { label: "Father Brown" },
];

const FatherBrown = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Father Brown \u2013 Von G.K. Chesterton zum Live-H\u00F6rspiel",
    url: "https://paterbrown.com/father-brown",
    image: "https://paterbrown.com/images/historisch/father-brown-wisdom-buchillustration-original-1200.webp",
    author: { "@type": "Organization", name: "paterbrown.com" },
    publisher: { "@type": "Organization", name: "Dream & Anchor Handelsgesellschaft mbH" },
    description: "Father Brown, im Deutschen als Pater Brown bekannt: Die ber\u00FChmte Figur von G.K. Chesterton jetzt als Live-H\u00F6rspiel auf Tour.",
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
      heroTitle="Father Brown"
      heroSubtitle="Von G.K. Chesterton zum Live-Hörspiel"
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
      <Section container="wide" className="py-20 md:py-32">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
          <div>
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Die Figur</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
              Father Brown = Pater Brown
            </h2>
            <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Father Brown ist die englische Originalbezeichnung der Figur, die im
              deutschsprachigen Raum als{" "}
              <Link to="/pater-brown" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Pater Brown
              </Link>
              {" "}bekannt wurde. Beide Namen bezeichnen dieselbe Figur – den
              unscheinbaren katholischen Priester, der Kriminalfälle löst.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70">
              Erfunden wurde die Figur von{" "}
              <Link to="/g-k-chesterton" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                G.K. Chesterton
              </Link>
              {" "}(1874–1936), der zwischen 1911 und 1935 insgesamt
              49 Kurzgeschichten mit Father Brown veröffentlichte.
            </SerifText>
          </div>
          <div className="card-glow rounded-[3px] overflow-hidden">
            <img
              src="/images/historisch/father-brown-wisdom-buchillustration-original.webp"
              srcSet="/images/historisch/father-brown-wisdom-buchillustration-original-480.webp 480w, /images/historisch/father-brown-wisdom-buchillustration-original-768.webp 768w, /images/historisch/father-brown-wisdom-buchillustration-original-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="Father Brown – historische Buchillustration der Originalausgabe von G.K. Chesterton"
              className="w-full aspect-[4/3] object-cover"
              loading="eager"
            />
          </div>
        </div>
      </Section>

      {/* BBC-Serie */}
      <Section container="narrow" className="py-20 md:py-32">
        <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">BBC</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
          Die BBC-Serie
        </h2>
        <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
        <SerifText size="lg" className="text-foreground/70 mb-6">
          Seit 2013 läuft die BBC-Serie „Father Brown" mit Mark Williams in der
          Titelrolle. Die Serie spielt im England der 1950er Jahre und hat die Figur
          einem weltweiten Publikum bekannt gemacht.
        </SerifText>
        <SerifText size="lg" className="text-foreground/70">
          In Deutschland wurde die Figur bereits 1966 durch Heinz Rühmann als
          „Pater Brown" berühmt. Mehr zur Geschichte der Verfilmungen auf der{" "}
          <Link to="/pater-brown" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
            Pater-Brown-Übersichtsseite
          </Link>.
        </SerifText>
      </Section>

      {/* Live-Hörspiel */}
      <Section container="wide" className="py-20 md:py-32">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
          <div className="card-glow rounded-[3px] overflow-hidden">
            <img
              src="/images/buehne/pater-brown-dialog-szene-monot-mues-af.webp"
              srcSet="/images/buehne/pater-brown-dialog-szene-monot-mues-af-480.webp 480w, /images/buehne/pater-brown-dialog-szene-monot-mues-af-768.webp 768w, /images/buehne/pater-brown-dialog-szene-monot-mues-af-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 55vw"
              alt="Pater Brown Live-Hörspiel – Antoine Monot und Wanja Mues auf der Bühne"
              className="w-full aspect-[16/10] object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">Live erleben</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
              Father Brown live
            </h2>
            <div className="divider-gold mb-8 max-w-xs" aria-hidden="true" />
            <SerifText size="lg" className="text-foreground/70 mb-6">
              Für Fans der BBC-Serie und der Originalgeschichten: Das{" "}
              <Link to="/live-hoerspiel" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Pater Brown Live-Hörspiel
              </Link>
              {" "}bringt Chestertons Krimis auf die Bühne – als immersives Hörerlebnis
              mit professionellen Schauspielern und Live-Beatboxing.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70 mb-6">
              <Link to="/antoine-monot" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Antoine Monot
              </Link>
              {" "}und{" "}
              <Link to="/wanja-mues" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Wanja Mues
              </Link>
              {" "}(bekannt aus „Ein Fall für zwei") sprechen die Rollen live,
              während{" "}
              <Link to="/marvelin" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                Beatboxer Marvelin
              </Link>
              {" "}alle Geräusche nur mit dem Mund erzeugt.
            </SerifText>
            <SerifText size="lg" className="text-foreground/70 mb-8">
              Die Tour gastiert in Städten wie München, Hamburg, Köln, Berlin
              und Zürich – ideal auch für ein internationales Publikum.
            </SerifText>

            <div className="flex flex-col sm:flex-row gap-4">
              <GhostButton href={EVENTIM_AFFILIATE_URL}>Tickets sichern</GhostButton>
              <GhostButton to="/termine" className="bg-transparent">Alle Termine</GhostButton>
            </div>
          </div>
        </div>
      </Section>
    </LandingLayout>
  );
};

export default FatherBrown;
