import { cn } from "@/lib/utils";

interface QuoteProps {
  text: string;
  citation: string;
  className?: string;
}

const Quote = ({ text, citation, className }: QuoteProps) => (
  <blockquote className={cn("relative", className)}>
    {/* Dekoratives Anführungszeichen */}
    <span
      className="absolute -top-6 -left-2 text-[8rem] leading-none text-primary/10 font-heading select-none pointer-events-none"
      aria-hidden="true"
    >
      &ldquo;
    </span>
    <p className="quote-display relative z-10">{text}</p>
    <footer className="mt-4">
      <cite className="not-italic font-heading text-sm uppercase tracking-[0.1em] text-primary">
        {citation}
      </cite>
    </footer>
  </blockquote>
);

export default Quote;
