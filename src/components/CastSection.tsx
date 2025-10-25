import { castMembers } from "@/data/castData";

const CastSection = () => {
  const mainCast = castMembers.filter(m => m.id !== 'marvelin');
  const marvelin = castMembers.find(m => m.id === 'marvelin');

  return (
    <section 
      className="relative py-24 px-6 bg-gradient-to-b from-background via-background to-card/30 -mt-32 overflow-hidden"
      aria-labelledby="cast-heading"
    >
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background/50 pointer-events-none" />
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" aria-hidden="true" />
      
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-24">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">Die Stars</p>
          <h2 id="cast-heading" className="text-6xl md:text-8xl lg:text-9xl font-heading tracking-wider text-foreground uppercase">
            Cast
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 max-w-6xl mx-auto">
          {mainCast.map((member) => (
            <article 
              key={member.id}
              className="cast-spotlight premium-card p-0 overflow-hidden"
            >
              <div className="relative overflow-hidden aspect-[3/4]">
                <img 
                  src={member.image} 
                  alt={`${member.name} als ${member.character || member.role}`}
                  className="w-full h-full object-cover cast-image"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
              <div className="p-8 relative z-10 -mt-20">
                <h3 className="text-4xl md:text-5xl font-heading tracking-wider text-foreground mb-2">
                  {member.name.toUpperCase()}
                </h3>
                <p className="text-xl text-gold tracking-[0.2em] uppercase font-medium">
                  {member.role}
                </p>
                <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                  {member.description}
                </p>
              </div>
            </article>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">Das Duo – bekannt aus</p>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-heading tracking-[0.2em] text-foreground uppercase">
            EIN FALL FÜR ZWEI
          </h3>
        </div>

        {marvelin && (
          <article className="mt-40 max-w-4xl mx-auto">
            <div className="premium-card p-0 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative overflow-hidden bg-gradient-to-br from-card to-background h-full min-h-[500px] md:min-h-[650px]">
                  <img 
                    src={marvelin.image}
                    alt={`${marvelin.name} - ${marvelin.role}`}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                
                <div className="p-8 md:p-12 flex flex-col justify-between space-y-6 h-full min-h-[500px] md:min-h-[650px]">
                  <div>
                    <h3 className="text-4xl md:text-5xl font-heading tracking-wider text-foreground mb-2">
                      {marvelin.name.toUpperCase()}
                    </h3>
                    <p className="text-xl text-gold tracking-[0.2em] uppercase font-medium">
                      {marvelin.role}
                    </p>
                  </div>
                  
                  <div className="divider-gold w-24" aria-hidden="true" />
                  
                  <div className="space-y-4">
                    {marvelin.description.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-muted-foreground text-base leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
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
