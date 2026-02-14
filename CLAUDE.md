# paterbrown.com

## Stack
React/TS + Vite, shadcn/ui, Tailwind | Supabase (Postgres + Edge Functions) | Leaflet Maps

## Deployment
- Code → commit + push → auto-deploy (User prüft Live-Site, nicht lokal)
- Supabase (SQL, Edge Functions, Auth/Storage) → Lovable-Prompt an User
- Build: `npx vite build`
- IndexNow: Edge Function `indexnow-ping`

## Pfade
- `src/components/admin/` Admin-UI (EventMap, TourStationCard, FullCalendar...)
- `src/components/ui/` shadcn/ui
- `src/integrations/supabase/types.ts` DB-Types (nach Migration aktualisieren)
- `supabase/functions/` Edge Functions (Deno)
- `supabase/migrations/` SQL

## Regeln
- Design: Glassmorphism, monochrom, Apple-inspired
- UI: Deutsch | Code: Englisch
- Neue Tabellen: immer RLS (Admin + Service Role)
- Toasts: `useToast()` oder `sonner`
- Soft Deletes: `deleted_at` wo sinnvoll
- KL = Amber/Orange, KBA = Emerald/Grün (Source-Farben)
