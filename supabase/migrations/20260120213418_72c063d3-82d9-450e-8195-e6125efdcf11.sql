-- Add tour_source and event_status columns to calendar_events
ALTER TABLE calendar_events 
  ADD COLUMN IF NOT EXISTS tour_source TEXT CHECK (tour_source IN ('KL', 'KBA')),
  ADD COLUMN IF NOT EXISTS event_status TEXT DEFAULT 'confirmed' CHECK (event_status IN ('confirmed', 'optioniert', 'cancelled'));

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_calendar_events_type_status ON calendar_events(event_type, event_status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_tour_source ON calendar_events(tour_source) WHERE tour_source IS NOT NULL;