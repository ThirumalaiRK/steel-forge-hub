-- ============================================
-- Fix Missing Tables & Functions (Safe Run)
-- ============================================

-- 0. Define the Helper Function (MUST RUN FIRST)
-- --------------------------------------------
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';


-- 1. Ensure orders table exists and has user_id
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely add user_id if table existed but column didn't
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='user_id') THEN
        ALTER TABLE public.orders ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;


-- 2. Create order_items table
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_per_unit DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Enable RLS for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies for order_items (Drop first to avoid exists error if re-running)
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );


-- 2. Create case_studies table
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  client_name TEXT,
  industry TEXT,
  location TEXT,
  duration TEXT,
  overview TEXT,
  challenges TEXT,
  solution TEXT,
  materials TEXT[], -- Array of strings
  processes TEXT[], -- Array of strings
  customization_level TEXT CHECK (customization_level IN ('Low', 'Medium', 'High')),
  featured_image TEXT,
  gallery_images TEXT[],
  video_url TEXT,
  key_results TEXT[],
  client_benefits TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
  is_mock BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS for case_studies
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

-- Policies for case_studies
DROP POLICY IF EXISTS "Public read access for published case studies" ON public.case_studies;
CREATE POLICY "Public read access for published case studies" ON public.case_studies
  FOR SELECT TO public
  USING (status = 'Published');

DROP POLICY IF EXISTS "Admins can manage case studies" ON public.case_studies;
CREATE POLICY "Admins can manage case studies" ON public.case_studies
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger for updated_at (Now relies on function which is definitely created)
DROP TRIGGER IF EXISTS update_case_studies_modtime ON public.case_studies;
CREATE TRIGGER update_case_studies_modtime
BEFORE UPDATE ON public.case_studies
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 3. Verify
-- --------------------------------------------
-- Tables created successfully.
