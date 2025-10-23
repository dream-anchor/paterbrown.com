import { showCases } from "@/data/castData";

const ShowConceptSection = () => {
  return (
    <section className="py-20 px-6 bg-card/10">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-heading text-center mb-4 tracking-wider text-foreground">
          Die Fälle
        </h2>
        <div className="divider-gold mb-16" />
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {showCases.map((showCase) => (
            <div key={showCase.id} className="premium-card p-8 space-y-4">
              <h3 className="text-2xl font-heading tracking-wide text-gold text-center">
                {showCase.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                {showCase.description}
              </p>
            </div>
          ))}
        </div>

        <div className="premium-card p-12 space-y-6 max-w-4xl mx-auto">
          <h3 className="text-3xl font-heading tracking-wide text-center text-foreground">
            Das Konzept
          </h3>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Erleben Sie ein einzigartiges Live-Hörspiel, bei dem zwei meisterhafte Erzähler 
              die klassischen Detektivgeschichten von G.K. Chesterton zum Leben erwecken.
            </p>
            <p>
              Mit atmosphärischen Live-Sounds, professionellem Sound-Design und der kraftvollen 
              Performance zweier herausragender Schauspieler entsteht ein unvergessliches 
              Theater-Erlebnis.
            </p>
            <p className="text-gold text-center font-heading tracking-wider text-lg pt-4">
              Ein Abend voller Spannung, Atmosphäre und meisterhafter Erzählkunst
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowConceptSection;
