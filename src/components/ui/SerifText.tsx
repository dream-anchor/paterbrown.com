import { type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";

interface SerifTextProps {
  children: ReactNode;
  className?: string;
  /** HTML-Element (default: p) */
  as?: ElementType;
  /** Größe */
  size?: "base" | "lg" | "xl";
}

const SIZE_MAP = {
  base: "text-base md:text-lg",
  lg: "text-lg md:text-xl",
  xl: "text-xl md:text-2xl",
} as const;

const SerifText = ({
  children,
  className,
  as: Tag = "p",
  size = "base",
}: SerifTextProps) => (
  <Tag
    className={cn(
      "font-serif font-normal tracking-[0.05em] leading-[1.3]",
      "normal-case",
      SIZE_MAP[size],
      className,
    )}
  >
    {children}
  </Tag>
);

export default SerifText;
