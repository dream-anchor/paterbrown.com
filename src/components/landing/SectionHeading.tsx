interface SectionHeadingProps {
  label: string;
  title: string;
  id?: string;
}

const SectionHeading = ({ label, title, id }: SectionHeadingProps) => (
  <div className="space-y-4 mb-12">
    <p className="text-gold text-sm uppercase tracking-[0.3em] font-medium">
      {label}
    </p>
    <h2
      id={id}
      className="text-3xl sm:text-4xl md:text-5xl font-heading tracking-wider text-foreground uppercase"
    >
      {title}
    </h2>
    <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent max-w-xs" />
  </div>
);

export default SectionHeading;
