-- TEMPORARY FIX: Disable RLS entirely for testing
-- Use this ONLY for development/testing to verify the app works
-- Re-enable RLS later with proper policies

alter table public.resources disable row level security;

-- To re-enable later, run:
-- alter table public.resources enable row level security;
-- Then use fix_resources_rls_complete.sql to add proper policies
