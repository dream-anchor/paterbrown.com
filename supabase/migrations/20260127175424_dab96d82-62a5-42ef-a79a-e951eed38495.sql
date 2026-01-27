-- ============================================
-- SOFT DELETE / TRASH SYSTEM
-- Adds soft_deleted_at to all relevant tables
-- and creates a unified trash_items view
-- ============================================

-- 1. Add soft delete columns to picks_folders (Albums)
ALTER TABLE public.picks_folders 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- 2. Add soft delete columns to images
ALTER TABLE public.images 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- 3. Add soft delete columns to internal_documents (Drops)
ALTER TABLE public.internal_documents 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- 4. Add soft delete columns to travel_bookings
ALTER TABLE public.travel_bookings 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- 5. Add soft delete columns to travel_trips
ALTER TABLE public.travel_trips 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- 6. Add soft delete columns to calendar_events
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- 7. Add soft delete columns to admin_events
ALTER TABLE public.admin_events 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- Create indexes for efficient trash queries
CREATE INDEX IF NOT EXISTS idx_picks_folders_deleted_at ON public.picks_folders(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_images_deleted_at ON public.images(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_internal_documents_deleted_at ON public.internal_documents(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_travel_bookings_deleted_at ON public.travel_bookings(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_travel_trips_deleted_at ON public.travel_trips(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calendar_events_deleted_at ON public.calendar_events(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_events_deleted_at ON public.admin_events(deleted_at) WHERE deleted_at IS NOT NULL;

-- Create unified trash view for easy querying
CREATE OR REPLACE VIEW public.trash_items AS
SELECT 
  id,
  'album' as item_type,
  name as title,
  NULL as description,
  deleted_at,
  deleted_by,
  created_by as owner_id,
  created_at
FROM public.picks_folders
WHERE deleted_at IS NOT NULL

UNION ALL

SELECT 
  id,
  'image' as item_type,
  COALESCE(title, file_name) as title,
  NULL as description,
  deleted_at,
  deleted_by,
  uploaded_by as owner_id,
  created_at
FROM public.images
WHERE deleted_at IS NOT NULL

UNION ALL

SELECT 
  id,
  'document' as item_type,
  name as title,
  category::text as description,
  deleted_at,
  deleted_by,
  uploaded_by as owner_id,
  created_at
FROM public.internal_documents
WHERE deleted_at IS NOT NULL

UNION ALL

SELECT 
  id,
  'booking' as item_type,
  CONCAT(booking_type::text, ': ', destination_city) as title,
  provider as description,
  deleted_at,
  deleted_by,
  NULL as owner_id,
  created_at
FROM public.travel_bookings
WHERE deleted_at IS NOT NULL

UNION ALL

SELECT 
  id,
  'trip' as item_type,
  trip_name as title,
  notes as description,
  deleted_at,
  deleted_by,
  NULL as owner_id,
  created_at
FROM public.travel_trips
WHERE deleted_at IS NOT NULL

UNION ALL

SELECT 
  id,
  'calendar_event' as item_type,
  title,
  location as description,
  deleted_at,
  deleted_by,
  NULL as owner_id,
  created_at
FROM public.calendar_events
WHERE deleted_at IS NOT NULL

UNION ALL

SELECT 
  id,
  'admin_event' as item_type,
  title,
  location as description,
  deleted_at,
  deleted_by,
  NULL as owner_id,
  created_at
FROM public.admin_events
WHERE deleted_at IS NOT NULL;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.trash_items TO authenticated;

-- RLS policies remain on base tables, view inherits them