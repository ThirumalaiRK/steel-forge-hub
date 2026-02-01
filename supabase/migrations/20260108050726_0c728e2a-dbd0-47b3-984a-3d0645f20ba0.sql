-- Create sub_categories table linked to categories
CREATE TABLE public.sub_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;

-- RLS: admins can manage sub-categories
CREATE POLICY "Admins can manage sub_categories"
ON public.sub_categories
AS PERMISSIVE
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS: sub-categories publicly readable when active and parent category is active
CREATE POLICY "Active sub_categories are publicly readable"
ON public.sub_categories
AS PERMISSIVE
FOR SELECT
TO public
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.categories c
    WHERE c.id = sub_categories.category_id
      AND c.is_active = true
  )
);

-- Add sub_category_id to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sub_category_id uuid REFERENCES public.sub_categories(id);

-- Keep products RLS as-is (public can read active products, admins manage) so no policy changes needed.

-- Trigger to keep updated_at fresh on sub_categories using existing function
CREATE TRIGGER update_sub_categories_updated_at
BEFORE UPDATE ON public.sub_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();