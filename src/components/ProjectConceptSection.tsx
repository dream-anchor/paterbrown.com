const ProjectConceptSection = () => {
  return (
    <section className="py-20 px-6 bg-card/10">
      <div className="container mx-auto max-w-4xl">
        <div className="premium-card p-12 md:p-16 space-y-8">
          <h2 className="text-4xl md:text-5xl font-heading text-center tracking-wider text-foreground">
            Das Projekt
          </h2>
          <div className="divider-gold" />
          
          <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
            <p>
              <span className="text-gold font-heading text-xl">Pater Brown - Das Live-Hörspiel</span> ist 
              eine moderne Interpretation der zeitlosen Detektivgeschichten von G.K. Chesterton.
            </p>
            
            <p>
              Wir verbinden klassische Erzählkunst mit innovativen Live-Performance-Elementen 
              und schaffen so ein einzigartiges Theater-Erlebnis, das Hörspiel-Tradition mit 
              moderner Inszenierung vereint.
            </p>
            
            <p>
              Durch die Kombination aus meisterhafter Schauspielkunst, atmosphärischem Sound-Design 
              und Live-Foley-Effekten entsteht eine immersive Welt, die das Publikum direkt in 
              die mysteriösen Fälle des Pater Brown eintauchen lässt.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="text-center space-y-2">
                <div className="text-3xl font-heading text-gold">2</div>
                <div className="text-sm uppercase tracking-wider">Meistererzähler</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-heading text-gold">2</div>
                <div className="text-sm uppercase tracking-wider">Spannende Fälle</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-heading text-gold">1</div>
                <div className="text-sm uppercase tracking-wider">Unvergesslicher Abend</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectConceptSection;
