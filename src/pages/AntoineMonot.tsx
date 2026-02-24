import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { SEO } from "@/components/SEO";

import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const BREADCRUMBS = [
  { label: "Startseite", href: "/" },
  { label: "Antoine Monot" },
];

const AntoineMonot = () => {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Antoine Monot",
    url: "https://paterbrown.com/antoine-monot",
    image: "https://paterbrown.com/images/portraits/antoine-monot-portrait-pater-brown-gl-1200.webp",
    jobTitle: "Schauspieler, Drehbuchautor, Produzent",
    description: "Antoine Monot ist Schauspieler, Drehbuchautor und Co-Produzent des Pater Brown Live-Hörspiels. Bekannt als Benni Hornberg in Ein Fall für zwei (ZDF).",
    performerIn: {
      "@type": "TheaterEvent",
      name: "Pater Brown – Das Live-Hörspiel",
      url: "https://paterbrown.com/live-hoerspiel",
    },
    sameAs: [],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: "https://paterbrown.com" },
      { "@type": "ListItem", position: 2, name: "Antoine Monot", item: "https://paterbrown.com/antoine-monot" },
    ],
  };

  return (
    <LandingLayout
      breadcrumbs={BREADCRUMBS}
      heroImage="/images/buehne/antoine-monot-portrait-gl.webp"
      heroTitle="Antoine Monot"
      heroSubtitle="Schauspieler, Drehbuchautor, Produzent"
      variant="portrait"
    >
      <SEO
        title={`Antoine Monot & Pater Brown – Der Star aus „Ein Fall für zwei" | paterbrown.com`}
        description={`Antoine Monot bringt Pater Brown als Live-Hörspiel auf die Bühne. Bekannt als Anwalt Benni Hornberg in „Ein Fall für zwei" und Tech-Nick bei Saturn.`}
        canonical="/antoine-monot"
        keywords="pater brown antoine monot, antoine monot pater brown, antoine monot, antoine monot wanja mues, monot schauspieler"
        ogImage="/images/og/antoine-monot-schauspieler-og.webp"
        schema={[personSchema, breadcrumbSchema]}
      />

      {/* Biografie */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
            <div className="overflow-hidden border border-foreground/10">
              <img
                src="/images/portraits/antoine-monot-portrait-pater-brown-gl.webp"
                srcSet="/images/portraits/antoine-monot-portrait-pater-brown-gl-480.webp 480w, /images/portraits/antoine-monot-portrait-pater-brown-gl-768.webp 768w, /images/portraits/antoine-monot-portrait-pater-brown-gl-1200.webp 1200w"
                sizes="(max-width: 768px) 100vw, 55vw"
                alt="Antoine Monot – Schauspieler und Co-Produzent des Pater Brown Live-Hörspiels"
                className="w-full aspect-[3/4] object-cover object-top"
                loading="eager"
              />
            </div>
            <div>
              <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Biografie</p>
              <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
                Der Schauspieler
              </h2>
              <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8 max-w-xs" aria-hidden="true" />
              <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
                Antoine Monot ist Schauspieler, Drehbuchautor und Produzent. Einem breiten
                Publikum wurde er als Rechtsanwalt Benni Hornberg in der ZDF-Serie
                „Ein Fall für zwei" bekannt, in der er seit 2014 an der Seite von{" "}
                <Link to="/wanja-mues" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                  Wanja Mues
                </Link>
                {" "}vor der Kamera steht.
              </p>
              <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
                Große Bekanntheit erlangte er auch als „Tech-Nick" in den Saturn-Werbespots
                (2013–2017) – einer der ikonischsten deutschen Werbekampagnen der 2010er Jahre.
              </p>
              <p className="text-foreground/70 leading-relaxed text-lg font-light">
                Neben seiner Schauspielkarriere ist Monot ein vielseitiger Künstler:
                Er schreibt Drehbücher, führt Regie und programmiert seit 1996.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Karriere */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Karriere</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
            Film &amp; Fernsehen
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8 max-w-xs" aria-hidden="true" />

          <div className="space-y-4 mb-8">
            <div className="border border-foreground/10 p-5 border-gold/40 bg-gold/5">
              <p className="font-heading text-foreground text-lg">„Ein Fall für zwei"</p>
              <p className="text-gold text-sm font-heading mt-1">ZDF – seit 2014</p>
              <p className="text-foreground/50 text-sm mt-2">
                Als Rechtsanwalt Benni Hornberg an der Seite von Wanja Mues (Leo Oswald)
              </p>
            </div>
            <div className="border border-foreground/10 p-5">
              <p className="font-heading text-foreground text-lg">Saturn „Tech-Nick"</p>
              <p className="text-gold text-sm font-heading mt-1">2013–2017</p>
              <p className="text-foreground/50 text-sm mt-2">
                Eine der bekanntesten deutschen Werbekampagnen der 2010er Jahre
              </p>
            </div>
            <div className="border border-foreground/10 p-5">
              <p className="font-heading text-foreground text-lg">Behringer und die Toten</p>
              <p className="text-gold text-sm font-heading mt-1">RTL</p>
              <p className="text-foreground/50 text-sm mt-2">
                Als unkonventioneller Kommissar Behringer
              </p>
            </div>
          </div>

          <p className="text-foreground/70 leading-relaxed text-lg font-light">
            Weitere Film- und TV-Rollen sowie Drehbucharbeiten ergänzen sein vielseitiges
            Portfolio.
          </p>
        </div>
      </section>

      {/* Bühnenfoto */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="overflow-hidden border border-foreground/10">
            <img
              src="/images/buehne/pater-brown-antoine-monot-buehne-solo-af.webp"
              srcSet="/images/buehne/pater-brown-antoine-monot-buehne-solo-af-480.webp 480w, /images/buehne/pater-brown-antoine-monot-buehne-solo-af-768.webp 768w, /images/buehne/pater-brown-antoine-monot-buehne-solo-af-1200.webp 1200w"
              sizes="(max-width: 768px) 100vw, 80vw"
              alt="Antoine Monot auf der Bühne im Pater Brown Live-Hörspiel"
              className="w-full aspect-[21/9] object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Antoine Monot & Pater Brown */}
      <section className="py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">Das Projekt</p>
          <h2 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
            Antoine Monot &amp; Pater Brown
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-8 max-w-xs" aria-hidden="true" />
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Antoine Monot ist nicht nur Sprecher im{" "}
            <Link to="/live-hoerspiel" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Pater Brown Live-Hörspiel
            </Link>
            {" "}– er ist Co-Produzent und eine der treibenden Kräfte hinter dem Projekt.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Die Idee: Die zeitlosen Kriminalgeschichten von{" "}
            <Link to="/pater-brown" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              G.K. Chestertons Pater Brown
            </Link>
            {" "}nicht einfach vorlesen, sondern als immersives Bühnenerlebnis inszenieren –
            mit Live-Sounddesign von{" "}
            <Link to="/marvelin" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Beatboxer Marvelin
            </Link>
            , der alle Geräusche nur mit dem Mund erzeugt.
          </p>
          <p className="text-foreground/70 leading-relaxed text-lg font-light mb-6">
            Gemeinsam mit{" "}
            <Link to="/stefanie-sick" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
              Stefanie Sick
            </Link>
            {" "}(Künstlerische Leitung) und der Dream &amp; Anchor Handelsgesellschaft mbH
            produziert Monot die Tournee, die durch Deutschlands große Bühnen tourt.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer"><button className="btn-premium" type="button">Tickets sichern</button></a>
            <Link to="/termine" className="text-sm uppercase tracking-[0.25em] font-semibold px-10 py-4 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 inline-block">Alle Termine</Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default AntoineMonot;
