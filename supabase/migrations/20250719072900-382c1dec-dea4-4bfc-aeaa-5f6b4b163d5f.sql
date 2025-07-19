
-- Add missing compliance and audit fields to vendor_profiles table
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS compliance_status text,
ADD COLUMN IF NOT EXISTS regulatory_bodies text,
ADD COLUMN IF NOT EXISTS federal_regulations text,
ADD COLUMN IF NOT EXISTS industry_regulations text,
ADD COLUMN IF NOT EXISTS compliance_officer text,
ADD COLUMN IF NOT EXISTS last_compliance_review date,
ADD COLUMN IF NOT EXISTS next_compliance_review date,
ADD COLUMN IF NOT EXISTS audit_type text,
ADD COLUMN IF NOT EXISTS last_internal_audit date,
ADD COLUMN IF NOT EXISTS last_external_audit date,
ADD COLUMN IF NOT EXISTS external_auditing_firm text,
ADD COLUMN IF NOT EXISTS audit_result_summary text,
ADD COLUMN IF NOT EXISTS corrective_actions text,
ADD COLUMN IF NOT EXISTS audit_reports_available text,
ADD COLUMN IF NOT EXISTS next_audit_due date;
