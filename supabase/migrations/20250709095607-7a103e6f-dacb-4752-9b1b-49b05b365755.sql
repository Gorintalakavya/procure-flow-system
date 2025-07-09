
-- Create vendor_drafts table for saving draft registrations
CREATE TABLE public.vendor_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  legal_entity_name TEXT,
  trade_name TEXT,
  vendor_type TEXT,
  year_established TEXT,
  business_description TEXT,
  contact_name TEXT,
  email TEXT,
  phone_number TEXT,
  website TEXT,
  street_address TEXT,
  street_address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  custom_country TEXT,
  employee_count TEXT,
  annual_revenue TEXT,
  products_services_description TEXT,
  tax_id TEXT,
  vat_id TEXT,
  bank_account_details TEXT,
  payment_terms TEXT,
  currency TEXT,
  registration_status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_drafts ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to vendor drafts
CREATE POLICY "Public can manage vendor_drafts" 
ON public.vendor_drafts 
FOR ALL 
USING (true);

-- Add document_url column to documents table if it doesn't exist
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS document_url TEXT;
