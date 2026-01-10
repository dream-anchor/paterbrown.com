-- Routen-Cache Tabelle für die Tour-Karte
CREATE TABLE public.cached_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_lat NUMERIC NOT NULL,
  from_lng NUMERIC NOT NULL,
  to_lat NUMERIC NOT NULL,
  to_lng NUMERIC NOT NULL,
  distance_km INTEGER NOT NULL,
  duration_min INTEGER NOT NULL,
  route_geometry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Unique auf gerundete Koordinaten (4 Dezimalstellen = ~11m Genauigkeit)
  CONSTRAINT unique_route UNIQUE(from_lat, from_lng, to_lat, to_lng)
);

-- RLS aktivieren
ALTER TABLE public.cached_routes ENABLE ROW LEVEL SECURITY;

-- Jeder kann Routen lesen (für die Karte)
CREATE POLICY "Anyone can view cached routes"
ON public.cached_routes
FOR SELECT
USING (true);

-- Admins können Routen verwalten
CREATE POLICY "Admins can manage cached routes"
ON public.cached_routes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role kann auch (für Edge Functions)
CREATE POLICY "Service role can manage routes"
ON public.cached_routes
FOR ALL
USING (auth.role() = 'service_role'::text);

-- Erweitere travel_bookings für Datenqualität
ALTER TABLE public.travel_bookings 
ADD COLUMN IF NOT EXISTS merged_from UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_quality_score NUMERIC DEFAULT 1.0;

-- Index für schnelle Routen-Lookups
CREATE INDEX idx_cached_routes_coords ON public.cached_routes(from_lat, from_lng, to_lat, to_lng);