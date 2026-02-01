-- Create indexes for unindexed foreign keys to improve join performance
-- as recommended by Supabase Linter (5 suggestions).

-- 1. Enquiries -> Product
CREATE INDEX IF NOT EXISTS idx_enquiries_product_id ON public.enquiries(product_id);

-- 2. Product Images -> Product
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- 3. Products -> Category
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- 4. Products -> SubCategory
CREATE INDEX IF NOT EXISTS idx_products_sub_category_id ON public.products(sub_category_id);

-- 5. SubCategories -> Category
CREATE INDEX IF NOT EXISTS idx_sub_categories_category_id ON public.sub_categories(category_id);
