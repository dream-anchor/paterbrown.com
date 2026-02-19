-- ============================================
-- DOCUMENT SHARE BUNDLES
-- Erlaubt mehrere Dateien als Paket zu teilen
-- ============================================

CREATE TABLE IF NOT EXISTS public.document_share_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  expires_at timestamptz DEFAULT NULL,
  password_hash text DEFAULT NULL,
  max_downloads integer DEFAULT NULL,
  download_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid NOT NULL REFERENCES public.document_share_bundles(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.internal_documents(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.document_share_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_bundle_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active bundles"
  ON public.document_share_bundles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read bundle items"
  ON public.document_bundle_items FOR SELECT
  USING (true);

CREATE POLICY "Auth users create bundles"
  ON public.document_share_bundles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users create bundle items"
  ON public.document_bundle_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RPC: Download-Count incrementieren
CREATE OR REPLACE FUNCTION public.increment_bundle_download(p_token text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_bundle public.document_share_bundles;
BEGIN
  SELECT * INTO v_bundle
  FROM public.document_share_bundles
  WHERE token = p_token AND is_active = true;

  IF NOT FOUND THEN RETURN false; END IF;
  IF v_bundle.expires_at IS NOT NULL AND v_bundle.expires_at < now() THEN RETURN false; END IF;
  IF v_bundle.max_downloads IS NOT NULL AND v_bundle.download_count >= v_bundle.max_downloads THEN RETURN false; END IF;

  UPDATE public.document_share_bundles
  SET download_count = download_count + 1
  WHERE token = p_token;

  RETURN true;
END;
$$;
