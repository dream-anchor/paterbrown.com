-- Tabelle für Reisende-Profile mit BahnCard-Daten
CREATE TABLE public.traveler_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Persönliche Daten
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  phone_number TEXT,
  
  -- BahnCard Daten
  bahncard_type TEXT, -- z.B. "BC 25", "BC 50", "BC 100"
  bahncard_class INTEGER CHECK (bahncard_class IN (1, 2)),
  bahncard_number TEXT,
  bahncard_valid_until DATE,
  
  -- Präferenzen
  preferred_seat TEXT, -- z.B. "Fenster", "Gang", "Ruheabteil"
  preferred_class INTEGER DEFAULT 2 CHECK (preferred_class IN (1, 2)),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.traveler_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.traveler_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.traveler_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.traveler_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.traveler_profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all profiles"
  ON public.traveler_profiles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage profiles"
  ON public.traveler_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_traveler_profiles_updated_at
  BEFORE UPDATE ON public.traveler_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();