-- Create resources table for Technical Library
create table if not exists public.resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  format text not null default 'PDF',
  size text,
  image text,
  summary text,
  file_url text, -- URL to the actual file
  is_gated boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.resources enable row level security;

-- Public can view all resources (filtering gated status happens in UI or specific download logic)
create policy "Public resources are viewable by everyone" 
  on public.resources for select 
  using (true);

-- Authenticated users can insert resources
create policy "Authenticated users can insert resources" 
  on public.resources for insert 
  to authenticated
  with check (true);

-- Authenticated users can update resources
create policy "Authenticated users can update resources" 
  on public.resources for update 
  to authenticated
  using (true)
  with check (true);

-- Authenticated users can delete resources
create policy "Authenticated users can delete resources" 
  on public.resources for delete 
  to authenticated
  using (true);
