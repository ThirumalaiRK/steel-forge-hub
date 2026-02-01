-- Create public bucket for product images if it does not exist
insert into storage.buckets (id, name, public)
select 'product-images', 'product-images', true
where not exists (
  select 1 from storage.buckets where id = 'product-images'
);

-- RLS policies for product-images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read product images'
  ) THEN
    CREATE POLICY "Public read product images"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins manage product images'
  ) THEN
    CREATE POLICY "Admins manage product images"
      ON storage.objects
      FOR ALL
      USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'))
      WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));
  END IF;
END $$;