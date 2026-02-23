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
      className="py-28 md:py-36 px-6"
      aria-labelledby="testimonials-heading"
    >
      <div className="container mx-auto max-w-6xl">
        {/* Featured Quote - Mousetrap Style */}
        <div className="text-center mb-24">
          <blockquote className="text-3xl md:text-5xl lg:text-6xl font-heading italic text-foreground/90 leading-tight max-w-4xl mx-auto">
            „Ein Abend voller Spannung, Humor und Gänsehaut."
          </blockquote>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent max-w-md mx-auto mt-10 mb-6" />
          <p className="text-gold text-sm uppercase tracking-[0.3em]">Das sagen unsere Besucher</p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <blockquote 
              key={testimonial.id}
              className="p-8 border border-foreground/10 bg-card/10 space-y-5 transition-colors hover:border-gold/20"
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
              <p className="text-foreground/80 leading-relaxed text-lg font-light">
                „{testimonial.quote}"
              </p>
              <cite className="text-gold text-sm not-italic block mt-4 uppercase tracking-wider">
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
