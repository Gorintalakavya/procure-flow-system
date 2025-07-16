
-- Add missing fields to vendors table
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS operating_status TEXT,
ADD COLUMN IF NOT EXISTS stock_symbol TEXT,
ADD COLUMN IF NOT EXISTS duns_number TEXT;

-- Create verification_documents table
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id CHARACTER VARYING REFERENCES public.vendors(vendor_id),
  ein_verification_letter TEXT,
  articles_of_incorporation TEXT,
  business_licenses TEXT,
  w9_form TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on verification_documents
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to verification_documents
CREATE POLICY "Public can manage verification_documents" 
ON public.verification_documents 
FOR ALL 
USING (true);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_verification_documents_updated_at
    BEFORE UPDATE ON public.verification_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
