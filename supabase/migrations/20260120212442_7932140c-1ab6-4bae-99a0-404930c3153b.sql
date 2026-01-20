-- Add venue contact details to admin_events
ALTER TABLE public.admin_events
ADD COLUMN IF NOT EXISTS venue_address TEXT,
ADD COLUMN IF NOT EXISTS venue_phone TEXT,
ADD COLUMN IF NOT EXISTS venue_email TEXT;