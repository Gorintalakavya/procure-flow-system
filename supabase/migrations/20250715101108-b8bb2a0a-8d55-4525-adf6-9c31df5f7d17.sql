
-- Update the vendor ID generation to be 1-10 digits
DROP SEQUENCE IF EXISTS vendor_id_sequence;
CREATE SEQUENCE vendor_id_sequence START 1 MAXVALUE 9999999999;

-- Update the function to generate vendor IDs with 1-10 digits (no padding)
CREATE OR REPLACE FUNCTION public.generate_vendor_id()
RETURNS character varying
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN nextval('vendor_id_sequence')::TEXT;
END;
$$;

-- Add missing columns to vendors table for the new fields
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS cin_number TEXT,
ADD COLUMN IF NOT EXISTS roc_name TEXT,
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS date_of_incorporation DATE,
ADD COLUMN IF NOT EXISTS listed_in_stock_exchange TEXT,
ADD COLUMN IF NOT EXISTS category_of_company TEXT,
ADD COLUMN IF NOT EXISTS subcategory_of_company TEXT,
ADD COLUMN IF NOT EXISTS class_of_company TEXT,
ADD COLUMN IF NOT EXISTS roc_office TEXT,
ADD COLUMN IF NOT EXISTS rd_name_region TEXT,
ADD COLUMN IF NOT EXISTS company_status TEXT,
ADD COLUMN IF NOT EXISTS date_of_balance_sheet DATE,
ADD COLUMN IF NOT EXISTS date_of_last_agm DATE,
ADD COLUMN IF NOT EXISTS authorised_capital TEXT,
ADD COLUMN IF NOT EXISTS paid_up_capital TEXT;

-- Add missing columns to vendor_profiles table
ALTER TABLE vendor_profiles 
ADD COLUMN IF NOT EXISTS account_type TEXT,
ADD COLUMN IF NOT EXISTS swift_code TEXT,
ADD COLUMN IF NOT EXISTS bank_address TEXT,
ADD COLUMN IF NOT EXISTS current_directors JSONB,
ADD COLUMN IF NOT EXISTS past_directors JSONB;

-- Create admin ID sequence for 1-10 digits
DROP SEQUENCE IF EXISTS admin_id_sequence;
CREATE SEQUENCE admin_id_sequence START 1 MAXVALUE 9999999999;

-- Update admin_users table to use the sequence
ALTER TABLE admin_users ALTER COLUMN id SET DEFAULT gen_random_uuid();
