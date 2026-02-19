-- Add image_ids array to document_share_bundles
-- Allows bundling picks images alongside or instead of internal documents

ALTER TABLE document_share_bundles
  ADD COLUMN IF NOT EXISTS image_ids TEXT[] DEFAULT '{}';
