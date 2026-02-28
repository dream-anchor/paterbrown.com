import { Link } from "react-router-dom";

/**
 * Minimaler Footer für redaktionelle/enzyklopädische Seiten.
 * Nur Impressum, Datenschutz, Copyright — keine Ticket-Links, kein Instagram.
 */
const EditorialFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white" role="contentinfo">
      <div className="mx-auto max-w-[68ch] px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        <p>&copy; {currentYear} paterbrown.com</p>

        <nav aria-label="Rechtliches" className="flex items-center gap-4">
          <Link
            to="/impressum"
            className="hover:text-neutral-600 transition-colors"
          >
            Impressum
          </Link>
          <span aria-hidden="true" className="text-neutral-300">|</span>
          <Link
            to="/datenschutz"
            className="hover:text-neutral-600 transition-colors"
          >
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default EditorialFooter;
