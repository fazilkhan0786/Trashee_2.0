-- Remote Supabase Migrations for Trashee Consumer App

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

-- Create indexes for coupons_store
CREATE INDEX IF NOT EXISTS coupons_store_category_idx ON coupons_store(category);
CREATE INDEX IF NOT EXISTS coupons_store_is_active_idx ON coupons_store(is_active);
CREATE INDEX IF NOT EXISTS coupons_store_expiry_date_idx ON coupons_store(expiry_date);

-- Set up Row Level Security (RLS) for coupons_store
ALTER TABLE coupons_store ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view active coupons"
  ON coupons_store FOR SELECT
  USING (is_active = true);

-- Policy for service role to manage all coupons
CREATE POLICY "Service role can do all operations on coupons"
  ON coupons_store FOR ALL
  USING (auth.role() = 'service_role');

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('bin', 'partner')),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  fill_level INTEGER,
  last_scanned TIMESTAMP WITH TIME ZONE,
  last_scanned_by TEXT,
  distance TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'full', 'maintenance')),
  rating DECIMAL(3,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for locations
CREATE INDEX IF NOT EXISTS locations_type_idx ON locations(type);
CREATE INDEX IF NOT EXISTS locations_status_idx ON locations(status);
CREATE INDEX IF NOT EXISTS locations_is_active_idx ON locations(is_active);
CREATE INDEX IF NOT EXISTS locations_coordinates_idx ON locations(latitude, longitude);

-- Set up Row Level Security (RLS) for locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view active locations"
  ON locations FOR SELECT
  USING (is_active = true);

-- Policy for service role to manage all locations
CREATE POLICY "Service role can do all operations on locations"
  ON locations FOR ALL
  USING (auth.role() = 'service_role');

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('broadcast', 'alert', 'coupon', 'reward', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  action_label TEXT,
  sender TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);

-- Set up Row Level Security (RLS) for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do all operations on notifications"
  ON notifications FOR ALL
  USING (auth.role() = 'service_role');

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

-- Create indexes for owned_coupons
CREATE INDEX IF NOT EXISTS owned_coupons_user_id_idx ON owned_coupons(user_id);
CREATE INDEX IF NOT EXISTS owned_coupons_coupon_id_idx ON owned_coupons(coupon_id);
CREATE INDEX IF NOT EXISTS owned_coupons_status_idx ON owned_coupons(status);
CREATE INDEX IF NOT EXISTS owned_coupons_expiry_date_idx ON owned_coupons(expiry_date);

-- Set up Row Level Security (RLS) for owned_coupons
ALTER TABLE owned_coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for owned_coupons
CREATE POLICY "Users can view their own owned coupons"
  ON owned_coupons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own owned coupons"
  ON owned_coupons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own owned coupons"
  ON owned_coupons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do all operations on owned coupons"
  ON owned_coupons FOR ALL
  USING (auth.role() = 'service_role');

-- Create transaction_history table
CREATE TABLE IF NOT EXISTS transaction_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('coupon_redemption', 'points_earned', 'points_spent', 'ad_watch', 'scan_reward')),
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  reference_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for transaction_history
CREATE INDEX IF NOT EXISTS transaction_history_user_id_idx ON transaction_history(user_id);
CREATE INDEX IF NOT EXISTS transaction_history_type_idx ON transaction_history(type);
CREATE INDEX IF NOT EXISTS transaction_history_status_idx ON transaction_history(status);
CREATE INDEX IF NOT EXISTS transaction_history_created_at_idx ON transaction_history(created_at);

-- Set up Row Level Security (RLS) for transaction_history
ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;

-- Create policies for transaction_history
CREATE POLICY "Users can view their own transaction history"
  ON transaction_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transaction history"
  ON transaction_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can do all operations on transaction history"
  ON transaction_history FOR ALL
  USING (auth.role() = 'service_role');

-- Create advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in seconds
  points INTEGER NOT NULL,
  advertiser TEXT NOT NULL,
  category TEXT,
  thumbnail TEXT,
  video_url TEXT,
  is_active BOOLEAN DEFAULT true,
  max_views_per_day INTEGER DEFAULT 1000,
  target_audience TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for advertisements
CREATE INDEX IF NOT EXISTS advertisements_is_active_idx ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS advertisements_category_idx ON advertisements(category);
CREATE INDEX IF NOT EXISTS advertisements_advertiser_idx ON advertisements(advertiser);

-- Set up Row Level Security (RLS) for advertisements
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view active advertisements"
  ON advertisements FOR SELECT
  USING (is_active = true);

-- Policy for service role to manage all advertisements
CREATE POLICY "Service role can do all operations on advertisements"
  ON advertisements FOR ALL
  USING (auth.role() = 'service_role');

-- Insert sample data
INSERT INTO coupons_store (product_name, product_image, shop_logo, shop_name, points_cost, original_price, discounted_price, expiry_date, category, distance, rating, description) VALUES
('Pizza Margherita', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100', 'Pizza Palace', 50, 299.00, 199.00, '2025-02-15', 'Food', '0.5 km', 4.5, 'Delicious Margherita pizza with fresh mozzarella and basil'),
('Coffee & Pastry', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100', 'Café Central', 30, 150.00, 99.00, '2025-02-10', 'Food', '0.8 km', 4.2, 'Premium coffee with a fresh pastry of your choice'),
('Movie Ticket', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100', 'CineMax', 100, 500.00, 350.00, '2025-02-20', 'Entertainment', '1.2 km', 4.7, 'Watch any movie of your choice'),
('Gym Session', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100', 'FitLife Gym', 75, 400.00, 250.00, '2025-02-25', 'Health', '1.5 km', 4.3, 'Full day access to gym facilities'),
('Book Store Voucher', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100', 'Readers Corner', 40, 200.00, 150.00, '2025-02-12', 'Lifestyle', '0.9 km', 4.1, 'Get any book of your choice')
ON CONFLICT DO NOTHING;

-- Insert sample locations
INSERT INTO locations (type, name, address, pincode, latitude, longitude, fill_level, distance, status, rating) VALUES
('bin', 'Smart Bin - Central Park', 'Central Park, Main Street', '380001', 23.0258, 72.5873, 65, '0.3 km', 'active', NULL),
('bin', 'Smart Bin - Mall Entrance', 'City Mall, Shopping District', '380002', 23.0268, 72.5883, 85, '0.7 km', 'active', NULL),
('bin', 'Smart Bin - Metro Station', 'Metro Station, Transport Hub', '380003', 23.0278, 72.5893, 45, '1.1 km', 'active', NULL),
('partner', 'Pizza Palace', '123 Food Street, Downtown', '380001', 23.0288, 72.5903, NULL, '0.5 km', 'active', 4.5),
('partner', 'Café Central', '456 Coffee Lane, Midtown', '380002', 23.0298, 72.5913, NULL, '0.8 km', 'active', 4.2),
('partner', 'CineMax', '789 Entertainment Blvd, Uptown', '380003', 23.0308, 72.5923, NULL, '1.2 km', 'active', 4.7)
ON CONFLICT DO NOTHING;

-- Insert sample advertisements
INSERT INTO advertisements (title, description, duration, points, advertiser, category, thumbnail, video_url) VALUES
('Eco-Friendly Products', 'Discover our range of sustainable products that help protect the environment', 30, 5, 'GreenLife', 'Lifestyle', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', 'https://example.com/video1.mp4'),
('Healthy Living Tips', 'Learn simple ways to lead a healthier lifestyle', 45, 8, 'HealthFirst', 'Health', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 'https://example.com/video2.mp4'),
('Local Business Spotlight', 'Support local businesses in your community', 25, 3, 'LocalBiz', 'Business', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', 'https://example.com/video3.mp4'),
('Recycling Guide', 'Master the art of proper recycling', 35, 6, 'RecycleNow', 'Education', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400', 'https://example.com/video4.mp4'),
('Sustainable Fashion', 'Explore eco-friendly fashion choices', 40, 7, 'EcoFashion', 'Fashion', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', 'https://example.com/video5.mp4')
ON CONFLICT DO NOTHING;
