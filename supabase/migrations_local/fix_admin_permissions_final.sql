-- =================================================================
-- Fix RLS Permission Errors (403 Forbidden / Permission denied)
-- =================================================================

-- PROBLEM:
-- The error "permission denied for table users" happens because standard RLS policies
-- cannot directly SELECT from 'auth.users' due to Supabase security restrictions.

-- SOLUTION:
-- We must use a separate "SECURITY DEFINER" function to safely check admin status.

-- 1. Create a Secure Admin Check Function
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (superuser)
SET search_path = public -- Secure search path
AS $$
BEGIN
  -- Check if the user has 'admin' role or 'is_admin' flag in metadata and is NOT blocked
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
    AND (
      raw_user_meta_data->>'role' = 'admin' 
      OR 
      raw_user_meta_data->>'is_admin' = 'true'
    )
  );
END;
$$;


-- 2. Fix Case Studies Policies
-- -----------------------------------------------------------------
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

-- Drop broken policies that try to access auth.users directly
DROP POLICY IF EXISTS "Admins can manage case studies" ON public.case_studies;
DROP POLICY IF EXISTS "Admin full access" ON public.case_studies;

-- Create NEW clean Admin policy using the secure function
CREATE POLICY "Admins can manage case studies" ON public.case_studies
  FOR ALL TO authenticated
  USING (
    public.is_admin()
  );

-- Ensure public read access still exists
DROP POLICY IF EXISTS "Public read access for published case studies" ON public.case_studies;
CREATE POLICY "Public read access for published case studies" ON public.case_studies
  FOR SELECT TO public
  USING (status = 'Published');


-- 3. Fix Order Items Policies
-- -----------------------------------------------------------------
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
  );


-- 4. Fix Orders Policies (Prevent future errors)
-- -----------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL TO authenticated
  USING (
    public.is_admin()
  );

-- 5. Fix Enquiries Policies (Common issue)
-- -----------------------------------------------------------------
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all enquiries" ON public.enquiries;

CREATE POLICY "Admins can view all enquiries" ON public.enquiries
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
  );
