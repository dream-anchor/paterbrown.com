import { Star } from "lucide-react";
import { EVENTIM_AFFILIATE_URL } from "@/lib/constants";

const testimonials = [
  {
    id: 3,
    quote: "Ein tolles Konzept mit erstklassigen Sprechern, die die Figuren zum Leben erweckten. Herrlich! Alle zusammen haben es geschafft, die passende Stimmung zu erzeugen. Sehr gerne mehr davon!",
    author: "@majokeli2024",
    location: "Instagram"
  },
  {
    id: 2,
    quote: "Augsburg Spectrum war hervorragend, spannend und mit Marvelin ein genussvoller Abend. Auch die Location hat uns sehr gut gefallen.",
    author: "@birgit.wchtr",
    location: "Instagram"
  },
  {
    id: 1,
    quote: "War ein MEGA Abend 👏👏👏👏 Muss man sich unbedingt anschauen.",
    author: "@wieczorek3309",
    location: "Instagram"
  }
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
            Erfahrungen aus erster Hand
          </p>
          <h2 
            id="testimonials-heading" 
            className="text-4xl md:text-6xl font-heading tracking-wider text-foreground uppercase"
          >
            Das sagen unsere Besucher
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
              <p className="text-foreground/90 leading-relaxed text-lg">
                "{testimonial.quote}"
              </p>
              <cite className="text-gold text-base not-italic block mt-4">
                — {testimonial.author}, {testimonial.location}
              </cite>
            </blockquote>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <a 
            href={EVENTIM_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Jetzt Tickets sichern"
          >
            <button className="btn-premium" type="button">
              Jetzt Tickets sichern
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
