
-- Create vendors table for basic vendor information
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(10) UNIQUE NOT NULL,
  legal_entity_name TEXT NOT NULL,
  trade_name TEXT,
  vendor_type TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  business_description TEXT,
  website TEXT,
  year_established TEXT,
  employee_count TEXT,
  annual_revenue TEXT,
  registration_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table for authentication
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(10) REFERENCES public.vendors(vendor_id),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_authenticated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_profiles table for detailed vendor information
CREATE TABLE public.vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(10) REFERENCES public.vendors(vendor_id),
  user_id UUID REFERENCES public.users(id),
  -- Financial Information
  tax_id TEXT,
  bank_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  payment_terms TEXT,
  currency TEXT,
  billing_address TEXT,
  -- Procurement Information
  services_offered TEXT,
  primary_contact TEXT,
  secondary_contact TEXT,
  relationship_owner TEXT,
  contract_details TEXT,
  certifications TEXT,
  -- Regulatory Information
  compliance_forms TEXT,
  reconciliation_account TEXT,
  regulatory_notes TEXT,
  last_audit_date DATE,
  next_audit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(10) REFERENCES public.vendors(vendor_id),
  user_email TEXT NOT NULL,
  role TEXT NOT NULL,
  permissions JSONB,
  access_level TEXT,
  department TEXT,
  is_primary_contact BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create compliance_tracking table
CREATE TABLE public.compliance_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(10) REFERENCES public.vendors(vendor_id),
  compliance_type TEXT NOT NULL,
  status TEXT NOT NULL,
  certification_name TEXT,
  issue_date DATE,
  expiry_date DATE,
  issuing_authority TEXT,
  compliance_score INTEGER,
  notes TEXT,
  next_review_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table for document management
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(10) REFERENCES public.vendors(vendor_id),
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_path TEXT,
  file_size INTEGER,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date DATE,
  status TEXT DEFAULT 'active',
  uploaded_by TEXT,
  tags TEXT[],
  metadata JSONB
);

-- Create analytics_reports table
CREATE TABLE public.analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(10) REFERENCES public.vendors(vendor_id),
  report_type TEXT NOT NULL,
  report_data JSONB,
  performance_score INTEGER,
  compliance_rate DECIMAL(5,2),
  risk_level TEXT,
  generated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start DATE,
  period_end DATE
);

-- Create audit_logs table for tracking all activities
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(10) REFERENCES public.vendors(vendor_id),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(10) REFERENCES public.vendors(vendor_id),
  user_id UUID REFERENCES public.users(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(10) REFERENCES public.vendors(vendor_id),
  email_notifications BOOLEAN DEFAULT true,
  status_updates BOOLEAN DEFAULT true,
  document_reminders BOOLEAN DEFAULT true,
  compliance_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sequence for vendor ID generation
CREATE SEQUENCE vendor_id_sequence START 1000000000;

-- Create function to generate 10-digit vendor ID
CREATE OR REPLACE FUNCTION generate_vendor_id()
RETURNS VARCHAR(10) AS $$
BEGIN
  RETURN LPAD(nextval('vendor_id_sequence')::TEXT, 10, '0');
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security on all tables
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies for now - can be refined based on requirements)
CREATE POLICY "Public can insert vendors" ON public.vendors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Public can update vendors" ON public.vendors FOR UPDATE USING (true);

CREATE POLICY "Public can insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public can update users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Public can manage vendor_profiles" ON public.vendor_profiles FOR ALL USING (true);
CREATE POLICY "Public can manage user_roles" ON public.user_roles FOR ALL USING (true);
CREATE POLICY "Public can manage compliance_tracking" ON public.compliance_tracking FOR ALL USING (true);
CREATE POLICY "Public can manage documents" ON public.documents FOR ALL USING (true);
CREATE POLICY "Public can manage analytics_reports" ON public.analytics_reports FOR ALL USING (true);
CREATE POLICY "Public can manage audit_logs" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "Public can manage notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Public can manage notification_preferences" ON public.notification_preferences FOR ALL USING (true);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-documents', 'vendor-documents', true);

-- Create storage policy for vendor documents
CREATE POLICY "Public can upload vendor documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vendor-documents');
CREATE POLICY "Public can view vendor documents" ON storage.objects FOR SELECT USING (bucket_id = 'vendor-documents');
CREATE POLICY "Public can update vendor documents" ON storage.objects FOR UPDATE USING (bucket_id = 'vendor-documents');
CREATE POLICY "Public can delete vendor documents" ON storage.objects FOR DELETE USING (bucket_id = 'vendor-documents');
