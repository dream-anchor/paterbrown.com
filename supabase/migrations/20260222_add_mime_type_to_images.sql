-- Add mime_type column to images table for video support
ALTER TABLE images ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT NULL;

-- Backfill existing rows based on file extension
UPDATE images SET mime_type = CASE
  WHEN file_name ILIKE '%.jpg' OR file_name ILIKE '%.jpeg' THEN 'image/jpeg'
  WHEN file_name ILIKE '%.png' THEN 'image/png'
  WHEN file_name ILIKE '%.webp' THEN 'image/webp'
  WHEN file_name ILIKE '%.gif' THEN 'image/gif'
  WHEN file_name ILIKE '%.heic' THEN 'image/heic'
  WHEN file_name ILIKE '%.mp4' THEN 'video/mp4'
  WHEN file_name ILIKE '%.mov' THEN 'video/quicktime'
  WHEN file_name ILIKE '%.webm' THEN 'video/webm'
  WHEN file_name ILIKE '%.m4v' THEN 'video/x-m4v'
  ELSE 'image/jpeg'
END
WHERE mime_type IS NULL;
