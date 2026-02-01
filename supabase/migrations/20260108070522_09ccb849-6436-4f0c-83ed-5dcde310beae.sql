-- Add separate desktop and mobile hero images
ALTER TABLE public.hero_banners
  ADD COLUMN IF NOT EXISTS desktop_image_url text,
  ADD COLUMN IF NOT EXISTS mobile_image_url text;