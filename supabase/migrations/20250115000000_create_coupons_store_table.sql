-- Create coupons_store table
CREATE TABLE IF NOT EXISTS coupons_store (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name TEXT NOT NULL,
  product_image TEXT,
  shop_logo TEXT,
  shop_name TEXT NOT NULL,
  points_cost INTEGER NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2) NOT NULL,
  expiry_date DATE NOT NULL,
  category TEXT,
  distance TEXT,
  rating DECIMAL(3,2),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS coupons_store_category_idx ON coupons_store(category);
CREATE INDEX IF NOT EXISTS coupons_store_is_active_idx ON coupons_store(is_active);
CREATE INDEX IF NOT EXISTS coupons_store_expiry_date_idx ON coupons_store(expiry_date);

-- Set up Row Level Security (RLS)
ALTER TABLE coupons_store ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view active coupons"
  ON coupons_store FOR SELECT
  USING (is_active = true);

-- Policy for service role to manage all coupons
CREATE POLICY "Service role can do all operations on coupons"
  ON coupons_store FOR ALL
  USING (auth.role() = 'service_role');
