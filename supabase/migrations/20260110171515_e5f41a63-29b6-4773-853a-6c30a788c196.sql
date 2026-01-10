-- Add QR code columns to travel_attachments
ALTER TABLE travel_attachments
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS qr_code_image_path TEXT;

-- Add document_type column to travel_attachments for better PDF naming
ALTER TABLE travel_attachments
ADD COLUMN IF NOT EXISTS document_type TEXT;