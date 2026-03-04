import { Routes, Route } from 'react-router-dom';
import ImpressumPage from './pages/ImpressumPage';
import EditorialNotesPage from './pages/EditorialNotesPage';

// Lazy-Imports für bestehende Seiten – Pfade basierend auf Repository-Struktur
// Falls diese Imports fehlschlagen, müssen die Pfade an die tatsächliche
// Seitenstruktur im Repository angepasst werden.
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Fallback während Lazy-Loading
const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span>Laden...</span>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Hauptseite */}
        <Route path="/" element={<HomePage />} />

        {/* Rechtlich erforderliche Seiten – direkte 200-Antwort, KEIN Redirect */}
        <Route path="/impressum" element={<ImpressumPage />} />

        {/* Editorische Notizen – direkte Route ohne Redirect */}
        <Route path="/editorische-notizen-chesterton-haefs" element={<EditorialNotesPage />} />

        {/* Admin-Bereich */}
        <Route path="/admin/*" element={<AdminPage />} />

        {/* 404-Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

// Inline 404-Seite
function NotFoundPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Seite nicht gefunden</h1>
      <p style={{ marginBottom: '1.5rem', color: '#666' }}>Diese Seite existiert leider nicht.</p>
      <a href="/" style={{ color: '#1a1a1a', textDecoration: 'underline' }}>Zurück zur Startseite</a>
    </main>
  );
}
