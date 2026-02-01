-- ============================================
-- Fix Delete Permissions for FaaS Quotation System
-- ============================================

-- This script adds the missing DELETE policy for administrators.
-- Without this, admins cannot delete quotations even if they are authenticated.

-- 1. Create the DELETE policy using the secure is_admin() function
-- Note: This requires the is_admin() function to exist (created in fix_faas_permissions.sql)
-- If is_admin() does not exist, you must run fix_faas_permissions.sql first.

DROP POLICY IF EXISTS "Admins can delete quotations" ON faas_quotations;

CREATE POLICY "Admins can delete quotations"
ON faas_quotations
FOR DELETE
TO authenticated
USING ( is_admin() );

-- 2. Verify:
-- Admins (authenticated users with role='admin' in metadata) can now DELETE rows in faas_quotations.
