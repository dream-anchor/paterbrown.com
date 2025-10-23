import { castMembers } from "@/data/castData";

const CastSection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-card/20">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-heading text-center mb-4 tracking-wider text-foreground">
          Die Erzähler
        </h2>
        <div className="divider-gold mb-16" />
        
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {castMembers.map((member) => (
            <div key={member.id} className="cast-spotlight group">
              <div 
                className="cast-image-container relative overflow-hidden"
                style={{ 
                  backgroundImage: `url(${member.headerBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <img 
                  src={member.image}
                  alt={`${member.name} als ${member.character}`}
                  className="cast-image"
                  loading="lazy"
                />
              </div>
              
              <div className="p-8 space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-heading tracking-wide text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-gold text-sm uppercase tracking-[0.2em]">{member.role}</p>
                  <p className="text-lg text-muted-foreground italic">als {member.character}</p>
                </div>
                
                <p className="text-muted-foreground leading-relaxed text-center">
                  {member.description}
                </p>
                
                <div className="flex gap-2 text-xs text-gold uppercase tracking-[0.2em] justify-center flex-wrap pt-4">
                  {member.highlights.map((highlight, idx) => (
                    <span key={idx}>
                      {highlight}
                      {idx < member.highlights.length - 1 && <span className="mx-2">·</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CastSection;
