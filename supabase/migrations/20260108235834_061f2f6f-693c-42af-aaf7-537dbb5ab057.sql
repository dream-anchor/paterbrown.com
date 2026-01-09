-- Add attachment_urls column to store URLs for async processing
ALTER TABLE public.travel_emails 
ADD COLUMN IF NOT EXISTS attachment_urls JSONB DEFAULT '[]'::jsonb;