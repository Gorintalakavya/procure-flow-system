
-- Fix the vendor_id column length constraint
ALTER TABLE vendors ALTER COLUMN vendor_id TYPE character varying(50);

-- Also fix the related foreign key columns in other tables
ALTER TABLE users ALTER COLUMN vendor_id TYPE character varying(50);
ALTER TABLE vendor_profiles ALTER COLUMN vendor_id TYPE character varying(50);
ALTER TABLE analytics_reports ALTER COLUMN vendor_id TYPE character varying(50);
ALTER TABLE audit_logs ALTER COLUMN vendor_id TYPE character varying(50);
ALTER TABLE compliance_tracking ALTER COLUMN vendor_id TYPE character varying(50);
ALTER TABLE documents ALTER COLUMN vendor_id TYPE character varying(50);
ALTER TABLE notification_preferences ALTER COLUMN vendor_id TYPE character varying(50);
ALTER TABLE notifications ALTER COLUMN vendor_id TYPE character varying(50);
ALTER TABLE user_roles ALTER COLUMN vendor_id TYPE character varying(50);

-- Create a new table for admin IDs to track admins properly
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id character varying(50) NOT NULL UNIQUE,
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for admin_profiles
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for admin_profiles
CREATE POLICY "Public can manage admin_profiles" ON admin_profiles FOR ALL USING (true);
