-- Create document category enum
CREATE TYPE public.document_category AS ENUM (
  'dossier_produktion',
  'dossier_presse', 
  'flyer',
  'other'
);

-- Create internal_documents table
CREATE TABLE public.internal_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category public.document_category NOT NULL DEFAULT 'other',
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  content_type TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.internal_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admins can manage documents
CREATE POLICY "Admins can view all documents"
ON public.internal_documents
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert documents"
ON public.internal_documents
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update documents"
ON public.internal_documents
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete documents"
ON public.internal_documents
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view documents (for download page)
CREATE POLICY "Anyone can view documents for download"
ON public.internal_documents
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_internal_documents_updated_at
BEFORE UPDATE ON public.internal_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create public storage bucket for internal documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('internal-documents', 'internal-documents', true, 52428800);

-- Storage policies: Admins can upload/manage, anyone can view
CREATE POLICY "Anyone can view internal documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'internal-documents');

CREATE POLICY "Admins can upload internal documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'internal-documents' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update internal documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'internal-documents' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete internal documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'internal-documents' AND has_role(auth.uid(), 'admin'::app_role));