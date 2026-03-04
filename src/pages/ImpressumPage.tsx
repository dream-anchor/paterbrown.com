import { Helmet } from 'react-helmet-async';

/**
 * Impressum – rechtlich erforderlich nach § 5 TMG
 * WICHTIG: Platzhalter-Daten müssen durch echte Angaben ersetzt werden!
 * Diese Seite liefert HTTP 200 direkt, ohne Redirect.
 */
export default function ImpressumPage() {
  return (
    <>
      <Helmet>
        <title>Impressum | Pater Brown Live-Hörspiel</title>
        <meta
          name="description"
          content="Impressum und Anbieterkennzeichnung gemäß § 5 TMG für paterbrown.com – Pater Brown Live-Hörspiel."
        />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://paterbrown.com/impressum" />
      </Helmet>

      <main
        id="main-content"
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '4rem 1.5rem',
          fontFamily: 'sans-serif',
          lineHeight: '1.7',
          color: '#1a1a1a',
        }}
      >
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Impressum</h1>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Angaben gemäß § 5 TMG
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Verantwortlich</h2>
          {/* TODO: Echten Namen, Anschrift, Telefon, E-Mail eintragen */}
          <p>
            [Vorname Nachname / Firmenname]<br />
            [Straße Hausnummer]<br />
            [PLZ Ort]<br />
            Deutschland
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Kontakt</h2>
          <p>
            {/* TODO: Echte Kontaktdaten eintragen */}
            E-Mail: <a href="mailto:[email@beispiel.de]" style={{ color: '#1a1a1a' }}>[email@beispiel.de]</a>
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Umsatzsteuer-ID</h2>
          <p>
            {/* TODO: USt-IdNr. eintragen oder diesen Abschnitt entfernen falls nicht relevant */}
            Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [DE000000000]
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Verantwortlich für den Inhalt</h2>
          <p>
            {/* TODO: Echte Angaben nach § 18 Abs. 2 MStV */}
            [Vorname Nachname]<br />
            [Anschrift wie oben]
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1a1a1a' }}
            >
              https://ec.europa.eu/consumers/odr/
            </a>.
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <p style={{ marginTop: '3rem' }}>
          <a href="/" style={{ color: '#1a1a1a', textDecoration: 'underline' }}>
            ← Zurück zur Startseite
          </a>
        </p>
      </main>
    </>
  );
}
