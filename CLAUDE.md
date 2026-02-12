# paterbrown.com

## Stack
React/TS + Vite, shadcn/ui, Tailwind | Supabase (Postgres + Edge Functions) | Leaflet Maps

## Workflow
- Claude Code: Code, Git, Build, Frontend, Migrationen schreiben
- Lovable: SQL deployen, DB-Queries, Edge Function deploy, Auth/Storage config
- Deploy: `git push` → auto-deploy → User prueft auf Live-Site (nicht lokal!)
- Build: `npx vite build`
- IndexNow: Edge Function `indexnow-ping` fuer Suchmaschinen-Ping

## Pfade
- `src/components/admin/` Admin-UI (EventMap, TourStationCard, FullCalendar...)
- `src/components/ui/` shadcn/ui
- `src/integrations/supabase/types.ts` DB-Types (nach Migration aktualisieren)
- `supabase/functions/` Edge Functions (Deno)
- `supabase/migrations/` SQL

## Regeln
- Design: Glassmorphism, monochrom, Apple-inspired
- UI: Deutsche Labels | Code: Englische Variablen/Kommentare
- Neue Tabellen: immer RLS (Admin + Service Role)
- Toasts: `useToast()` oder `sonner`
- Soft Deletes: `deleted_at` wo sinnvoll
- KL = Amber/Orange, KBA = Emerald/Gruen (Source-Farben)
