
-- Remove Indian company specific fields from vendors table
ALTER TABLE public.vendors 
DROP COLUMN IF EXISTS cin_number,
DROP COLUMN IF EXISTS roc_name,
DROP COLUMN IF EXISTS registration_number,
DROP COLUMN IF EXISTS date_of_incorporation,
DROP COLUMN IF EXISTS listed_in_stock_exchange,
DROP COLUMN IF EXISTS category_of_company,
DROP COLUMN IF EXISTS subcategory_of_company,
DROP COLUMN IF EXISTS class_of_company,
DROP COLUMN IF EXISTS roc_office,
DROP COLUMN IF EXISTS rd_name_region,
DROP COLUMN IF EXISTS company_status,
DROP COLUMN IF EXISTS date_of_balance_sheet,
DROP COLUMN IF EXISTS date_of_last_agm,
DROP COLUMN IF EXISTS authorised_capital,
DROP COLUMN IF EXISTS paid_up_capital;

-- Remove directors fields from vendor_profiles table since we don't need them for US companies
ALTER TABLE public.vendor_profiles 
DROP COLUMN IF EXISTS current_directors,
DROP COLUMN IF EXISTS past_directors;
