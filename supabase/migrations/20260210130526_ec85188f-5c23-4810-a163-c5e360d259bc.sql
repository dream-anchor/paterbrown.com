
-- ============================================================
-- Pending Traveler Approvals
-- ============================================================

CREATE TABLE public.pending_traveler_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extracted_name TEXT NOT NULL,
  extracted_first_name TEXT,
  extracted_last_name TEXT,
  best_match_name TEXT,
  best_match_score INTEGER DEFAULT 0,
  best_match_profile_id UUID REFERENCES public.traveler_profiles(id) ON DELETE SET NULL,
  source_email_id UUID REFERENCES public.travel_emails(id) ON DELETE SET NULL,
  source_attachment_id UUID REFERENCES public.travel_attachments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_profile_id UUID REFERENCES public.traveler_profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Validation trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_pending_approval_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'approved', 'linked', 'dismissed') THEN
    RAISE EXCEPTION 'Invalid status: %. Must be one of: pending, approved, linked, dismissed', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_pending_approval_status_trigger
BEFORE INSERT OR UPDATE ON public.pending_traveler_approvals
FOR EACH ROW
EXECUTE FUNCTION public.validate_pending_approval_status();

-- RLS
ALTER TABLE public.pending_traveler_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all pending approvals"
ON public.pending_traveler_approvals FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can manage pending approvals"
ON public.pending_traveler_approvals FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role can manage pending approvals"
ON public.pending_traveler_approvals FOR ALL
USING (auth.role() = 'service_role');

-- Updated_at Trigger
CREATE TRIGGER update_pending_traveler_approvals_updated_at
BEFORE UPDATE ON public.pending_traveler_approvals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_pending_approvals_status ON public.pending_traveler_approvals(status);
CREATE INDEX idx_pending_approvals_extracted_name ON public.pending_traveler_approvals(extracted_name);
CREATE INDEX idx_pending_approvals_email_id ON public.pending_traveler_approvals(source_email_id);

-- RPC: Replace traveler name in arrays
CREATE OR REPLACE FUNCTION public.replace_traveler_name_in_arrays(
  old_name TEXT,
  new_name TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE travel_bookings
  SET traveler_names = array_replace(traveler_names, old_name, new_name),
      updated_at = now()
  WHERE old_name = ANY(traveler_names);
END;
$$;
