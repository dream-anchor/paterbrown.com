import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TocEntry {
  id: string;
  label: string;
}

interface EditorialLayoutProps {
  children: ReactNode;
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  /** Inhaltsverzeichnis-Einträge (id muss zu section-id im Content passen) */
  toc?: TocEntry[];
  /** Letzte Aktualisierung als ISO-Datum, z.B. "2026-02-28" */
  lastUpdated?: string;
}

/**
 * Redaktionelles Layout für enzyklopädische Seiten.
 * Kein Hero, keine CTAs, keine Conversion-Elemente.
 * Optimiert für Lesbarkeit und Seriosität (Wikipedia-tauglich).
 */
const EditorialLayout = ({
  children,
  breadcrumbs,
  title,
  subtitle,
  toc,
  lastUpdated,
}: EditorialLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Artikel-Header */}
      <header className="pt-32 md:pt-40 pb-12 md:pb-16 px-6">
        <div className="mx-auto max-w-[68ch]">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap gap-1.5 text-xs text-foreground/40">
              {breadcrumbs.map((crumb, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {crumb.href ? (
                    <Link
                      to={crumb.href}
                      className="hover:text-foreground/70 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground/60">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground leading-tight mb-4">
            {title}
          </h1>

          {subtitle && (
            <p className="text-lg md:text-xl text-foreground/60 font-light leading-relaxed">
              {subtitle}
            </p>
          )}

          {lastUpdated && (
            <p className="text-xs text-foreground/30 mt-4">
              Zuletzt aktualisiert: {new Date(lastUpdated).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}

          <div className="h-[1px] bg-foreground/10 mt-8" aria-hidden="true" />
        </div>
      </header>

      {/* Inhaltsverzeichnis */}
      {toc && toc.length > 0 && (
        <nav aria-label="Inhaltsverzeichnis" className="px-6 pb-12">
          <div className="mx-auto max-w-[68ch]">
            <p className="text-xs uppercase tracking-wider text-foreground/40 mb-3 font-heading">
              Inhaltsverzeichnis
            </p>
            <ol className="space-y-1.5 text-sm">
              {toc.map((entry, i) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    className="text-foreground/60 hover:text-gold transition-colors"
                  >
                    <span className="text-foreground/30 mr-2">{i + 1}.</span>
                    {entry.label}
                  </a>
                </li>
              ))}
            </ol>
            <div className="h-[1px] bg-foreground/10 mt-8" aria-hidden="true" />
          </div>
        </nav>
      )}

      {/* Artikel-Body */}
      <main className="flex-1 px-6 pb-24">
        <article className="mx-auto max-w-[68ch] editorial-content">
          {children}
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default EditorialLayout;
