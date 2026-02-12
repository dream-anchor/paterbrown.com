-- Add ticket_info (free text: VVK description, phone, address, etc.)
-- and ticket_type (online, telefon, vor_ort, abendkasse, email, gemischt, unbekannt)
ALTER TABLE admin_events ADD COLUMN IF NOT EXISTS ticket_info TEXT;
ALTER TABLE admin_events ADD COLUMN IF NOT EXISTS ticket_type TEXT;
