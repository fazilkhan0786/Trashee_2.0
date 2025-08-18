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

-- Create indexes
CREATE INDEX IF NOT EXISTS advertisements_is_active_idx ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS advertisements_category_idx ON advertisements(category);
CREATE INDEX IF NOT EXISTS advertisements_advertiser_idx ON advertisements(advertiser);

-- Set up Row Level Security (RLS)
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view active advertisements"
  ON advertisements FOR SELECT
  USING (is_active = true);

-- Policy for service role to manage all advertisements
CREATE POLICY "Service role can do all operations on advertisements"
  ON advertisements FOR ALL
  USING (auth.role() = 'service_role');
