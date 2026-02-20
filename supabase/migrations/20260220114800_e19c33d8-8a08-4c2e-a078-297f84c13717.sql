
CREATE TABLE IF NOT EXISTS pending_drops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_ids TEXT[] NOT NULL DEFAULT '{}',
  label TEXT DEFAULT 'Picks-Auswahl',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Validation trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_pending_drops_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'sent', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status: %. Must be one of: pending, sent, cancelled', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_pending_drops_status_trigger
  BEFORE INSERT OR UPDATE ON pending_drops
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_pending_drops_status();

ALTER TABLE pending_drops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pending drops"
  ON pending_drops FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE pending_drops;
