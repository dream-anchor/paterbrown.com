
ALTER TABLE public.document_share_bundles
  ADD COLUMN IF NOT EXISTS image_ids TEXT[] DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.get_admin_user_names()
RETURNS TABLE (user_id UUID, display_name TEXT, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ur.user_id::UUID,
    COALESCE(
      NULLIF(TRIM(COALESCE(tp.first_name, '') || ' ' || COALESCE(tp.last_name, '')), ''),
      au.email,
      LEFT(ur.user_id::TEXT, 8)
    ) AS display_name,
    au.email
  FROM user_roles ur
  LEFT JOIN traveler_profiles tp ON tp.user_id = ur.user_id
  LEFT JOIN auth.users au ON au.id = ur.user_id
  WHERE ur.role = 'admin';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_user_names() TO authenticated;
