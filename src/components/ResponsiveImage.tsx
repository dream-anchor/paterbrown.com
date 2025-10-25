interface ResponsiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  decoding?: "async" | "sync" | "auto";
  sizes?: string;
  style?: React.CSSProperties;
}

export const ResponsiveImage = ({
  src,
  alt,
  width,
  height,
  className,
  loading = "lazy",
  fetchPriority = "auto",
  decoding = "async",
  sizes = "(max-width: 768px) 100vw, 50vw",
  style
}: ResponsiveImageProps) => {
  // Generate srcset for responsive images (1x, 2x for retina displays)
  const srcSet = `${src} 1x, ${src} 2x`;
  
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      className={className}
      style={style}
    />
  );
};
