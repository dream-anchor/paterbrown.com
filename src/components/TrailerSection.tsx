import { memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const TrailerSection = memo(() => {
  const isMobile = useIsMobile();

  return (
    <section id="trailer" className="py-28 md:py-36 px-6" aria-labelledby="trailer-heading">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center space-y-6 mb-16">
          <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium">
            Exklusiver Einblick
          </p>
          <h2 id="trailer-heading" className="text-5xl sm:text-6xl md:text-[8rem] font-heading text-foreground leading-[0.85]">
            Erlebe Pater Brown
          </h2>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent max-w-md mx-auto" aria-hidden="true" />
        </div>

        <div className="relative overflow-hidden shadow-2xl border border-foreground/10">
          {isMobile ? (
            // Mobile: 9:16 Video
            <div className="relative w-full max-w-sm mx-auto" style={{ paddingTop: "177.78%" }}>
              <iframe
                src="https://player.vimeo.com/video/1146186958?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Pater Brown Trailer"
                loading="lazy"
              />
            </div>
          ) : (
            // Desktop/Tablet: 16:9 Video
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                src="https://player.vimeo.com/video/1146186984?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Pater Brown Trailer 16x9 mit UT"
                loading="lazy"
              />
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <Button
            asChild
            size="lg"
            className="bg-gold hover:bg-gold/90 text-black font-bold text-lg px-10 py-6 shadow-lg"
          >
            <a
              href={EVENTIM_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              🎟 Jetzt Tickets sichern
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
});

TrailerSection.displayName = "TrailerSection";

export default TrailerSection;
