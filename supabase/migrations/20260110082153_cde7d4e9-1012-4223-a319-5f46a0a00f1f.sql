-- Add INSERT policy for travel_emails so admins can insert via browser client
CREATE POLICY "Admins can insert emails via client"
  ON travel_emails
  FOR INSERT
  TO public
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));