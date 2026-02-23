import { type ReactNode, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type GhostButtonBase = {
  children: ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg";
};

type AsLink = GhostButtonBase & { to: string; href?: never; onClick?: never };
type AsExternal = GhostButtonBase & {
  href: string;
  to?: never;
  onClick?: never;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href">;
type AsButton = GhostButtonBase & {
  to?: never;
  href?: never;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

type GhostButtonProps = AsLink | AsExternal | AsButton;

const SIZE_MAP = {
  sm: "px-5 py-2 text-xs",
  default: "px-8 py-3 text-sm",
  lg: "px-10 py-4 text-base",
} as const;

const base = cn(
  "inline-flex items-center justify-center",
  "border border-primary/60 bg-transparent text-primary",
  "font-heading uppercase tracking-[0.15em] font-bold",
  "rounded-[3px]",
  "neon-border transition-all duration-300",
  "hover:bg-primary/10 hover:text-white",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
);

const GhostButton = ({ children, className, size = "default", ...props }: GhostButtonProps) => {
  const classes = cn(base, SIZE_MAP[size], className);

  if ("to" in props && props.to) {
    return (
      <Link to={props.to} className={classes}>
        {children}
      </Link>
    );
  }

  if ("href" in props && props.href) {
    const { href, ...rest } = props as AsExternal;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...rest}
      >
        {children}
      </a>
    );
  }

  const { to, href, ...buttonProps } = props as AsButton & { to?: string; href?: string };
  return (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  );
};

export default GhostButton;
