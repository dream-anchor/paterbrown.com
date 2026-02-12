-- Add ticket_url + approval flag to admin_events (for KL theater ticket links)
ALTER TABLE admin_events ADD COLUMN IF NOT EXISTS ticket_url TEXT;
ALTER TABLE admin_events ADD COLUMN IF NOT EXISTS ticket_url_approved BOOLEAN DEFAULT false;

-- Add source to tour_events (to distinguish KBA vs KL on public site)
ALTER TABLE tour_events ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'KBA';
