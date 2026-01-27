-- Fix the security issue: Make the view use security_invoker instead of security_definer
DROP VIEW IF EXISTS public.trash_items;

CREATE VIEW public.trash_items 
WITH (security_invoker = on) AS
SELECT 
  id,
  'album' as item_type,
  name as title,
  NULL::text as description,
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
  NULL::text as description,
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
  NULL::uuid as owner_id,
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
  NULL::uuid as owner_id,
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
  NULL::uuid as owner_id,
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
  NULL::uuid as owner_id,
  created_at
FROM public.admin_events
WHERE deleted_at IS NOT NULL;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.trash_items TO authenticated;