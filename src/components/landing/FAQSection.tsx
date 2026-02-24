import { Helmet } from "react-helmet-async";
import SectionHeading from "./SectionHeading";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items: FAQItem[];
  label?: string;
  title?: string;
}

const FAQSection = ({
  items,
  label = "FAQ",
  title = "Häufige Fragen",
}: FAQSectionProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="py-16">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <SectionHeading label={label} title={title} />

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="border border-foreground/10 px-6 py-5 bg-card/30"
          >
            <h3 className="text-foreground font-heading text-base md:text-lg mb-3">
              {item.question}
            </h3>
            <p className="text-foreground/70 leading-relaxed text-base">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
