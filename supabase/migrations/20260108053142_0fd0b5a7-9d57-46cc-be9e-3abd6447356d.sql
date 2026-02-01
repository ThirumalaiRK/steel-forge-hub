-- Add featured flag to products for admin highlighting
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;