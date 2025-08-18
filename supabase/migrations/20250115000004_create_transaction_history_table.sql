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

-- Create indexes
CREATE INDEX IF NOT EXISTS transaction_history_user_id_idx ON transaction_history(user_id);
CREATE INDEX IF NOT EXISTS transaction_history_type_idx ON transaction_history(type);
CREATE INDEX IF NOT EXISTS transaction_history_status_idx ON transaction_history(status);
CREATE INDEX IF NOT EXISTS transaction_history_created_at_idx ON transaction_history(created_at);

-- Set up Row Level Security (RLS)
ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy for users to view their own transaction history
CREATE POLICY "Users can view their own transaction history"
  ON transaction_history FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own transaction history
CREATE POLICY "Users can insert their own transaction history"
  ON transaction_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for service role to manage all transaction history
CREATE POLICY "Service role can do all operations on transaction history"
  ON transaction_history FOR ALL
  USING (auth.role() = 'service_role');
