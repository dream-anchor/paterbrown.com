ALTER TABLE picks_folders
  ADD COLUMN IF NOT EXISTS project_name   TEXT DEFAULT 'Pater Brown – Das Live-Hörspiel',
  ADD COLUMN IF NOT EXISTS contact_email  TEXT DEFAULT 'info@pater-brown.live';

ALTER TABLE pending_drops
  ADD COLUMN IF NOT EXISTS photographer_name  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS project_name       TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email      TEXT DEFAULT '';

ALTER TABLE document_share_bundles
  ADD COLUMN IF NOT EXISTS photographer_name  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS project_name       TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email      TEXT DEFAULT '';