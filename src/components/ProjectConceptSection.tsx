const ProjectConceptSection = () => {
  return (
    <section className="py-20 px-6 bg-card/10" role="region" aria-labelledby="project-heading">
      <div className="container mx-auto max-w-6xl">
        <h2 id="project-heading" className="text-4xl md:text-5xl font-heading text-center mb-4 tracking-wider text-foreground">
          Das Projekt
        </h2>
        <div className="divider-gold mb-16" role="presentation" aria-hidden="true" />

        <div className="max-w-4xl mx-auto space-y-8">
          <p className="text-muted-foreground leading-relaxed text-lg text-center">
            Pater Brown - Das Live-Hörspiel verbindet klassische Erzählkunst mit moderner 
            Performance-Kunst. Die zeitlosen Geschichten von G.K. Chesterton werden durch 
            die virtuose Darbietung zweier außergewöhnlicher Schauspieler und innovatives 
            Sound-Design zu einem einzigartigen Theatererlebnis.
          </p>

          <div className="grid md:grid-cols-3 gap-8 pt-8">
            <div className="text-center space-y-3">
              <div className="text-5xl md:text-6xl font-heading text-gold">2</div>
              <p className="text-muted-foreground uppercase tracking-wider text-sm">Meistererzähler</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-5xl md:text-6xl font-heading text-gold">2</div>
              <p className="text-muted-foreground uppercase tracking-wider text-sm">Spannende Fälle</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-5xl md:text-6xl font-heading text-gold">90</div>
              <p className="text-muted-foreground uppercase tracking-wider text-sm">Minuten Live-Erlebnis</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectConceptSection;
