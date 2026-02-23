import { type ReactNode } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger-Delay in ms (0, 150, 300...) */
  delay?: number;
  /** Richtung der Einblendung */
  direction?: "up" | "left" | "right" | "none";
}

const TRANSFORMS: Record<string, string> = {
  up: "translateY(60px)",
  left: "translateX(-60px)",
  right: "translateX(60px)",
  none: "none",
};

const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "translateY(0) translateX(0)"
          : TRANSFORMS[direction],
        transition: `opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
