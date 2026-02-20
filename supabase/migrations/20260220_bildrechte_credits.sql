-- Add project_name + contact_email to picks_folders
ALTER TABLE picks_folders
  ADD COLUMN IF NOT EXISTS project_name   TEXT DEFAULT 'Pater Brown – Das Live-Hörspiel',
  ADD COLUMN IF NOT EXISTS contact_email  TEXT DEFAULT 'info@pater-brown.live';

-- Add credits to pending_drops (Fotograf, Projekt, Kontakt)
ALTER TABLE pending_drops
  ADD COLUMN IF NOT EXISTS photographer_name  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS project_name       TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email      TEXT DEFAULT '';

-- Add credits to document_share_bundles
ALTER TABLE document_share_bundles
  ADD COLUMN IF NOT EXISTS photographer_name  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS project_name       TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email      TEXT DEFAULT '';
