
-- Create case_studies table
CREATE TABLE public.case_studies (
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

-- Enable RLS
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access for published" ON public.case_studies
  FOR SELECT USING (status = 'Published');

CREATE POLICY "Admin full access" ON public.case_studies
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Function to update updated_at
CREATE TRIGGER update_case_studies_modtime
BEFORE UPDATE ON public.case_studies
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
