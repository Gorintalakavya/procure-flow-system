-- Update RLS policies for vendors table to allow DELETE operations
-- First drop existing policies
DROP POLICY IF EXISTS "Public can view vendors" ON public.vendors;
DROP POLICY IF EXISTS "Public can insert vendors" ON public.vendors;
DROP POLICY IF EXISTS "Public can update vendors" ON public.vendors;
DROP POLICY IF EXISTS "Public can manage vendors" ON public.vendors;

-- Create new policies that allow all operations
CREATE POLICY "Public can manage vendors" 
ON public.vendors 
FOR ALL 
USING (true)
WITH CHECK (true);