-- Enhanced Order Management Schema
-- This extends the existing orders system without breaking changes

-- 1. Customer Details Table
create table if not exists public.order_customer_details (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  company text,
  gst_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Order Addresses Table
create table if not exists public.order_addresses (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  address_type text not null check (address_type in ('shipping', 'billing')),
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text default 'India' not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Order Payment Details Table
create table if not exists public.order_payment_details (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  payment_type text not null check (payment_type in ('pay_on_delivery', 'bank_transfer', 'online_payment', 'test_order')),
  payment_status text default 'unpaid' check (payment_status in ('unpaid', 'paid', 'partially_paid')),
  transaction_id text,
  payment_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Add order_notes column to existing orders table (safe extension)
alter table public.orders add column if not exists order_notes text;
alter table public.orders add column if not exists order_status text default 'pending' check (order_status in ('pending', 'confirmed', 'in_production', 'shipped', 'completed', 'cancelled'));

-- Create indexes for performance
create index if not exists idx_order_customer_details_order_id on public.order_customer_details(order_id);
create index if not exists idx_order_addresses_order_id on public.order_addresses(order_id);
create index if not exists idx_order_payment_details_order_id on public.order_payment_details(order_id);

-- RLS Policies
alter table public.order_customer_details enable row level security;
alter table public.order_addresses enable row level security;
alter table public.order_payment_details enable row level security;

-- Public can insert their own order details
create policy "Users can insert their order customer details"
  on public.order_customer_details for insert
  to public
  with check (true);

create policy "Users can insert their order addresses"
  on public.order_addresses for insert
  to public
  with check (true);

create policy "Users can insert their payment details"
  on public.order_payment_details for insert
  to public
  with check (true);

-- Authenticated users can view all order details (for admin)
create policy "Authenticated users can view all customer details"
  on public.order_customer_details for select
  to authenticated
  using (true);

create policy "Authenticated users can view all addresses"
  on public.order_addresses for select
  to authenticated
  using (true);

create policy "Authenticated users can view all payment details"
  on public.order_payment_details for select
  to authenticated
  using (true);

-- Authenticated users can update order details
create policy "Authenticated users can update customer details"
  on public.order_customer_details for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can update addresses"
  on public.order_addresses for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can update payment details"
  on public.order_payment_details for update
  to authenticated
  using (true)
  with check (true);

-- Authenticated users can delete order details
create policy "Authenticated users can delete customer details"
  on public.order_customer_details for delete
  to authenticated
  using (true);

create policy "Authenticated users can delete addresses"
  on public.order_addresses for delete
  to authenticated
  using (true);

create policy "Authenticated users can delete payment details"
  on public.order_payment_details for delete
  to authenticated
  using (true);
