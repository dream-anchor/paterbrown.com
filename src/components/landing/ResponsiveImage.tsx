interface ResponsiveImageProps {
  /** Basispfad ohne Suffix/Extension, z.B. "/images/buehne/pater-brown-dialog" */
  basePath: string;
  alt: string;
  width: number;
  height: number;
  /** CSS sizes Attribut, Default: responsive full-width */
  sizes?: string;
  /** Sofort laden (above the fold) statt lazy */
  priority?: boolean;
  className?: string;
  /** Fotograf-Credit (wird nicht mehr am Bild angezeigt, nur noch im Footer) */
  credit?: string;
  /** Lizenz-Hinweis für CC-Bilder */
  license?: string;
}

/**
 * Responsive WebP-Bild mit srcSet für 300/480/768/1200/Original.
 * Alle Bilder liegen als [basePath].webp + [basePath]-{300,480,768,1200}.webp vor.
 */
const ResponsiveImage = ({
  basePath,
  alt,
  width,
  height,
  sizes = "(max-width: 480px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 800px",
  priority = false,
  className = "",
}: ResponsiveImageProps) => (
  <img
    src={`${basePath}-1200.webp`}
    srcSet={[
      `${basePath}-300.webp 300w`,
      `${basePath}-480.webp 480w`,
      `${basePath}-768.webp 768w`,
      `${basePath}-1200.webp 1200w`,
      `${basePath}.webp ${width}w`,
    ].join(", ")}
    sizes={sizes}
    alt={alt}
    width={width}
    height={height}
    loading={priority ? "eager" : "lazy"}
    decoding={priority ? "sync" : "async"}
    // @ts-expect-error – React >=19 uses fetchPriority, SSR needs lowercase
    fetchpriority={priority ? "high" : undefined}
    className={`w-full h-auto ${className}`}
  />
);

export default ResponsiveImage;
