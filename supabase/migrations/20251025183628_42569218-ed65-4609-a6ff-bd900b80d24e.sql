-- Create tour_events table
CREATE TABLE public.tour_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  eventim_event_id TEXT UNIQUE,
  date TEXT NOT NULL,
  day TEXT NOT NULL,
  city TEXT NOT NULL,
  venue TEXT NOT NULL,
  note TEXT,
  ticket_url TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tour_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view active tour events"
ON public.tour_events
FOR SELECT
USING (is_active = true);

-- Create index for faster queries
CREATE INDEX idx_tour_events_date ON public.tour_events(date);
CREATE INDEX idx_tour_events_active ON public.tour_events(is_active);

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;