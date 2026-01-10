-- Fix the overly permissive "Admins can manage all profiles" policy
-- Drop and recreate with explicit WITH CHECK
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.traveler_profiles;

CREATE POLICY "Admins can manage all profiles"
  ON public.traveler_profiles FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));