interface SectionHeadingProps {
  label: string;
  title: string;
  id?: string;
  centered?: boolean;
}

const SectionHeading = ({ label, title, id, centered = false }: SectionHeadingProps) => (
  <div className={`space-y-4 mb-12 ${centered ? 'text-center' : ''}`}>
    <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium">
      {label}
    </p>
    <h2
      id={id}
      className="text-4xl sm:text-5xl md:text-7xl font-heading text-foreground"
    >
      {title}
    </h2>
    <div className={`h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent max-w-xs ${centered ? 'mx-auto' : ''}`} />
  </div>
);

export default SectionHeading;
