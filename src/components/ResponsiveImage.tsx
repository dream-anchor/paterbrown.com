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
  // Optional modern format sources for picture element
  webpSrc?: string;
  avifSrc?: string;
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
  style,
  webpSrc,
  avifSrc
}: ResponsiveImageProps) => {
  // Generate srcset for responsive images (1x, 2x for retina displays)
  const srcSet = `${src} 1x, ${src} 2x`;
  
  // If modern formats are provided, use picture element
  if (webpSrc || avifSrc) {
    return (
      <picture>
        {avifSrc && (
          <source
            type="image/avif"
            srcSet={`${avifSrc} 1x, ${avifSrc} 2x`}
            sizes={sizes}
          />
        )}
        {webpSrc && (
          <source
            type="image/webp"
            srcSet={`${webpSrc} 1x, ${webpSrc} 2x`}
            sizes={sizes}
          />
        )}
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
      </picture>
    );
  }
  
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
