import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote: "War ein MEGA Abend 👏👏👏👏 Muss man sich unbedingt anschauen.",
    author: "@wieczorek3309",
    location: "Instagram"
  },
  {
    id: 2,
    quote: "Augsburg Spectrum war hervorragend, spannend und mit Marvelin ein genussvoller Abend. Auch die Location hat uns sehr gut gefallen.",
    author: "@birgit.wchtr",
    location: "Instagram"
  },
  {
    id: 3,
    quote: "Ein tolles Konzept mit erstklassigen Sprechern, die die Figuren zum Leben erweckten. Herrlich! Alle zusammen haben es geschafft, die passende Stimmung zu erzeugen. Sehr gerne mehr davon!",
    author: "@majokeli2024",
    location: "Instagram"
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
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <blockquote 
              key={testimonial.id}
              className="bg-card/30 backdrop-blur-sm border border-gold/20 p-8 md:p-10 space-y-6 hover:border-gold/40 transition-all hover:shadow-lg hover:shadow-gold/10"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-5 h-5 fill-gold text-gold" 
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-foreground/95 leading-relaxed text-base md:text-lg italic">
                "{testimonial.quote}"
              </p>
              <cite className="text-gold/80 text-sm not-italic block mt-6 pt-4 border-t border-gold/20">
                — {testimonial.author}<br />
                <span className="text-muted-foreground text-xs">{testimonial.location}</span>
              </cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
