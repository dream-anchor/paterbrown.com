import { Link } from "react-router-dom";

/**
 * Minimalistische Navigation für redaktionelle/enzyklopädische Seiten.
 * Kein Ticket-Button, keine Show/Termine/Darsteller-Links.
 * Nur Logo + Startseite-Link.
 */
const EditorialNavigation = () => {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-[68ch] px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 text-neutral-400 hover:text-neutral-600 transition-colors"
          aria-label="Zur Startseite von paterbrown.com"
        >
          <span className="text-sm tracking-wide">paterbrown.com</span>
        </Link>

        <nav aria-label="Editorial-Navigation" className="flex items-center gap-6">
          <Link
            to="/g-k-chesterton"
            className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            G.K. Chesterton
          </Link>
          <Link
            to="/impressum"
            className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Impressum
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default EditorialNavigation;
