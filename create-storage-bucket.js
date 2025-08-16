// Script to create a storage bucket for profiles
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createProfilesBucket() {
  try {
    console.log('Creating profiles storage bucket...');
    
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const profilesBucketExists = buckets.some(bucket => bucket.name === 'profiles');
    
    if (profilesBucketExists) {
      console.log('Profiles bucket already exists');
      return;
    }
    
    // Create the bucket
    const { error: createError } = await supabase.storage.createBucket('profiles', {
      public: true,
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (createError) {
      console.error('Error creating profiles bucket:', createError);
    } else {
      console.log('Profiles bucket created successfully');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createProfilesBucket();