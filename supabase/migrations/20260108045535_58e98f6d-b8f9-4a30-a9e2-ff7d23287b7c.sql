-- Add show_in_menu flag to categories for header/menu control
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS show_in_menu boolean NOT NULL DEFAULT true;

-- Ensure display_order has a sane default for ordering
ALTER TABLE public.categories
ALTER COLUMN display_order SET DEFAULT 0;