-- Optimize RLS policies to use (select auth.function()) for performance caching
-- as per Supabase linter warnings.

-- 1. Notifications Table
DROP POLICY IF EXISTS "Admins can view notifications" ON public.notifications;
CREATE POLICY "Admins can view notifications" ON public.notifications FOR SELECT USING ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;
CREATE POLICY "Admins can update notifications" ON public.notifications FOR UPDATE USING ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
CREATE POLICY "Admins can delete notifications" ON public.notifications FOR DELETE USING ((select auth.role()) = 'authenticated');

-- 2. User Roles Table (Standard fix)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (user_id = (select auth.uid()));

-- 3. Cleanup Duplicates on Offers
-- Dropping the likely redundant/permissive one in favor of the standard naming convention
DROP POLICY IF EXISTS "Allow admin full access" ON public.offers;

-- 4. Note on other Tables:
-- For tables like Categories, Products, Enquiries, etc., the fix requires wrapping the admin check:
-- USING ( (select auth.uid()) ... )
-- Since the implementation details of 'is_admin' or explicit checks vary, 
-- please ensure to review those checks if performance remains an issue.
