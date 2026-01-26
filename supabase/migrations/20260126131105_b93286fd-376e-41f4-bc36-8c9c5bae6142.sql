-- Add is_active flag to share links for deactivation
ALTER TABLE public.document_share_links 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Add index for faster lookups
CREATE INDEX idx_document_share_links_active ON public.document_share_links(document_id, is_active);

-- Function to deactivate all links for a document
CREATE OR REPLACE FUNCTION public.deactivate_document_share_links(p_document_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.document_share_links
  SET is_active = false
  WHERE document_id = p_document_id AND is_active = true;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;