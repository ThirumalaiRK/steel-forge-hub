-- Fix RLS policies for resources table
-- Run this in Supabase SQL Editor to fix the "row-level security policy" error

-- First, drop the old policy
drop policy if exists "Admins can manage resources" on public.resources;

-- Create separate policies for each operation
create policy "Authenticated users can insert resources" 
  on public.resources for insert 
  to authenticated
  with check (true);

create policy "Authenticated users can update resources" 
  on public.resources for update 
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete resources" 
  on public.resources for delete 
  to authenticated
  using (true);
