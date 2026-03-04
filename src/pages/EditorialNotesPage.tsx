import { Helmet } from 'react-helmet-async';

/**
 * Editorische Notizen: Chesterton & Haefs
 * Direkte Route ohne Redirect – behebt GSC Redirect-Fehler.
 * Inhalt muss mit echten redaktionellen Inhalten befüllt werden.
 */
export default function EditorialNotesPage() {
  return (
    <>
      <Helmet>
        <title>Editorische Notizen: Chesterton & Haefs | Pater Brown</title>
        <meta
          name="description"
          content="Editorische Notizen zu G.K. Chesterton und Hanswilhelm Haefs – Hintergründe zur literarischen Vorlage des Pater Brown Live-Hörspiels."
        />
        <meta name="robots" content="index, follow" />
        <link
          rel="canonical"
          href="https://paterbrown.com/editorische-notizen-chesterton-haefs"
        />
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
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Editorische Notizen: Chesterton &amp; Haefs
        </h1>

        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Hintergründe zur literarischen Vorlage des Pater Brown Live-Hörspiels
        </p>

        {/*
          TODO: Echten redaktionellen Inhalt hier einfügen.
          Empfehlung für SEO:
          - Mindestens 400 Wörter
          - H2-Abschnitte zu: G.K. Chesterton (Autor), Hanswilhelm Haefs (Übersetzer),
            Entstehungsgeschichte der Pater-Brown-Geschichten, Bezug zur Bühnenadaption
          - Interne Links zur Startseite und zu Ticket-Seiten
        */}

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
            G.K. Chesterton – Schöpfer des Pater Brown
          </h2>
          <p>
            {/* TODO: Inhalt einfügen */}
            [Redaktioneller Text zu G.K. Chesterton und seinen Pater-Brown-Geschichten]
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
            Hanswilhelm Haefs – Übersetzer und Interpret
          </h2>
          <p>
            {/* TODO: Inhalt einfügen */}
            [Redaktioneller Text zu Hanswilhelm Haefs und seiner Übersetzungsarbeit]
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
            Von der Seite auf die Bühne
          </h2>
          <p>
            {/* TODO: Inhalt einfügen */}
            [Verbindung der literarischen Vorlage zur Bühnenadaption mit Wanja Mues und Antoine Monot]
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
