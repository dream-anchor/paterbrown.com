-- Add photographer info columns to picks_folders table
ALTER TABLE public.picks_folders 
ADD COLUMN photographer_name TEXT,
ADD COLUMN photographer_email TEXT,
ADD COLUMN photographer_phone TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.picks_folders.photographer_name IS 'Name of the photographer for this album';
COMMENT ON COLUMN public.picks_folders.photographer_email IS 'Email contact of the photographer';
COMMENT ON COLUMN public.picks_folders.photographer_phone IS 'Phone contact of the photographer';