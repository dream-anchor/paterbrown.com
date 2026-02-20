-- pending_drops: Persistiert Picks→Drops Auswahl in der Datenbank.
-- Überlebt Tab-Wechsel, Page-Reload, Browser-Neustart.

CREATE TABLE IF NOT EXISTS pending_drops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_ids TEXT[] NOT NULL DEFAULT '{}',
  label TEXT DEFAULT 'Picks-Auswahl',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pending_drops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pending drops"
  ON pending_drops FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Realtime aktivieren (damit DocumentsPanel sofort reagiert)
ALTER PUBLICATION supabase_realtime ADD TABLE pending_drops;
