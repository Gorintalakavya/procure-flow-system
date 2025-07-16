
-- Add user_id column to vendor_profiles table
ALTER TABLE public.vendor_profiles ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_user_id ON public.vendor_profiles(user_id);
