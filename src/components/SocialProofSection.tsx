import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote: "Absolut fesselnd! Die Live-Atmosphäre ist unbeschreiblich.",
    author: "Sarah M.",
    location: "Hamburg"
  },
  {
    id: 2,
    quote: "Ein einzigartiges Erlebnis. Die Kombination aus Krimi und Beatbox ist genial!",
    author: "Thomas K.",
    location: "München"
  },
  {
    id: 3,
    quote: "Wanja Mues und Antoine Monot sind grandios. Unbedingt hingehen!",
    author: "Lisa B.",
    location: "Berlin"
  }
];

const mediaLogos = [
  { name: "ZDF", featured: true },
  { name: "Kulturradio" },
  { name: "Eventim Top 10" }
];

export const SocialProofSection = () => {
  return (
    <section 
      className="py-20 md:py-24 px-6 bg-card/10"
      aria-labelledby="testimonials-heading"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">
            Social Proof
          </p>
          <h2 
            id="testimonials-heading" 
            className="text-4xl md:text-6xl font-heading tracking-wider text-foreground uppercase"
          >
            Das sagen Besucher
          </h2>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <blockquote 
              key={testimonial.id}
              className="premium-card p-6 md:p-8 space-y-4 hover:border-gold/40 transition-colors"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4 fill-gold text-gold" 
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-foreground/90 leading-relaxed text-base">
                "{testimonial.quote}"
              </p>
              <cite className="text-gold text-sm not-italic block mt-4">
                — {testimonial.author}, {testimonial.location}
              </cite>
            </blockquote>
          ))}
        </div>

        <div className="divider-gold w-32 mx-auto opacity-30 mb-12" aria-hidden="true" />

        {/* Media Mentions */}
        <div className="text-center">
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-6">
            Bekannt aus
          </p>
          <div className="flex justify-center items-center gap-8 md:gap-12 flex-wrap">
            {mediaLogos.map((logo) => (
              <span 
                key={logo.name}
                className={`font-heading text-lg md:text-xl tracking-wider ${
                  logo.featured ? 'text-gold font-bold' : 'text-gold/50'
                }`}
              >
                {logo.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
