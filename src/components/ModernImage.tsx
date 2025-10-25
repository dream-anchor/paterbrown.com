interface ModernImageProps {
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

export const ModernImage = ({
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
}: ModernImageProps) => {
  // Extract base name without extension
  const baseName = src.replace(/\.(jpg|jpeg|png)$/i, '');
  const extension = src.match(/\.(jpg|jpeg|png)$/i)?.[0] || '.jpg';
  
  return (
    <picture>
      {/* AVIF - best compression, modern browsers */}
      <source
        type="image/avif"
        srcSet={`${baseName}.avif 1x, ${baseName}@2x.avif 2x`}
        sizes={sizes}
      />
      
      {/* WebP - good compression, wide support */}
      <source
        type="image/webp"
        srcSet={`${baseName}.webp 1x, ${baseName}@2x.webp 2x`}
        sizes={sizes}
      />
      
      {/* Fallback to original format */}
      <img
        src={src}
        srcSet={`${src} 1x, ${baseName}@2x${extension} 2x`}
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
};
