-- Create images table for the Picks gallery
CREATE TABLE public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  title TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create approvals table linking users to images
CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES public.images(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, image_id)
);

-- Enable RLS on both tables
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

-- Images policies: Admins can manage, everyone can view
CREATE POLICY "Admins can manage images"
ON public.images
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view images"
ON public.images
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Approvals policies
CREATE POLICY "Admins can view all approvals"
ON public.approvals
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their own approvals"
ON public.approvals
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for picks images
INSERT INTO storage.buckets (id, name, public)
VALUES ('picks-images', 'picks-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for picks-images bucket
CREATE POLICY "Admins can upload picks images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'picks-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update picks images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'picks-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete picks images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'picks-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view picks images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'picks-images');

-- Add updated_at trigger for images
CREATE TRIGGER update_images_updated_at
BEFORE UPDATE ON public.images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();