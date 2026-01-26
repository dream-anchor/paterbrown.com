-- Drop overly permissive UPDATE policy
DROP POLICY "Anyone can increment download count" ON public.document_share_links;

-- Create a more restrictive approach: use a function for download counting
CREATE OR REPLACE FUNCTION public.increment_share_link_download(p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link record;
BEGIN
  -- Get the share link
  SELECT * INTO v_link
  FROM public.document_share_links
  WHERE token = p_token;
  
  -- Check if link exists
  IF v_link IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if expired
  IF v_link.expires_at IS NOT NULL AND v_link.expires_at < now() THEN
    RETURN false;
  END IF;
  
  -- Check if max downloads reached
  IF v_link.max_downloads IS NOT NULL AND v_link.download_count >= v_link.max_downloads THEN
    RETURN false;
  END IF;
  
  -- Increment download count
  UPDATE public.document_share_links
  SET download_count = download_count + 1
  WHERE id = v_link.id;
  
  RETURN true;
END;
$$;