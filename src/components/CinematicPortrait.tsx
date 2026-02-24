/**
 * 3-Layer Cinematic Portrait Filter
 * Layer 1: Blurred background (depth-of-field)
 * Layer 2: Sharp foreground with radial mask
 * Layer 3: Diffusion glow (soft-light blend)
 */

interface CinematicPortraitProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  objectPosition?: string;
  loading?: "eager" | "lazy";
  hoverScale?: boolean;
  /** Gradient unten für Text-Lesbarkeit + Gold-Akzentlinie */
  showOverlay?: boolean;
  /** Radial-Mask-Fade an allen Kanten (für freistehende Bilder ohne Rahmen) */
  fadeEdges?: boolean;
}

/** Mask-Presets: Portrait = Fokus oben/Mitte, Scene = Fokus Bildmitte */
const MASK_PORTRAIT = "radial-gradient(ellipse 80% 75% at 50% 35%, black 30%, transparent 70%)";
const MASK_SCENE = "radial-gradient(ellipse 85% 80% at 50% 50%, black 35%, transparent 70%)";

const CinematicPortrait = ({
  src,
  srcSet,
  sizes,
  alt,
  className = "",
  aspectRatio = "aspect-[3/4]",
  objectPosition = "50% 15%",
  loading = "lazy",
  hoverScale = false,
  showOverlay = false,
  fadeEdges = false,
}: CinematicPortraitProps) => {
  const imgProps = {
    ...(srcSet && { srcSet }),
    ...(sizes && { sizes }),
    loading,
    decoding: "async" as const,
  };

  const isScene = objectPosition === "50% 50%" || objectPosition === "center" || objectPosition === "center center";
  const filterBase = "contrast(1.15) brightness(0.9) saturate(0.85)";
  const maskGradient = isScene ? MASK_SCENE : MASK_PORTRAIT;

  const containerStyle = fadeEdges
    ? {
        WebkitMaskImage: "radial-gradient(ellipse 95% 90% at 50% 50%, black 35%, transparent 70%)",
        maskImage: "radial-gradient(ellipse 95% 90% at 50% 50%, black 35%, transparent 70%)",
      }
    : undefined;

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${className}`} style={containerStyle}>
      {/* Layer 1 — Blurred background */}
      <img
        src={src}
        {...imgProps}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          objectPosition,
          filter: `${filterBase} blur(3px)`,
        }}
      />
      {/* Layer 2 — Sharp foreground with radial mask */}
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage: maskGradient,
          maskImage: maskGradient,
        }}
      >
        <img
          src={src}
          {...imgProps}
          alt={alt}
          className={`w-full h-full object-cover ${
            hoverScale
              ? "group-hover:scale-[1.03] transition-transform duration-700"
              : ""
          }`}
          style={{ objectPosition, filter: filterBase }}
        />
      </div>
      {/* Layer 3 — Soft-glow / Diffusion */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          mixBlendMode: "soft-light",
          opacity: 0.35,
          WebkitMaskImage: maskGradient,
          maskImage: maskGradient,
        }}
      >
        <img
          src={src}
          {...imgProps}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{
            objectPosition,
            filter: "blur(4px) brightness(1.1) saturate(0.7)",
          }}
        />
      </div>

      {showOverlay && (
        <>
          {/* Unterer Gradient — Text-Lesbarkeit */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.6) 18%, transparent 45%)",
            }}
          />
          {/* Gold-Akzentlinie */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, transparent 10%, hsl(var(--gold) / 0.3) 50%, transparent 90%)",
            }}
          />
        </>
      )}
    </div>
  );
};

export default CinematicPortrait;
