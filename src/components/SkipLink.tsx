const SkipLink = () => {
  return (
    <nav aria-label="Schnellzugriff" className="sr-only focus-within:not-sr-only">
      <ul className="fixed top-4 left-4 z-[9999] space-y-2">
        <li>
          <a 
            href="#main-content" 
            className="block bg-gold text-background px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('main-content');
              if (el) {
                el.focus();
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Zum Hauptinhalt springen
          </a>
        </li>
        <li>
          <a 
            href="#cast-heading" 
            className="block bg-gold text-background px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('cast-heading');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Zum Cast springen
          </a>
        </li>
        <li>
          <a 
            href="#tour-dates-heading" 
            className="block bg-gold text-background px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('tour-dates-heading');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Zu den Terminen springen
          </a>
        </li>
        <li>
          <a 
            href="#newsletter-heading" 
            className="block bg-gold text-background px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('newsletter-heading');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Zum Newsletter springen
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default SkipLink;
