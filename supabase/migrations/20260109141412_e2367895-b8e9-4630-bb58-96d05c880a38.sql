-- Unique Index für file_path (verhindert exakt gleiche Uploads)
CREATE UNIQUE INDEX IF NOT EXISTS idx_travel_attachments_file_path 
ON travel_attachments(file_path);