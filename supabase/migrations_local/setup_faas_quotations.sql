-- ============================================
-- FaaS Quotation System - Database Setup (Safe Version)
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create faas_quotations table
CREATE TABLE IF NOT EXISTS faas_quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_number TEXT UNIQUE NOT NULL,
  
  -- Product Details
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  metal_type TEXT,
  
  -- Rental Configuration
  rental_duration TEXT NOT NULL CHECK (rental_duration IN ('monthly', 'quarterly', 'annual', 'custom')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  usage_context TEXT CHECK (usage_context IN ('office', 'factory', 'home', 'other')),
  custom_duration_months INTEGER,
  
  -- Customer Details
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  company_name TEXT,
  gst_number TEXT,
  
  -- Address
  delivery_address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  
  -- Quotation Details
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected', 'expired', 'converted')),
  monthly_rental_amount DECIMAL(10,2),
  setup_fee DECIMAL(10,2) DEFAULT 0,
  deposit_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Additional Info
  special_requirements TEXT,
  notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  quoted_at TIMESTAMP,
  valid_until TIMESTAMP,
  accepted_at TIMESTAMP,
  
  -- Admin Assignment
  assigned_to UUID,
  
  -- Metadata
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'phone', 'email', 'walk-in')),
  ip_address TEXT,
  user_agent TEXT,
  
  -- Conversion tracking
  converted_to_order_id UUID
);

-- ============================================
-- Step 2: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_faas_quotations_status 
ON faas_quotations(status);

CREATE INDEX IF NOT EXISTS idx_faas_quotations_created_at 
ON faas_quotations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_faas_quotations_customer_email 
ON faas_quotations(customer_email);

CREATE INDEX IF NOT EXISTS idx_faas_quotations_quotation_number 
ON faas_quotations(quotation_number);

CREATE INDEX IF NOT EXISTS idx_faas_quotations_product_id 
ON faas_quotations(product_id);

-- ============================================
-- Step 3: Create trigger for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists to avoid error
DROP TRIGGER IF EXISTS update_faas_quotations_updated_at ON faas_quotations;

CREATE TRIGGER update_faas_quotations_updated_at
BEFORE UPDATE ON faas_quotations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Step 4: Create function to generate quotation number
-- ============================================

CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  count_this_year INTEGER;
  next_number TEXT;
BEGIN
  current_year := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COUNT(*) INTO count_this_year
  FROM faas_quotations
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  next_number := LPAD((count_this_year + 1)::TEXT, 4, '0');
  
  RETURN 'FQ-' || current_year || '-' || next_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Step 5: Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE faas_quotations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid errors
DROP POLICY IF EXISTS "Anyone can submit quote requests" ON faas_quotations;
DROP POLICY IF EXISTS "Users can view own quotations" ON faas_quotations;
DROP POLICY IF EXISTS "Admins can view all quotations" ON faas_quotations;
DROP POLICY IF EXISTS "Admins can update quotations" ON faas_quotations;

-- Policy: Anyone can insert (submit quote request)
CREATE POLICY "Anyone can submit quote requests"
ON faas_quotations
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Users can view their own quotations by email
CREATE POLICY "Users can view own quotations"
ON faas_quotations
FOR SELECT
TO public
USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Admins can view all quotations
CREATE POLICY "Admins can view all quotations"
ON faas_quotations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Policy: Admins can update quotations
CREATE POLICY "Admins can update quotations"
ON faas_quotations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- ============================================
-- Step 6: Create optional quotation_items table
-- (For future: multiple products per quotation)
-- ============================================

CREATE TABLE IF NOT EXISTS faas_quotation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID REFERENCES faas_quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  metal_type TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  monthly_rate DECIMAL(10,2),
  setup_fee DECIMAL(10,2) DEFAULT 0,
  total_monthly DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faas_quotation_items_quotation_id 
ON faas_quotation_items(quotation_id);

-- ============================================
-- Step 7: Create view for quotation statistics
-- ============================================

CREATE OR REPLACE VIEW faas_quotation_stats AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'quoted') as quoted_count,
  COUNT(*) FILTER (WHERE status = 'accepted') as accepted_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COUNT(*) FILTER (WHERE status = 'expired') as expired_count,
  COUNT(*) FILTER (WHERE status = 'converted') as converted_count,
  COUNT(*) as total_count,
  ROUND(AVG(total_amount), 2) as avg_quotation_value,
  SUM(total_amount) FILTER (WHERE status = 'accepted') as total_accepted_value,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'accepted')::DECIMAL / 
    NULLIF(COUNT(*) FILTER (WHERE status IN ('quoted', 'accepted', 'rejected')), 0)) * 100, 
    2
  ) as conversion_rate
FROM faas_quotations;

-- ============================================
-- Step 8: Insert sample data (safely)
-- ============================================

-- Only insert if it doesn't exist
INSERT INTO faas_quotations (
  quotation_number,
  product_id,
  product_name,
  metal_type,
  rental_duration,
  quantity,
  usage_context,
  customer_name,
  customer_email,
  customer_phone,
  company_name,
  delivery_address,
  city,
  state,
  pincode,
  status,
  monthly_rental_amount,
  setup_fee,
  deposit_amount,
  total_amount,
  special_requirements,
  source
) 
SELECT
  'FQ-2026-0001',
  (SELECT id FROM products WHERE slug = 'industrial-metal-work-table' LIMIT 1),
  'Industrial Metal Work Table',
  'MS',
  'monthly',
  5,
  'factory',
  'John Doe',
  'john@example.com',
  '+91 98765 43210',
  'ABC Manufacturing Ltd',
  '123 Industrial Area, Sector 5',
  'Mumbai',
  'Maharashtra',
  '400001',
  'pending',
  2500.00,
  1000.00,
  5000.00,
  8500.00,
  'Need delivery by next week',
  'website'
WHERE NOT EXISTS (
  SELECT 1 FROM faas_quotations WHERE quotation_number = 'FQ-2026-0001'
);

-- ============================================
-- Step 9: Create function to auto-expire quotations
-- ============================================

CREATE OR REPLACE FUNCTION expire_old_quotations()
RETURNS void AS $$
BEGIN
  UPDATE faas_quotations
  SET status = 'expired'
  WHERE status IN ('pending', 'quoted')
  AND valid_until < NOW()
  AND valid_until IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Step 10: Verify setup
-- ============================================

SELECT count(*) as quotations_count FROM faas_quotations;
