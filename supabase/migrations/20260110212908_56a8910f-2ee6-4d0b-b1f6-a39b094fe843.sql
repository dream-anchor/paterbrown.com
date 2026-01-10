-- Add auto_created column to traveler_profiles
ALTER TABLE traveler_profiles 
ADD COLUMN IF NOT EXISTS auto_created BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN traveler_profiles.auto_created IS 'True wenn das Profil automatisch aus einem Ticket erstellt wurde';