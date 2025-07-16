
-- Add missing overview fields to vendor_profiles table
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS ranking TEXT,
ADD COLUMN IF NOT EXISTS key_principal TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS year_started TEXT,
ADD COLUMN IF NOT EXISTS date_of_incorporation DATE;

-- Add missing financial fields to vendor_profiles table
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS revenue TEXT,
ADD COLUMN IF NOT EXISTS sales_growth TEXT,
ADD COLUMN IF NOT EXISTS net_income_growth TEXT,
ADD COLUMN IF NOT EXISTS assets TEXT,
ADD COLUMN IF NOT EXISTS fiscal_year_end TEXT,
ADD COLUMN IF NOT EXISTS stock_exchange TEXT,
ADD COLUMN IF NOT EXISTS esg_ranking TEXT,
ADD COLUMN IF NOT EXISTS esg_industry_average TEXT;
