import { castMembers } from "@/data/castData";
import marvelinImage from "@/assets/marvelin.png";

const CastSection = () => {
  return (
    <section className="py-20 px-6 bg-background" role="region" aria-labelledby="cast-heading">
      <div className="container mx-auto max-w-6xl">
        <h2 id="cast-heading" className="text-4xl md:text-5xl font-heading text-center mb-4 tracking-wider text-foreground">
          Die Erzähler
        </h2>
        <div className="divider-gold mb-16" role="presentation" aria-hidden="true" />
        
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {castMembers.map((member) => (
            <article key={member.id} className="cast-spotlight rounded-lg overflow-hidden">
              <div className="relative h-80 overflow-hidden">
                <img 
                  src={member.headerBg}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  role="presentation"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" aria-hidden="true" />
                <img 
                  src={member.image}
                  alt={`${member.name}, ${member.role}`}
                  className="cast-image absolute bottom-0 left-1/2 -translate-x-1/2 h-full w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-3xl md:text-4xl font-heading tracking-wide text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-gold text-sm uppercase tracking-[0.2em]">{member.role}</p>
                  <p className="text-muted-foreground text-lg italic">{member.character}</p>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  {member.description}
                </p>
                
                <ul className="space-y-2" aria-label={`Highlights von ${member.name}`}>
                  {member.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gold mt-1.5" aria-hidden="true">✦</span>
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <article className="premium-card p-8 md:p-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-[200px_1fr] gap-8 items-center">
            <img 
              src={marvelinImage}
              alt="Marvelin, Beatboxer und Live-Sound-Künstler"
              className="w-full h-auto rounded-lg"
              loading="lazy"
              decoding="async"
            />
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-heading tracking-wide text-foreground">
                  Marvelin
                </h3>
                <p className="text-gold text-sm uppercase tracking-[0.2em]">Beatbox & Live-Sounds</p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Marvelin ist einer der innovativsten Beatboxer Deutschlands. Mit seinen 
                atemberaubenden Live-Sounds erschafft er die perfekte Klangkulisse für die 
                Geschichten von Pater Brown - von atmosphärischen Soundscapes bis hin zu 
                präzisen Sound-Effekten.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default CastSection;
