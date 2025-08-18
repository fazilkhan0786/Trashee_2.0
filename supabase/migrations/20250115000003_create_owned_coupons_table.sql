-- Create owned_coupons table
CREATE TABLE IF NOT EXISTS owned_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coupon_id UUID REFERENCES coupons_store(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  shop_logo TEXT,
  product_image TEXT,
  value DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2) NOT NULL,
  redeemed_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'used')),
  qr_code TEXT,
  shop_address TEXT,
  shop_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS owned_coupons_user_id_idx ON owned_coupons(user_id);
CREATE INDEX IF NOT EXISTS owned_coupons_coupon_id_idx ON owned_coupons(coupon_id);
CREATE INDEX IF NOT EXISTS owned_coupons_status_idx ON owned_coupons(status);
CREATE INDEX IF NOT EXISTS owned_coupons_expiry_date_idx ON owned_coupons(expiry_date);

-- Set up Row Level Security (RLS)
ALTER TABLE owned_coupons ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy for users to view their own owned coupons
CREATE POLICY "Users can view their own owned coupons"
  ON owned_coupons FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own owned coupons
CREATE POLICY "Users can insert their own owned coupons"
  ON owned_coupons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own owned coupons
CREATE POLICY "Users can update their own owned coupons"
  ON owned_coupons FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for service role to manage all owned coupons
CREATE POLICY "Service role can do all operations on owned coupons"
  ON owned_coupons FOR ALL
  USING (auth.role() = 'service_role');
