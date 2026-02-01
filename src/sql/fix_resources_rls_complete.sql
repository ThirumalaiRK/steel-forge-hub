-- COMPREHENSIVE FIX for RLS policies on resources table
-- This will completely reset and recreate the policies

-- Step 1: Drop ALL existing policies
drop policy if exists "Public resources are viewable by everyone" on public.resources;
drop policy if exists "Admins can manage resources" on public.resources;
drop policy if exists "Authenticated users can insert resources" on public.resources;
drop policy if exists "Authenticated users can update resources" on public.resources;
drop policy if exists "Authenticated users can delete resources" on public.resources;

-- Step 2: Temporarily disable RLS to test (OPTIONAL - comment out if you want to keep RLS)
-- alter table public.resources disable row level security;

-- Step 3: Re-enable RLS and create new policies
alter table public.resources enable row level security;

-- Policy 1: Everyone can read (public access)
create policy "Enable read access for all users"
  on public.resources
  for select
  using (true);

-- Policy 2: Authenticated users can insert
create policy "Enable insert for authenticated users only"
  on public.resources
  for insert
  to authenticated
  with check (true);

-- Policy 3: Authenticated users can update
create policy "Enable update for authenticated users only"
  on public.resources
  for update
  to authenticated
  using (true)
  with check (true);

-- Policy 4: Authenticated users can delete
create policy "Enable delete for authenticated users only"
  on public.resources
  for delete
  to authenticated
  using (true);

-- Verify the policies were created
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where tablename = 'resources';
