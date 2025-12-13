import { memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const TrailerSection = memo(() => {
  const isMobile = useIsMobile();

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-card/20" aria-labelledby="trailer-heading">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center space-y-6 mb-12">
          <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium">
            Exklusiver Einblick
          </p>
          <h2 id="trailer-heading" className="text-5xl md:text-7xl font-heading tracking-wider text-foreground uppercase">
            Erlebe Pater Brown
          </h2>
          <div className="divider-gold w-32 mx-auto" aria-hidden="true" />
        </div>

        <div className="relative rounded-lg overflow-hidden shadow-2xl border border-gold/20">
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
      </div>
    </section>
  );
});

TrailerSection.displayName = "TrailerSection";

export default TrailerSection;
