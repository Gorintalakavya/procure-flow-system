
-- Create admin users table for proper admin authentication
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users
CREATE POLICY "Admin users can manage themselves" 
  ON public.admin_users 
  FOR ALL 
  USING (true);

-- Insert a default admin user for testing
INSERT INTO public.admin_users (email, password_hash, name) 
VALUES ('kavyagorintala123@gmail.com', 'password123', 'Admin User')
ON CONFLICT (email) DO NOTHING;

-- Update vendors table to include all required fields
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS street_address_line2 TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS vat_id TEXT,
ADD COLUMN IF NOT EXISTS payment_terms TEXT,
ADD COLUMN IF NOT EXISTS bank_account_details TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS relationship_owner TEXT,
ADD COLUMN IF NOT EXISTS products_services_description TEXT,
ADD COLUMN IF NOT EXISTS contract_effective_date DATE,
ADD COLUMN IF NOT EXISTS contract_expiration_date DATE,
ADD COLUMN IF NOT EXISTS reconciliation_account TEXT,
ADD COLUMN IF NOT EXISTS w9_status TEXT,
ADD COLUMN IF NOT EXISTS w8_ben_status TEXT,
ADD COLUMN IF NOT EXISTS w8_ben_e_status TEXT;
