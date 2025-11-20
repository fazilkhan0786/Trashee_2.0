-- Fix profiles table schema to match the expected structure
-- This migration aligns the database schema with the user_role enum and correct column names

-- First, create the user_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('CONSUMER', 'PARTNER', 'COLLECTOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing profiles table to recreate with correct schema
DROP TABLE IF EXISTS profiles CASCADE;

-- Recreate profiles table with correct schema matching the user's requirements
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text NULL,
  phone_number text NULL,
  address text NULL,
  updated_at timestamp with time zone NULL DEFAULT now(),
  email text NULL,
  avatar_url text NULL,
  user_type public.user_role NULL,
  email_notifications boolean NULL DEFAULT true,
  push_notifications boolean NULL DEFAULT true,
  sms_alerts boolean NULL DEFAULT false,
  location_tracking boolean NULL DEFAULT true,
  last_spin_at timestamp with time zone NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_email_unique UNIQUE (email),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_user_type_idx ON profiles(user_type);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for the profiles table
-- Policy for users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy for users to insert their own profile
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

-- Create new trigger function that matches the corrected schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    phone_number,
    email,
    address,
    avatar_url,
    user_type,
    email_notifications,
    push_notifications,
    sms_alerts,
    location_tracking,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.email,
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN NEW.raw_user_meta_data->>'user_type' = 'CONSUMER' THEN 'CONSUMER'::public.user_role
      WHEN NEW.raw_user_meta_data->>'user_type' = 'PARTNER' THEN 'PARTNER'::public.user_role
      WHEN NEW.raw_user_meta_data->>'user_type' = 'COLLECTOR' THEN 'COLLECTOR'::public.user_role
      ELSE 'CONSUMER'::public.user_role
    END,
    COALESCE((NEW.raw_user_meta_data->>'email_notifications')::boolean, true),
    COALESCE((NEW.raw_user_meta_data->>'push_notifications')::boolean, true),
    COALESCE((NEW.raw_user_meta_data->>'sms_alerts')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'location_tracking')::boolean, true),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    address = EXCLUDED.address,
    avatar_url = EXCLUDED.avatar_url,
    user_type = EXCLUDED.user_type,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
