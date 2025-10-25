-- Drop the overly permissive policy that allows all authenticated users to view subscriber emails
DROP POLICY IF EXISTS "Only authenticated users can view subscribers" ON public.newsletter_subscribers;

-- Keep only the INSERT policy for public newsletter signups
-- No SELECT policy means no one can read the subscriber data except via direct database access