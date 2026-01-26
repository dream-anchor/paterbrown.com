-- Create folders table for Picks
CREATE TABLE public.picks_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.picks_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add folder reference to images
ALTER TABLE public.images 
ADD COLUMN folder_id UUID REFERENCES public.picks_folders(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.picks_folders ENABLE ROW LEVEL SECURITY;

-- Folder policies
CREATE POLICY "Admins can manage folders"
ON public.picks_folders
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view folders"
ON public.picks_folders
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create index for faster folder queries
CREATE INDEX idx_images_folder_id ON public.images(folder_id);
CREATE INDEX idx_picks_folders_parent_id ON public.picks_folders(parent_id);