-- Create enums for travel bookings
CREATE TYPE public.booking_type AS ENUM ('hotel', 'train', 'flight', 'bus', 'rental_car', 'other');
CREATE TYPE public.booking_status AS ENUM ('confirmed', 'changed', 'cancelled', 'pending');
CREATE TYPE public.trip_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE public.email_status AS ENUM ('pending', 'processing', 'processed', 'error');

-- Create travel_trips table (main trip container)
CREATE TABLE public.travel_trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status trip_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create travel_emails table (original emails)
CREATE TABLE public.travel_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_address TEXT NOT NULL,
  to_address TEXT,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status email_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create travel_bookings table (individual bookings)
CREATE TABLE public.travel_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.travel_trips(id) ON DELETE SET NULL,
  booking_type booking_type NOT NULL,
  booking_number TEXT,
  provider TEXT,
  traveler_name TEXT,
  traveler_names TEXT[], -- for multiple travelers
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE,
  origin_city TEXT,
  destination_city TEXT NOT NULL,
  venue_name TEXT,
  venue_address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  details JSONB DEFAULT '{}'::jsonb,
  status booking_status NOT NULL DEFAULT 'confirmed',
  source_email_id UUID REFERENCES public.travel_emails(id) ON DELETE SET NULL,
  ai_confidence NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create travel_attachments table
CREATE TABLE public.travel_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID REFERENCES public.travel_emails(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.travel_bookings(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  content_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create booking_versions table (change history)
CREATE TABLE public.booking_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.travel_bookings(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  previous_data JSONB NOT NULL,
  change_summary TEXT,
  changed_by TEXT NOT NULL DEFAULT 'ai',
  source_email_id UUID REFERENCES public.travel_emails(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.travel_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for travel_trips (admin only)
CREATE POLICY "Admins can view all trips" ON public.travel_trips
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert trips" ON public.travel_trips
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update trips" ON public.travel_trips
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete trips" ON public.travel_trips
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for travel_emails (admin only)
CREATE POLICY "Admins can view all emails" ON public.travel_emails
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert emails" ON public.travel_emails
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update emails" ON public.travel_emails
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete emails" ON public.travel_emails
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for travel_bookings (admin only)
CREATE POLICY "Admins can view all bookings" ON public.travel_bookings
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert bookings" ON public.travel_bookings
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update bookings" ON public.travel_bookings
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete bookings" ON public.travel_bookings
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for travel_attachments (admin only)
CREATE POLICY "Admins can view all attachments" ON public.travel_attachments
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert attachments" ON public.travel_attachments
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update attachments" ON public.travel_attachments
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete attachments" ON public.travel_attachments
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for booking_versions (admin only)
CREATE POLICY "Admins can view all versions" ON public.booking_versions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert versions" ON public.booking_versions
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role bypass for edge functions (webhooks)
CREATE POLICY "Service role can manage emails" ON public.travel_emails
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage bookings" ON public.travel_bookings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage attachments" ON public.travel_attachments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage versions" ON public.booking_versions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage trips" ON public.travel_trips
  FOR ALL USING (auth.role() = 'service_role');

-- Triggers for updated_at
CREATE TRIGGER update_travel_trips_updated_at
  BEFORE UPDATE ON public.travel_trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_travel_emails_updated_at
  BEFORE UPDATE ON public.travel_emails
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_travel_bookings_updated_at
  BEFORE UPDATE ON public.travel_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for better query performance
CREATE INDEX idx_travel_bookings_trip_id ON public.travel_bookings(trip_id);
CREATE INDEX idx_travel_bookings_start_datetime ON public.travel_bookings(start_datetime);
CREATE INDEX idx_travel_bookings_destination_city ON public.travel_bookings(destination_city);
CREATE INDEX idx_travel_bookings_traveler_name ON public.travel_bookings(traveler_name);
CREATE INDEX idx_travel_emails_status ON public.travel_emails(status);
CREATE INDEX idx_travel_attachments_email_id ON public.travel_attachments(email_id);
CREATE INDEX idx_booking_versions_booking_id ON public.booking_versions(booking_id);

-- Create storage bucket for travel attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'travel-attachments',
  'travel-attachments',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'message/rfc822']
);

-- Storage policies for travel-attachments bucket
CREATE POLICY "Admins can view travel attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'travel-attachments' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can upload travel attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'travel-attachments' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete travel attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'travel-attachments' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage travel attachments"
  ON storage.objects FOR ALL
  USING (bucket_id = 'travel-attachments' AND auth.role() = 'service_role');