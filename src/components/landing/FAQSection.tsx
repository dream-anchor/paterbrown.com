import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

      <Accordion type="multiple" className="space-y-3">
        {items.map((item, index) => (
          <AccordionItem
            key={index}
            value={`faq-${index}`}
            className="border border-foreground/10 rounded-lg px-6 bg-card/30"
          >
            <AccordionTrigger className="text-left text-foreground hover:text-gold transition-colors text-base md:text-lg py-5 [&[data-state=open]>svg]:text-gold">
              {item.question}
            </AccordionTrigger>
            {/* forceMount + data-state hidden: Inhalt im DOM für Crawler sichtbar */}
            <AccordionContent
              forceMount
              className="text-foreground/70 leading-relaxed text-base pb-5 data-[state=closed]:hidden"
            >
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQSection;
