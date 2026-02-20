-- Fix get_admin_user_names to also include all users who have voted
-- Previously only returned users with role='admin' in user_roles

CREATE OR REPLACE FUNCTION get_admin_user_names()
RETURNS TABLE (user_id UUID, display_name TEXT, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (u.id)
    u.id::UUID AS user_id,
    COALESCE(
      NULLIF(TRIM(COALESCE(tp.first_name, '') || ' ' || COALESCE(tp.last_name, '')), ''),
      au.email,
      LEFT(u.id::TEXT, 8)
    ) AS display_name,
    au.email
  FROM (
    -- All admins
    SELECT ur.user_id AS id FROM user_roles ur WHERE ur.role = 'admin'
    UNION
    -- All users who have voted
    SELECT iv.user_id AS id FROM image_votes iv
  ) u
  LEFT JOIN traveler_profiles tp ON tp.user_id = u.id
  LEFT JOIN auth.users au ON au.id = u.id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_user_names() TO authenticated;
