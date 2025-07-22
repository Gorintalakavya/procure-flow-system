-- Fix foreign key constraint to allow cascade delete
-- First, drop the existing foreign key constraint
ALTER TABLE public.audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_vendor_id_fkey;

-- Add the foreign key constraint back with CASCADE DELETE
ALTER TABLE public.audit_logs 
ADD CONSTRAINT audit_logs_vendor_id_fkey 
FOREIGN KEY (vendor_id) 
REFERENCES public.vendors(vendor_id) 
ON DELETE CASCADE;