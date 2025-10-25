-- Add event_date column for proper chronological sorting
ALTER TABLE tour_events 
ADD COLUMN event_date date;

-- Convert existing DD.MM.YYYY dates to YYYY-MM-DD format
UPDATE tour_events
SET event_date = to_date(date, 'DD.MM.YYYY')
WHERE event_date IS NULL;

-- Make the column required now that data is migrated
ALTER TABLE tour_events 
ALTER COLUMN event_date SET NOT NULL;

-- Add index for performance
CREATE INDEX idx_tour_events_event_date ON tour_events(event_date);

-- Add comment for documentation
COMMENT ON COLUMN tour_events.event_date IS 'Parsed date in ISO format (YYYY-MM-DD) for sorting and filtering. The date column remains for display in DD.MM.YYYY format.';