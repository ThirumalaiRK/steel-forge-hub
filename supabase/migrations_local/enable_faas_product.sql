-- ============================================
-- FaaS Product Setup - Quick Enable Script
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Check if product exists
SELECT 
  id,
  name,
  slug,
  is_active,
  is_faas_enabled,
  category_id,
  metal_type
FROM products
WHERE slug = 'industrial-metal-work-table';

-- Expected: Should return 1 row
-- If no rows: Product doesn't exist, create it first
-- If exists: Continue to Step 2

-- ============================================

-- Step 2: Enable FaaS for Industrial Metal Work Table
UPDATE products
SET is_faas_enabled = true
WHERE slug = 'industrial-metal-work-table'
  AND is_active = true;

-- ============================================

-- Step 3: Verify the update
SELECT 
  id,
  name,
  slug,
  is_faas_enabled,
  is_active
FROM products
WHERE slug = 'industrial-metal-work-table';

-- Expected Result:
-- is_faas_enabled: true
-- is_active: true

-- ============================================

-- Step 4: Enable FaaS for more products (Optional)
-- This enables FaaS for the 5 most recent products

UPDATE products
SET is_faas_enabled = true
WHERE is_active = true
  AND id IN (
    SELECT id FROM products
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT 5
  );

-- ============================================

-- Step 5: List all FaaS-enabled products
SELECT 
  id,
  name,
  slug,
  metal_type,
  is_faas_enabled,
  display_order
FROM products
WHERE is_faas_enabled = true
  AND is_active = true
ORDER BY display_order ASC, name ASC;

-- Expected: Should show at least 1 product

-- ============================================

-- Step 6: Check product images
SELECT 
  p.id,
  p.name,
  p.slug,
  COUNT(pi.id) as image_count
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.is_faas_enabled = true
  AND p.is_active = true
GROUP BY p.id, p.name, p.slug
ORDER BY p.name;

-- Expected: Each product should have at least 1 image

-- ============================================

-- Step 7: Summary Report
SELECT 
  COUNT(*) FILTER (WHERE is_faas_enabled = true) as faas_enabled_count,
  COUNT(*) FILTER (WHERE is_faas_enabled = false) as faas_disabled_count,
  COUNT(*) as total_active_products
FROM products
WHERE is_active = true;

-- ============================================
-- DONE! 
-- Now test in browser:
-- 1. Go to: http://localhost:8080/faas/products
-- 2. You should see the enabled product(s)
-- 3. Click on "Industrial Metal Work Table"
-- 4. Detail page should load without errors
-- ============================================
