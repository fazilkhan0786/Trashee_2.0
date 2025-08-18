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

-- Create indexes
CREATE INDEX IF NOT EXISTS locations_type_idx ON locations(type);
CREATE INDEX IF NOT EXISTS locations_status_idx ON locations(status);
CREATE INDEX IF NOT EXISTS locations_is_active_idx ON locations(is_active);
CREATE INDEX IF NOT EXISTS locations_coordinates_idx ON locations(latitude, longitude);

-- Set up Row Level Security (RLS)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view active locations"
  ON locations FOR SELECT
  USING (is_active = true);

-- Policy for service role to manage all locations
CREATE POLICY "Service role can do all operations on locations"
  ON locations FOR ALL
  USING (auth.role() = 'service_role');
