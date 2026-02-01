DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'enquiries'
      AND policyname = 'Admins can delete enquiries'
  ) THEN
    CREATE POLICY "Admins can delete enquiries"
      ON public.enquiries
      FOR DELETE
      USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;