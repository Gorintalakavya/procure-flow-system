
-- Create Filing History table
CREATE TABLE public.filing_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id TEXT REFERENCES public.vendors(vendor_id) ON DELETE CASCADE,
  filing_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  document_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('submitted', 'approved', 'rejected', 'pending', 'under_review')),
  filed_by TEXT NOT NULL,
  filed_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  reference_number TEXT,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Advanced Search History table
CREATE TABLE public.advanced_search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_query JSONB NOT NULL,
  search_type TEXT NOT NULL,
  executed_by TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  results_count INTEGER DEFAULT 0,
  filters_applied JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Vendor Risk Scores table
CREATE TABLE public.vendor_risk_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id TEXT REFERENCES public.vendors(vendor_id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  last_assessed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assessed_by TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'under_review', 'escalated')),
  notes TEXT,
  assessment_criteria JSONB,
  next_assessment_due DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Archived Vendors table
CREATE TABLE public.archived_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_vendor_id TEXT NOT NULL,
  vendor_data JSONB NOT NULL,
  archived_by TEXT NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  archive_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'archived' CHECK (status IN ('archived', 'permanently_deleted')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Data Quality Flags table
CREATE TABLE public.data_quality_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id TEXT REFERENCES public.vendors(vendor_id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('incomplete_data', 'invalid_data', 'duplicate_data', 'outdated_data', 'inconsistent_data')),
  field_name TEXT NOT NULL,
  flag_description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  flagged_by TEXT NOT NULL,
  flagged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_by TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'dismissed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Bulk Upload Logs table
CREATE TABLE public.bulk_upload_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_batch_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  total_records INTEGER NOT NULL DEFAULT 0,
  successful_records INTEGER NOT NULL DEFAULT 0,
  failed_records INTEGER NOT NULL DEFAULT 0,
  upload_status TEXT NOT NULL CHECK (upload_status IN ('in_progress', 'completed', 'failed', 'partially_completed')),
  uploaded_by TEXT NOT NULL,
  upload_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  upload_completed_at TIMESTAMP WITH TIME ZONE,
  error_log JSONB,
  validation_errors JSONB,
  processing_summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Vendor Performance Metrics table
CREATE TABLE public.vendor_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id TEXT REFERENCES public.vendors(vendor_id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('on_time_delivery', 'order_accuracy', 'invoice_accuracy', 'quality_score', 'fulfillment_rate', 'responsiveness', 'compliance_rating', 'repeat_business_rate', 'lead_time', 'cost_competitiveness')),
  metric_value DECIMAL(10,2) NOT NULL,
  metric_unit TEXT NOT NULL,
  measurement_period_start DATE NOT NULL,
  measurement_period_end DATE NOT NULL,
  measured_by TEXT NOT NULL,
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  benchmark_value DECIMAL(10,2),
  performance_rating TEXT CHECK (performance_rating IN ('excellent', 'good', 'satisfactory', 'needs_improvement', 'poor')),
  notes TEXT,
  data_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Vendor Documents table (enhanced version)
CREATE TABLE IF NOT EXISTS public.vendor_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id TEXT REFERENCES public.vendors(vendor_id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_category TEXT NOT NULL CHECK (document_category IN ('legal', 'financial', 'compliance', 'operational', 'quality', 'security')),
  file_path TEXT,
  file_size INTEGER,
  mime_type TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expiry_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending_renewal', 'archived')),
  uploaded_by TEXT NOT NULL,
  version_number INTEGER DEFAULT 1,
  is_current_version BOOLEAN DEFAULT true,
  metadata JSONB,
  tags TEXT[],
  access_level TEXT DEFAULT 'internal' CHECK (access_level IN ('public', 'internal', 'restricted', 'confidential')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.filing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advanced_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_upload_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables (allowing public access for now, can be restricted later)
CREATE POLICY "Public can manage filing_history" ON public.filing_history FOR ALL USING (true);
CREATE POLICY "Public can manage advanced_search_history" ON public.advanced_search_history FOR ALL USING (true);
CREATE POLICY "Public can manage vendor_risk_scores" ON public.vendor_risk_scores FOR ALL USING (true);
CREATE POLICY "Public can manage archived_vendors" ON public.archived_vendors FOR ALL USING (true);
CREATE POLICY "Public can manage data_quality_flags" ON public.data_quality_flags FOR ALL USING (true);
CREATE POLICY "Public can manage bulk_upload_logs" ON public.bulk_upload_logs FOR ALL USING (true);
CREATE POLICY "Public can manage vendor_performance_metrics" ON public.vendor_performance_metrics FOR ALL USING (true);
CREATE POLICY "Public can manage vendor_documents" ON public.vendor_documents FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_filing_history_vendor_id ON public.filing_history(vendor_id);
CREATE INDEX idx_filing_history_filing_date ON public.filing_history(filing_date);
CREATE INDEX idx_filing_history_status ON public.filing_history(status);

CREATE INDEX idx_vendor_risk_scores_vendor_id ON public.vendor_risk_scores(vendor_id);
CREATE INDEX idx_vendor_risk_scores_risk_level ON public.vendor_risk_scores(risk_level);
CREATE INDEX idx_vendor_risk_scores_last_assessed ON public.vendor_risk_scores(last_assessed);

CREATE INDEX idx_data_quality_flags_vendor_id ON public.data_quality_flags(vendor_id);
CREATE INDEX idx_data_quality_flags_status ON public.data_quality_flags(status);
CREATE INDEX idx_data_quality_flags_severity ON public.data_quality_flags(severity);

CREATE INDEX idx_vendor_performance_vendor_id ON public.vendor_performance_metrics(vendor_id);
CREATE INDEX idx_vendor_performance_metric_type ON public.vendor_performance_metrics(metric_type);
CREATE INDEX idx_vendor_performance_period ON public.vendor_performance_metrics(measurement_period_start, measurement_period_end);

CREATE INDEX idx_vendor_documents_vendor_id ON public.vendor_documents(vendor_id);
CREATE INDEX idx_vendor_documents_type ON public.vendor_documents(document_type);
CREATE INDEX idx_vendor_documents_status ON public.vendor_documents(status);

-- Create trigger to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_filing_history_updated_at BEFORE UPDATE ON public.filing_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_risk_scores_updated_at BEFORE UPDATE ON public.vendor_risk_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_quality_flags_updated_at BEFORE UPDATE ON public.data_quality_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bulk_upload_logs_updated_at BEFORE UPDATE ON public.bulk_upload_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_performance_metrics_updated_at BEFORE UPDATE ON public.vendor_performance_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_documents_updated_at BEFORE UPDATE ON public.vendor_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
