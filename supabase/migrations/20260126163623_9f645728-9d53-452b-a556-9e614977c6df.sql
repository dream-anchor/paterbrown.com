-- Add thumbnail_url and preview_url columns to images table
ALTER TABLE public.images 
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS preview_url text;

-- Add comment for documentation
COMMENT ON COLUMN public.images.thumbnail_url IS 'URL to 400px thumbnail version for grid display';
COMMENT ON COLUMN public.images.preview_url IS 'URL to 1600px preview version for lightbox display';