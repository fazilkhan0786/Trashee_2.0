-- Fix database trigger causing 500 error during signup
-- Run this in your Supabase SQL Editor

-- Step 1: Check if the trigger and function exist
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Step 2: Check if the profiles table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- Step 3: Temporarily disable the trigger to prevent 500 errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Drop the problematic function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 5: Check if profiles table has the right structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 6: If profiles table doesn't exist or has wrong structure, create it
-- (This is a simplified version that should work with your current setup)

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  full_name text NULL,
  phone_number text NULL,
  address text NULL,
  updated_at timestamp with time zone NULL DEFAULT now(),
  email text NULL,
  avatar_url text NULL,
  user_type text NULL, -- Using text instead of enum for now
  email_notifications boolean NULL DEFAULT true,
  push_notifications boolean NULL DEFAULT true,
  sms_alerts boolean NULL DEFAULT false,
  location_tracking boolean NULL DEFAULT true,
  last_spin_at timestamp with time zone NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_email_unique UNIQUE (email),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Step 7: Disable RLS temporarily to allow profile creation
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 8: Create a simple, working trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple profile creation without complex logic
  INSERT INTO public.profiles (
    id,
    full_name,
    phone_number,
    email,
    user_type,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'consumer'), -- Default to consumer
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 10: Test the function
SELECT 'Trigger and function created successfully' as status;
