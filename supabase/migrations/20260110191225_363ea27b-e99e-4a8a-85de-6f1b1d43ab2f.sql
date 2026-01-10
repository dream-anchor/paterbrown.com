-- Add traveler_name column to travel_attachments for Multi-User-Split logic
ALTER TABLE travel_attachments
ADD COLUMN traveler_name text;

COMMENT ON COLUMN travel_attachments.traveler_name IS 
  'Name des Reisenden, der im Dokument identifiziert wurde (für Multi-User-Split bei E-Mails mit mehreren Tickets)';