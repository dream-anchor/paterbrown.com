-- Create table for document share links with expiration
CREATE TABLE public.document_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.internal_documents(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone,
  password_hash text,
  max_downloads integer,
  download_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create index for faster token lookups
CREATE INDEX idx_document_share_links_token ON public.document_share_links(token);
CREATE INDEX idx_document_share_links_document_id ON public.document_share_links(document_id);

-- Enable RLS
ALTER TABLE public.document_share_links ENABLE ROW LEVEL SECURITY;

-- Admins can manage share links
CREATE POLICY "Admins can manage share links"
ON public.document_share_links
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view share links (needed for download validation)
CREATE POLICY "Anyone can view share links for validation"
ON public.document_share_links
FOR SELECT
USING (true);

-- Anyone can update download count
CREATE POLICY "Anyone can increment download count"
ON public.document_share_links
FOR UPDATE
USING (true)
WITH CHECK (true);