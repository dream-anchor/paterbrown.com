-- Add ticket_url columns to admin_events
ALTER TABLE admin_events ADD COLUMN IF NOT EXISTS ticket_url TEXT;
ALTER TABLE admin_events ADD COLUMN IF NOT EXISTS ticket_url_approved BOOLEAN DEFAULT false;

-- Add source column to tour_events
ALTER TABLE tour_events ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'KBA';