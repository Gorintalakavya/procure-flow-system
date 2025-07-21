-- Fix foreign key constraints to allow CASCADE deletion
-- First, drop existing foreign key constraints that might be blocking deletion

-- Drop the foreign key constraint on users table if it exists
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_vendor_id_fkey;

-- Drop any other foreign key constraints that might reference vendors
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_vendor_id_fkey;
ALTER TABLE public.vendor_profiles DROP CONSTRAINT IF EXISTS vendor_profiles_vendor_id_fkey;
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_vendor_id_fkey;
ALTER TABLE public.vendor_documents DROP CONSTRAINT IF EXISTS vendor_documents_vendor_id_fkey;
ALTER TABLE public.verification_documents DROP CONSTRAINT IF EXISTS verification_documents_vendor_id_fkey;
ALTER TABLE public.compliance_tracking DROP CONSTRAINT IF EXISTS compliance_tracking_vendor_id_fkey;
ALTER TABLE public.analytics_reports DROP CONSTRAINT IF EXISTS analytics_reports_vendor_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_vendor_id_fkey;
ALTER TABLE public.notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_vendor_id_fkey;

-- Re-add foreign key constraints with CASCADE DELETE behavior
ALTER TABLE public.users 
ADD CONSTRAINT users_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(vendor_id) 
ON DELETE CASCADE;

ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(vendor_id) 
ON DELETE CASCADE;

ALTER TABLE public.vendor_profiles 
ADD CONSTRAINT vendor_profiles_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(vendor_id) 
ON DELETE CASCADE;

ALTER TABLE public.documents 
ADD CONSTRAINT documents_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(vendor_id) 
ON DELETE CASCADE;

ALTER TABLE public.vendor_documents 
ADD CONSTRAINT vendor_documents_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(vendor_id) 
ON DELETE CASCADE;

ALTER TABLE public.verification_documents 
ADD CONSTRAINT verification_documents_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(vendor_id) 
ON DELETE CASCADE;

ALTER TABLE public.compliance_tracking 
ADD CONSTRAINT compliance_tracking_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(vendor_id) 
ON DELETE CASCADE;

ALTER TABLE public.analytics_reports 
ADD CONSTRAINT analytics_reports_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(vendor_id) 
ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(vendor_id) 
ON DELETE CASCADE;

ALTER TABLE public.notification_preferences 
ADD CONSTRAINT notification_preferences_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(vendor_id) 
ON DELETE CASCADE;