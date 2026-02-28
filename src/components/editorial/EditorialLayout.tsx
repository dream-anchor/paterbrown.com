import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import EditorialNavigation from "@/components/editorial/EditorialNavigation";
import EditorialFooter from "@/components/editorial/EditorialFooter";

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
 * Heller Hintergrund, Serifenschrift, keine CTAs, kein kommerzielles Menü.
 * Optimiert für Seriosität (Wikipedia-tauglich).
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
    <div className="editorial-theme min-h-screen flex flex-col">
      <EditorialNavigation />

      {/* Artikel-Header */}
      <header className="pt-10 md:pt-14 pb-8 md:pb-10 px-6 bg-white">
        <div className="mx-auto max-w-[68ch]">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap gap-1.5 text-xs text-neutral-400">
              {breadcrumbs.map((crumb, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {crumb.href ? (
                    <Link
                      to={crumb.href}
                      className="hover:text-neutral-600 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-neutral-500">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-neutral-900 leading-tight mb-3">
            {title}
          </h1>

          {subtitle && (
            <p className="text-base md:text-lg text-neutral-500 leading-relaxed">
              {subtitle}
            </p>
          )}

          {lastUpdated && (
            <p className="text-xs text-neutral-400 mt-3">
              Zuletzt aktualisiert: {new Date(lastUpdated).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}

          <div className="h-[1px] bg-neutral-200 mt-6" aria-hidden="true" />
        </div>
      </header>

      {/* Inhaltsverzeichnis */}
      {toc && toc.length > 0 && (
        <nav aria-label="Inhaltsverzeichnis" className="px-6 pb-8 bg-white">
          <div className="mx-auto max-w-[68ch]">
            <p className="text-xs uppercase tracking-wider text-neutral-400 mb-3">
              Inhaltsverzeichnis
            </p>
            <ol className="space-y-1.5 text-sm">
              {toc.map((entry, i) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    className="text-neutral-500 hover:text-blue-700 transition-colors"
                  >
                    <span className="text-neutral-300 mr-2">{i + 1}.</span>
                    {entry.label}
                  </a>
                </li>
              ))}
            </ol>
            <div className="h-[1px] bg-neutral-200 mt-6" aria-hidden="true" />
          </div>
        </nav>
      )}

      {/* Artikel-Body */}
      <main className="flex-1 px-6 pb-16 bg-white">
        <article className="mx-auto max-w-[68ch] editorial-content">
          {children}
        </article>
      </main>

      <EditorialFooter />
    </div>
  );
};

export default EditorialLayout;
