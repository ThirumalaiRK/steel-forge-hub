-- FIX SUPABASE STORAGE RLS POLICIES FOR RESOURCES BUCKET
-- Run this in Supabase SQL Editor after creating the 'resources' storage bucket

-- Step 1: Drop existing policies if any
drop policy if exists "Authenticated users can upload resources" on storage.objects;
drop policy if exists "Public can download resources" on storage.objects;
drop policy if exists "Authenticated users can delete resources" on storage.objects;
drop policy if exists "Give users access to own folder" on storage.objects;
drop policy if exists "Allow public read access" on storage.objects;
drop policy if exists "Allow authenticated uploads" on storage.objects;

-- Step 2: Create new policies for the 'resources' bucket

-- Policy 1: Allow authenticated users to upload files to resources bucket
create policy "Allow authenticated users to upload to resources bucket"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'resources');

-- Policy 2: Allow public read access to resources bucket
create policy "Allow public to read resources bucket"
on storage.objects
for select
to public
using (bucket_id = 'resources');

-- Policy 3: Allow authenticated users to update files in resources bucket
create policy "Allow authenticated users to update resources bucket"
on storage.objects
for update
to authenticated
using (bucket_id = 'resources')
with check (bucket_id = 'resources');

-- Policy 4: Allow authenticated users to delete files from resources bucket
create policy "Allow authenticated users to delete from resources bucket"
on storage.objects
for delete
to authenticated
using (bucket_id = 'resources');

-- Verify the policies
select *
from pg_policies
where tablename = 'objects'
and policyname like '%resources%';
