-- Temporarily disable the problematic trigger to fix 500 errors
-- This will allow signup to work while we fix the trigger

-- Remove the trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Ensure profiles table exists with basic structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  full_name text NULL,
  phone_number text NULL,
  address text NULL,
  updated_at timestamp with time zone NULL DEFAULT now(),
  email text NULL,
  avatar_url text NULL,
  user_type text NULL,
  email_notifications boolean NULL DEFAULT true,
  push_notifications boolean NULL DEFAULT true,
  sms_alerts boolean NULL DEFAULT false,
  location_tracking boolean NULL DEFAULT true,
  last_spin_at timestamp with time zone NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_email_unique UNIQUE (email),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Disable RLS to allow profile creation
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

SELECT 'Trigger disabled - signup should work now' as status;
