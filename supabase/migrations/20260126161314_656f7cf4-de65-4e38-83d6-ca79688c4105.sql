-- Create image_votes table for 3-state voting system (Ampel)
CREATE TABLE public.image_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_id UUID NOT NULL REFERENCES public.images(id) ON DELETE CASCADE,
  vote_status TEXT NOT NULL CHECK (vote_status IN ('approved', 'unsure', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, image_id)
);

-- Enable Row Level Security
ALTER TABLE public.image_votes ENABLE ROW LEVEL SECURITY;

-- Admins can view all votes
CREATE POLICY "Admins can view all votes"
ON public.image_votes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can manage their own votes
CREATE POLICY "Users can manage their own votes"
ON public.image_votes
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_image_votes_image_id ON public.image_votes(image_id);
CREATE INDEX idx_image_votes_user_id ON public.image_votes(user_id);

-- Add uploaded_by column to images if it doesn't exist (for owner-only delete)
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS uploaded_by UUID;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_image_votes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_image_votes_updated_at
BEFORE UPDATE ON public.image_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_image_votes_updated_at();