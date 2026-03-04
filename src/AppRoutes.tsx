// HINWEIS: Dies ist eine rekonstruierte Version basierend auf der bekannten Dateistruktur.
// Falls AppRoutes.tsx anders aufgebaut ist, müssen die SEO-Props entsprechend
// in die jeweiligen Page-Komponenten verschoben werden.
//
// Kernänderung:
//   - Homepage:  title="Pater Brown – Das Live-Hörspiel | Tickets 2026"
//   - Admin:     title="Admin – Pater Brown Backstage" + noIndex={true}

import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import SEO from './components/SEO';

// Lazy-loaded page components (Namen basieren auf der bekannten Dateistruktur)
const HomePage = lazy(() => import('./pages/HomePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Fallback für Suspense
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <span>Lädt…</span>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* ===== Homepage ===== */}
      <Route
        path="/"
        element={
          <Suspense fallback={<PageLoader />}>
            {/*
             * Title: 54 Zeichen – eindeutig, Hauptkeyword "Pater Brown" vorne,
             *        "Live-Hörspiel" als zweites Keyword, Jahr 2026 für Aktualität.
             * Zuvor identisch mit /admin -> Duplicate Title behoben.
             */}
            <SEO
              title="Pater Brown – Das Live-Hörspiel | Tickets 2026"
              description="Erleben Sie Pater Brown live auf der Bühne mit Wanja Mues und Antoine Monot. Ein einzigartiges Live-Hörspiel-Erlebnis mit Beatboxer Marvelin."
              canonical="https://paterbrown.com/"
              ogTitle="Pater Brown – Das Live-Hörspiel | Tickets 2026"
              ogDescription="Erleben Sie Pater Brown live auf der Bühne mit Wanja Mues und Antoine Monot. Ein einzigartiges Live-Hörspiel-Erlebnis mit Beatboxer Marvelin."
            />
            <HomePage />
          </Suspense>
        }
      />

      {/* ===== Admin ===== */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={<PageLoader />}>
            {/*
             * Title: 29 Zeichen – kurz, intern, kein öffentliches Keyword-Targeting.
             * noIndex={true} setzt <meta name="robots" content="noindex,nofollow">
             * damit Google /admin nicht indexiert und nicht als Duplicate wertet.
             * Zuvor identischer Title wie / -> Duplicate Title behoben.
             */}
            <SEO
              title="Admin – Pater Brown Backstage"
              description="Interner Administrationsbereich für das Pater Brown Live-Hörspiel Team."
              noIndex={true}
            />
            <AdminPage />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
