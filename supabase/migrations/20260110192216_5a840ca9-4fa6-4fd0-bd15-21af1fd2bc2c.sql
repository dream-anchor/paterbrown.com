-- Add qr_code_url to travel_bookings for storing the extracted QR code image URL
ALTER TABLE travel_bookings
ADD COLUMN qr_code_url TEXT;

COMMENT ON COLUMN travel_bookings.qr_code_url IS 'URL zum extrahierten QR/Aztec-Code Bild für schnelle Dashboard-Anzeige';

-- Create public storage bucket for QR code images
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-codes', 'qr-codes', true);

-- RLS Policy: Everyone can view QR codes (public bucket)
CREATE POLICY "Public QR code access"
ON storage.objects FOR SELECT
USING (bucket_id = 'qr-codes');

-- RLS Policy: Service role can upload QR codes
CREATE POLICY "Service role can upload QR codes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'qr-codes');