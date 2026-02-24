import { castMembers } from "@/data/castData";
import { ResponsiveImage } from "./ResponsiveImage";
import { isBlackWeekActive } from "@/lib/blackWeekConfig";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const CastSection = () => {
  const mainCast = castMembers.filter(m => m.id !== 'marvelin');
  const marvelin = castMembers.find(m => m.id === 'marvelin');

  return (
    <section
      id="cast"
      className="py-28 md:py-36 px-6 relative overflow-hidden"
      aria-labelledby="cast-heading"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-24">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium">Die Stars</p>
          <h2 id="cast-heading" className="text-6xl sm:text-7xl md:text-[8rem] lg:text-[10rem] font-heading text-foreground leading-[0.85]">
            Cast
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 max-w-6xl mx-auto">
          {mainCast.map((member) => (
            <article
              key={member.id}
              className="group"
            >
              <div className="relative overflow-hidden aspect-[3/4] mb-8">
                {/* Layer 1 — Blurred background */}
                <ResponsiveImage
                  src={member.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  width={800}
                  height={1067}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{
                    objectPosition: '50% 15%',
                    filter: 'contrast(1.15) brightness(0.9) saturate(0.85) blur(3px)',
                  }}
                />
                {/* Layer 2 — Sharp foreground with radial mask */}
                <div
                  className="absolute inset-0"
                  style={{
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 75% at 50% 35%, black 30%, transparent 70%)',
                    maskImage: 'radial-gradient(ellipse 80% 75% at 50% 35%, black 30%, transparent 70%)',
                  }}
                >
                  <ResponsiveImage
                    src={member.image}
                    alt={`${member.name} als ${member.character || member.role}`}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    loading="lazy"
                    width={800}
                    height={1067}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{
                      objectPosition: '50% 15%',
                      filter: 'contrast(1.15) brightness(0.9) saturate(0.85)',
                    }}
                  />
                </div>
                {/* Layer 3 — Soft-glow / Diffusion */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    mixBlendMode: 'soft-light',
                    opacity: 0.35,
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 75% at 50% 35%, black 30%, transparent 70%)',
                    maskImage: 'radial-gradient(ellipse 80% 75% at 50% 35%, black 30%, transparent 70%)',
                  }}
                >
                  <ResponsiveImage
                    src={member.image}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={800}
                    height={1067}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{
                      objectPosition: '50% 15%',
                      filter: 'blur(4px) brightness(1.1) saturate(0.7)',
                    }}
                  />
                </div>
                {/* Unterer Gradient — Text-Lesbarkeit */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.6) 18%, transparent 45%)',
                  }}
                />
                {/* Gold-Akzentlinie am unteren Bildrand */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
                  style={{
                    background: 'linear-gradient(to right, transparent 10%, hsl(var(--gold) / 0.3) 50%, transparent 90%)',
                  }}
                />
              </div>
              <div className="relative z-10 -mt-24 px-4">
                <h3 className="text-4xl md:text-5xl font-heading text-foreground mb-2 whitespace-nowrap">
                  {member.name}
                </h3>
                <p className="text-lg text-gold tracking-[0.2em] uppercase font-medium">
                  {member.role}
                </p>
                <p className="text-muted-foreground mt-4 text-base leading-relaxed max-w-md">
                  {member.description}
                </p>
              </div>
            </article>
          ))}
        </div>
        
        <div className="text-center mt-20">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">Das Duo – bekannt aus</p>
          <h3 className="text-3xl md:text-5xl lg:text-6xl font-heading text-foreground">
            Ein Fall für Zwei
          </h3>
        </div>

        {/* Black Week CTA nach Cast */}
        {isBlackWeekActive() && (
          <div className="text-center mt-16 bg-card/30 backdrop-blur-sm px-8 py-8 max-w-2xl mx-auto space-y-6">
            <p className="text-gold text-lg mb-4 font-medium">
              Erlebe Wanja Mues & Antoine Monot live – nur diese Woche mit 30% Rabatt
            </p>
            <a href={EVENTIM_AFFILIATE_URL} target="_blank" rel="noopener noreferrer">
              <button className="btn-premium" type="button">
                Jetzt 30% Rabatt sichern
              </button>
            </a>
          </div>
        )}

        {marvelin && (
          <article className="mt-40 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-0 border border-foreground/10">
              <div className="relative overflow-hidden min-h-[400px] md:min-h-[650px]">
                <ResponsiveImage 
                  src={marvelin.image}
                  alt={`${marvelin.name} - ${marvelin.role}`}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  width={800}
                  height={1200}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              
              <div className="p-8 md:p-12 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-4xl md:text-6xl font-heading text-foreground mb-2">
                    {marvelin.name}
                  </h3>
                  <p className="text-lg text-gold tracking-[0.2em] uppercase font-medium">
                    {marvelin.role}
                  </p>
                </div>
                
                <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24" />
                
                <div className="space-y-4">
                  {marvelin.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-muted-foreground text-base leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
};

export default CastSection;
