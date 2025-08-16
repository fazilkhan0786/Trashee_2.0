-- Create scan_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS scan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bin_id TEXT NOT NULL,
  location TEXT,
  points INTEGER DEFAULT 0,
  scan_type TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS scan_history_user_id_idx ON scan_history(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy for users to view their own scan history
CREATE POLICY "Users can view their own scan history"
  ON scan_history FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own scan history
CREATE POLICY "Users can insert their own scan history"
  ON scan_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for service role to manage all scan history records
CREATE POLICY "Service role can do all operations on scan history"
  ON scan_history FOR ALL
  USING (auth.role() = 'service_role');