import { useEffect, useRef, useState } from "react";

interface UseScrollRevealOptions {
  /** Intersection threshold (0-1), default 0.15 */
  threshold?: number;
  /** Root margin, default "0px 0px -50px 0px" */
  rootMargin?: string;
  /** Fire once then disconnect, default true */
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement>(
  options: UseScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Respektiere prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const {
      threshold = 0.15,
      rootMargin = "0px 0px -50px 0px",
      once = true,
    } = options;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(node);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { ref, isVisible };
}
