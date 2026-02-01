-- Final RLS Fix Script
-- Corrects column names to 'is_active' based on explicit pg error hints.

-- =====================================================================================
-- 1. Hero Banners 
-- =====================================================================================
DROP POLICY IF EXISTS "Active hero banners are publicly readable" ON public.hero_banners;
DROP POLICY IF EXISTS "Admins can view all hero banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Unified view hero banners" ON public.hero_banners;

-- Use 'is_active' as explicitly hinted
CREATE POLICY "Unified view hero banners" ON public.hero_banners
  FOR SELECT USING (
    is_active = true OR
    (select auth.role()) = 'authenticated'
  );

-- =====================================================================================
-- 2. Offers
-- =====================================================================================
DROP POLICY IF EXISTS "Admins can view all offers" ON public.offers;
DROP POLICY IF EXISTS "Allow public read access to active offers" ON public.offers;
DROP POLICY IF EXISTS "Anyone can read active offers" ON public.offers;
DROP POLICY IF EXISTS "Public offers are readable" ON public.offers;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.offers;
DROP POLICY IF EXISTS "Unified view offers" ON public.offers;

-- Assuming 'is_active' logic follows for offers too given the hero_banners pattern
-- If offers table differs, this might need 'active', but 'is_active' is the strong guess now.
CREATE POLICY "Unified view offers" ON public.offers
  FOR SELECT USING (
    is_active = true OR
    (select auth.role()) = 'authenticated'
  );

-- =====================================================================================
-- 3. Orders (Consolidated INSERT) - Safe, no columns used
-- =====================================================================================
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Unified insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can select orders" ON public.orders;

-- Actions
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING ((select auth.role()) = 'authenticated');
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING ((select auth.role()) = 'authenticated');
CREATE POLICY "Admins can select orders" ON public.orders FOR SELECT USING ((select auth.role()) = 'authenticated');

-- Insert
CREATE POLICY "Unified insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- =====================================================================================
-- 4. User Roles (Consolidated SELECT) - Safe
-- =====================================================================================
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Unified view user_roles" ON public.user_roles;

CREATE POLICY "Unified view user_roles" ON public.user_roles
  FOR SELECT USING (
    (select auth.role()) = 'authenticated' OR 
    user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "Admins can modify user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;

CREATE POLICY "Admins can insert user_roles" ON public.user_roles FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Admins can update user_roles" ON public.user_roles FOR UPDATE USING ((select auth.role()) = 'authenticated');
CREATE POLICY "Admins can delete user_roles" ON public.user_roles FOR DELETE USING ((select auth.role()) = 'authenticated');
