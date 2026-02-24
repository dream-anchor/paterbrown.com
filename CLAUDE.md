# paterbrown.com

## Stack
React/TS + Vite, shadcn/ui, Tailwind | Supabase (Postgres + Edge Functions) | Leaflet Maps

## Deployment
- Code → commit + push → GitHub Actions baut + deployed per SCP auf Strato
- Workflow: `.github/workflows/deploy.yml` (trigger: push auf main)
- Supabase (SQL, Edge Functions, Auth/Storage) → Lovable-Prompt an User
- Build: `npx vite build`
- IndexNow: Edge Function `indexnow-ping`

## Pfade
- `src/components/admin/` Admin-UI (EventMap, TourStationCard, FullCalendar...)
- `src/components/ui/` shadcn/ui
- `src/integrations/supabase/types.ts` DB-Types (nach Migration aktualisieren)
- `supabase/functions/` Edge Functions (Deno)
- `supabase/migrations/` SQL

## Landingpage-Design
**BLOCKING:** Bei Arbeit an Landingpages (alle Seiten außer Index.tsx und Admin) IMMER zuerst lesen:
- `docs/landingpage-design.md` — Exakte CSS-Klassen, Verbotene Muster, Referenz = Startseite

## Regeln
- Design: Neon-Gold auf Schwarz, theatralisch, cinematisch
- UI: Deutsch | Code: Englisch
- Neue Tabellen: immer RLS (Admin + Service Role)
- Toasts: `useToast()` oder `sonner`
- Soft Deletes: `deleted_at` wo sinnvoll
- KL = Amber/Orange, KBA = Emerald/Grün (Source-Farben)

## Responsive Design
- Mobile-first: Immer zuerst für kleine Screens, dann nach oben erweitern
- Breakpoints: 480px (small), 768px (tablet), 1024px (laptop), 1280px (desktop), 1536px (large)
- Keine festen Pixelwerte für Layouts — relative Einheiten (%, rem, vw, vh)
- Fluid Typography mit `clamp()`: z.B. `font-size: clamp(1rem, 2.5vw, 2rem)`
- Bilder: `max-width: 100%; height: auto;`
- Touch-Targets mindestens 44x44px
- Kein horizontales Scrollen auf irgendeinem Gerät

## Layout-Regeln
- CSS Grid und Flexbox, keine Floats
- Grid mit `auto-fit` / `auto-fill` und `minmax()` für responsive Raster
- Navigation wird unter 768px zum Burger-/Off-Canvas-Menü
- Seitenleisten stacken auf Mobile untereinander
- Tabellen auf Mobile als Cards oder horizontal scrollbar
- Abstände skalieren mit Viewport (clamp oder Media Queries)

## CSS-Qualität
- CSS Custom Properties für Farben, Abstände, Schriftgrößen, Radien
- Keine Inline-Styles (Ausnahme: dynamische Werte wie background-image)
- Kein `!important` außer in absoluten Ausnahmefällen
- Keine unbenutzten CSS-Regeln hinterlassen

## Design-Qualität
- Kein generisches AI-Design: keine Standard-Fonts (Arial, Inter, Roboto), keine vorhersehbaren Layouts
- Typografie-Hierarchie: Display → Heading → Body → Caption
- Konsistente Spacing-Skala (4px-Basis: 4, 8, 12, 16, 24, 32, 48, 64)
- Farbkontraste: WCAG AA mindestens (4.5:1 Text, 3:1 große Elemente)
- Animationen sparsam — lieber eine gute Transition als zehn halbgare
- Hintergründe mit Tiefe: Gradienten, Texturen, Overlays statt flacher Einfarbigkeit
- Hover- und Fokus-Zustände für alle interaktiven Elemente

## Barrierefreiheit
- Semantisches HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>`
- Alle Bilder mit sinnvollem `alt`-Text
- Fokus-Reihenfolge logisch und sichtbar (kein `outline: none` ohne Alternative)
- ARIA-Labels nur wo nötig — semantisches HTML bevorzugen
- Formulare mit zugeordneten `<label>`-Elementen

## Performance
- Bilder in WebP/AVIF mit Fallback
- Lazy Loading unterhalb des Folds: `loading="lazy"`
- Fonts mit `font-display: swap`
- Keine unnötigen Bibliotheken einbinden

## Arbeitsweise
- Vor jeder Änderung den aktuellen Stand auf verschiedenen Viewports prüfen
- Nach jeder Änderung auf mindestens drei Breakpoints testen (Mobile, Tablet, Desktop)
- Bestehende Design-Entscheidungen respektieren und konsistent weiterführen
- Bei Unklarheiten nachfragen statt Annahmen treffen
- Keine Dateien löschen oder überschreiben ohne Rücksprache
