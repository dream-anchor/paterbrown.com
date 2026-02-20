
-- Allow public SELECT on images metadata (needed for bundle download page)
CREATE POLICY "Anyone can view images for bundles"
ON public.images
FOR SELECT
USING (true);

-- Drop the old authenticated-only policy
DROP POLICY IF EXISTS "Authenticated users can view images" ON public.images;
