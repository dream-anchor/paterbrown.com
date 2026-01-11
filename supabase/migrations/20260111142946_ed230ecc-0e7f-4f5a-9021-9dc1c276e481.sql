-- Create table for Deutsche Bahn station EVA number mapping
CREATE TABLE public.db_station_mapping (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    city_name text NOT NULL,
    station_name text NOT NULL,
    eva_number text NOT NULL,
    ds100_code text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT db_station_mapping_eva_unique UNIQUE (eva_number)
);

-- Create index for fast city lookups
CREATE INDEX idx_db_station_city ON public.db_station_mapping (city_name);
CREATE INDEX idx_db_station_name ON public.db_station_mapping (station_name);

-- Enable RLS
ALTER TABLE public.db_station_mapping ENABLE ROW LEVEL SECURITY;

-- Public read access (station data is public)
CREATE POLICY "Anyone can view station mappings"
ON public.db_station_mapping
FOR SELECT
USING (true);

-- Only admins can manage station mappings
CREATE POLICY "Admins can manage station mappings"
ON public.db_station_mapping
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage mappings (for edge functions)
CREATE POLICY "Service role can manage station mappings"
ON public.db_station_mapping
FOR ALL
USING (auth.role() = 'service_role');

-- Insert common German stations
INSERT INTO public.db_station_mapping (city_name, station_name, eva_number, ds100_code) VALUES
('Bremen', 'Bremen Hbf', '8000050', 'HB'),
('Hamburg', 'Hamburg Hbf', '8002549', 'AH'),
('Hamburg', 'Hamburg-Altona', '8002553', 'AAS'),
('Hamburg', 'Hamburg Dammtor', '8002548', 'AHAR'),
('München', 'München Hbf', '8000261', 'MH'),
('München', 'München Ost', '8000262', 'MO'),
('Berlin', 'Berlin Hbf', '8011160', 'BLS'),
('Berlin', 'Berlin Südkreuz', '8011113', 'BSKR'),
('Berlin', 'Berlin Gesundbrunnen', '8011102', 'BGES'),
('Berlin', 'Berlin Ostbahnhof', '8010255', 'BHF'),
('Frankfurt', 'Frankfurt(Main)Hbf', '8000105', 'FF'),
('Frankfurt', 'Frankfurt(M) Flughafen Fernbf', '8070003', 'FFFLF'),
('Frankfurt', 'Frankfurt(Main)Süd', '8002041', 'FFS'),
('Köln', 'Köln Hbf', '8000207', 'KK'),
('Köln', 'Köln Messe/Deutz', '8003368', 'KKDZ'),
('Düsseldorf', 'Düsseldorf Hbf', '8000085', 'KD'),
('Stuttgart', 'Stuttgart Hbf', '8000096', 'TS'),
('Hannover', 'Hannover Hbf', '8000152', 'HH'),
('Leipzig', 'Leipzig Hbf', '8010205', 'LL'),
('Dresden', 'Dresden Hbf', '8010085', 'DH'),
('Nürnberg', 'Nürnberg Hbf', '8000284', 'NN'),
('Mannheim', 'Mannheim Hbf', '8000244', 'RM'),
('Karlsruhe', 'Karlsruhe Hbf', '8000191', 'RK'),
('Essen', 'Essen Hbf', '8000098', 'EE'),
('Dortmund', 'Dortmund Hbf', '8000080', 'EDO'),
('Augsburg', 'Augsburg Hbf', '8000013', 'MA'),
('Freiburg', 'Freiburg(Breisgau) Hbf', '8000107', 'RF'),
('Würzburg', 'Würzburg Hbf', '8000260', 'NW'),
('Kassel', 'Kassel-Wilhelmshöhe', '8003200', 'FKW'),
('Fulda', 'Fulda', '8000115', 'FFU'),
('Erfurt', 'Erfurt Hbf', '8010101', 'UE'),
('Halle', 'Halle(Saale)Hbf', '8010159', 'LH'),
('Magdeburg', 'Magdeburg Hbf', '8010224', 'LM'),
('Rostock', 'Rostock Hbf', '8010304', 'WR'),
('Kiel', 'Kiel Hbf', '8000199', 'AK'),
('Lübeck', 'Lübeck Hbf', '8000237', 'AL'),
('Braunschweig', 'Braunschweig Hbf', '8000049', 'HBS'),
('Göttingen', 'Göttingen', '8000128', 'HG'),
('Ulm', 'Ulm Hbf', '8000170', 'TU'),
('Regensburg', 'Regensburg Hbf', '8000309', 'NRB'),
('Passau', 'Passau Hbf', '8000298', 'NPA'),
('Wiesbaden', 'Wiesbaden Hbf', '8000250', 'FWI'),
('Mainz', 'Mainz Hbf', '8000240', 'FMZ'),
('Bonn', 'Bonn Hbf', '8000044', 'KB'),
('Aachen', 'Aachen Hbf', '8000001', 'KA'),
('Münster', 'Münster(Westf)Hbf', '8000263', 'EMST'),
('Osnabrück', 'Osnabrück Hbf', '8000294', 'HO'),
('Bielefeld', 'Bielefeld Hbf', '8000036', 'EBIL'),
('Hamm', 'Hamm(Westf)Hbf', '8000149', 'EHM'),
('Heidelberg', 'Heidelberg Hbf', '8000156', 'RH'),
('Saarbrücken', 'Saarbrücken Hbf', '8000323', 'SSB')
ON CONFLICT (eva_number) DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_db_station_mapping_updated_at
BEFORE UPDATE ON public.db_station_mapping
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();