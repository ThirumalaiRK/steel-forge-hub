-- ============================================
-- VERIFICATION SCRIPT
-- Based on your database state
-- ============================================

-- Your current state shows:
-- faas_enabled_count: 1
-- faas_disabled_count: 0
-- total_active_products: 1

-- ============================================
-- Step 1: Get details of the FaaS-enabled product
-- ============================================

SELECT 
  id,
  name,
  slug,
  description,
  metal_type,
  is_faas_enabled,
  is_active,
  category_id,
  created_at
FROM products
WHERE is_faas_enabled = true
  AND is_active = true;

-- Expected: Should show "Industrial Metal Work Table"
-- Note the 'slug' value - you'll need this for the URL

-- ============================================
-- Step 2: Check if product has images
-- ============================================

SELECT 
  p.name,
  p.slug,
  pi.image_url,
  pi.alt_text,
  pi.display_order
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.is_faas_enabled = true
  AND p.is_active = true
ORDER BY p.name, pi.display_order;

-- Expected: Should show at least 1 image
-- If no images: Product will display but with "No Image" placeholder

-- ============================================
-- Step 3: Get complete product details with category
-- ============================================

SELECT 
  p.id,
  p.name,
  p.slug,
  p.description,
  p.metal_type,
  p.is_faas_enabled,
  c.name as category_name,
  c.slug as category_slug,
  COUNT(pi.id) as image_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.is_faas_enabled = true
  AND p.is_active = true
GROUP BY p.id, p.name, p.slug, p.description, p.metal_type, 
         p.is_faas_enabled, c.name, c.slug;

-- This gives you EVERYTHING about the FaaS product

-- ============================================
-- NEXT STEPS - TEST IN BROWSER
-- ============================================

-- 1. Copy the 'slug' value from Step 1 result
-- 2. Open browser and go to:
--    http://localhost:8080/faas/products
--    
-- 3. You should see the product card
--
-- 4. Click on it, or go directly to:
--    http://localhost:8080/faas/products/[slug-from-step-1]
--    Example: http://localhost:8080/faas/products/industrial-metal-work-table
--
-- 5. Page should load successfully with:
--    - Product image
--    - Product name and description
--    - Rental configuration UI
--    - "Get Rental Quote" button
--
-- ============================================

-- ============================================
-- If you want to add more FaaS products:
-- ============================================

-- First, see what other products exist
SELECT 
  id,
  name,
  slug,
  is_faas_enabled,
  is_active
FROM products
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;

-- Then enable FaaS for specific products:
-- UPDATE products
-- SET is_faas_enabled = true
-- WHERE slug IN ('product-slug-1', 'product-slug-2', 'product-slug-3');

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If FaaS page shows "No products":
-- Run this to check:
SELECT COUNT(*) as faas_product_count
FROM products
WHERE is_faas_enabled = true
  AND is_active = true;
-- Should return: faas_product_count = 1 (or more)

-- If product detail page shows error:
-- Check these conditions:
SELECT 
  slug,
  is_active,
  is_faas_enabled,
  CASE 
    WHEN is_active = false THEN 'ERROR: Product not active'
    WHEN is_faas_enabled = false THEN 'ERROR: FaaS not enabled'
    ELSE 'OK: Should work'
  END as status
FROM products
WHERE slug = 'industrial-metal-work-table';

-- ============================================
