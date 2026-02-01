-- ============================================
-- SIMPLE FAAS PRODUCT TEST
-- Run these queries one by one
-- ============================================

-- Query 1: Get your FaaS product details
SELECT 
  name,
  slug,
  metal_type,
  description,
  is_faas_enabled,
  is_active
FROM products
WHERE is_faas_enabled = true;

-- Copy the 'slug' value from the result above
-- Example: industrial-metal-work-table

-- ============================================

-- Query 2: Check if product has images
SELECT 
  p.name,
  COUNT(pi.id) as image_count
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.is_faas_enabled = true
GROUP BY p.id, p.name;

-- If image_count = 0, product will show but with "No Image" placeholder
-- If image_count >= 1, product will show with actual image

-- ============================================

-- Query 3: Get complete info
SELECT 
  p.name,
  p.slug,
  p.metal_type,
  p.description,
  c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_faas_enabled = true;

-- ============================================
-- NOW TEST IN BROWSER
-- ============================================

-- 1. Open: http://localhost:8080/faas/products
--    Expected: You see 1 product card
--
-- 2. Click on the product OR go to:
--    http://localhost:8080/faas/products/[slug-from-query-1]
--    Example: http://localhost:8080/faas/products/industrial-metal-work-table
--
-- 3. Expected result:
--    ✅ Page loads (no error)
--    ✅ Product image shows
--    ✅ Product name displays
--    ✅ Rental configuration works
--    ✅ "Get Rental Quote" button works

-- ============================================
