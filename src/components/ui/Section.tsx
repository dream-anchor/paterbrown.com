import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  /** Innerer Container-Stil (default: 88% + max-w-[1400px]) */
  container?: "default" | "narrow" | "wide" | "none";
  /** Section-ID für Ankerlinks */
  id?: string;
  /** Mask-Image Fade am oberen/unteren Rand */
  fade?: boolean;
}

const CONTAINER_MAP = {
  default: "w-[88%] max-w-[1400px] mx-auto",
  narrow: "w-[88%] max-w-4xl mx-auto",
  wide: "w-[88%] max-w-6xl mx-auto",
  none: "",
} as const;

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const Section = ({
  children,
  className,
  container = "default",
  id,
  fade = false,
}: SectionProps) => (
  <motion.section
    id={id}
    className={cn("py-16 md:py-24", className)}
    style={
      fade
        ? {
            maskImage:
              "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
          }
        : undefined
    }
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
  >
    {container !== "none" ? (
      <div className={CONTAINER_MAP[container]}>{children}</div>
    ) : (
      children
    )}
  </motion.section>
);

export default Section;
