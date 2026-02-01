-- Create notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  type text check (type in ('order', 'enquiry', 'product', 'system')),
  title text not null,
  message text,
  reference_id text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies
create policy "Admins can view notifications" 
  on public.notifications 
  for select 
  using (auth.role() = 'authenticated'); -- Assuming authenticated users are admins for now, or use checking against a roles table

create policy "Admins can insert notifications" 
  on public.notifications 
  for insert 
  with check (auth.role() = 'authenticated');

create policy "Admins can update notifications" 
  on public.notifications 
  for update 
  using (auth.role() = 'authenticated');

-- Enable Realtime
alter publication supabase_realtime add table public.notifications;
