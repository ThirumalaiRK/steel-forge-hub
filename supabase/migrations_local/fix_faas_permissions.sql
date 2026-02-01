-- ============================================
-- Fix Permissions for FaaS Quotation System
-- ============================================

-- 1. Create a secure function to check for admin role
-- This avoids querying auth.users directly in RLS policies, which causes permission errors
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update the "Admins can view..." policy to use the secure function
DROP POLICY IF EXISTS "Admins can view all quotations" ON faas_quotations;
CREATE POLICY "Admins can view all quotations"
ON faas_quotations
FOR SELECT
TO authenticated
USING ( is_admin() );

-- 3. Update the "Admins can update..." policy
DROP POLICY IF EXISTS "Admins can update quotations" ON faas_quotations;
CREATE POLICY "Admins can update quotations"
ON faas_quotations
FOR UPDATE
TO authenticated
USING ( is_admin() );

-- 4. Update generate_quotation_number to be SECURITY DEFINER
-- This allows anyone (even anon users) to generate a number without needing SELECT permissions on the table
CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  count_this_year INTEGER;
  next_number TEXT;
BEGIN
  current_year := TO_CHAR(NOW(), 'YYYY');
  
  -- This query now runs with the privileges of the function creator (admin)
  -- bypassing RLS checks for the user
  SELECT COUNT(*) INTO count_this_year
  FROM faas_quotations
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  next_number := LPAD((count_this_year + 1)::TEXT, 4, '0');
  
  RETURN 'FQ-' || current_year || '-' || next_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission to public
GRANT EXECUTE ON FUNCTION generate_quotation_number() TO public;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
