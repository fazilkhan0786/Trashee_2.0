-- Fix Row Level Security policies for profiles table
-- Run this in your Supabase SQL Editor

-- First, let's check what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Drop existing policies that might be blocking profile creation
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can do all operations on profiles" ON profiles;

-- Create new policies that allow profile creation during signup
-- Policy for users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy for users to insert their own profile (this is the key one we need)
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy for service role to manage all profiles
CREATE POLICY "Service role can do all operations on profiles"
  ON profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Alternative: If the above doesn't work, try this more permissive policy
-- (Only use this for testing, then make it more restrictive later)
-- DROP POLICY IF EXISTS "Allow authenticated users to manage profiles" ON profiles;
-- CREATE POLICY "Allow authenticated users to manage profiles"
--   ON profiles FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
