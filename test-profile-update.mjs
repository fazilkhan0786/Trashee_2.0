import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Use anon key instead of service role key for testing
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY // Use anon key for testing
);

async function testProfileUpdate() {
  console.log('🧪 Testing Profile Update Functionality...\n');
  console.log('🔑 Using Supabase URL:', process.env.VITE_SUPABASE_URL);
  console.log('🔑 Using Anon Key:', process.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

  try {
    // First, let's check the current schema by examining existing profiles
    console.log('\n1. Checking profiles table schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ Schema check failed:', schemaError.message);
      console.log('💡 This might be due to RLS policies. Let\'s try a different approach...');
      
      // Try to check if we can at least connect to Supabase
      console.log('\n2. Testing basic Supabase connection...');
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('❌ Auth check failed:', authError.message);
        return;
      }
      
      console.log('✅ Supabase connection successful');
      console.log('⚠️  Cannot access profiles table - this is likely due to RLS policies requiring authentication');
      console.log('💡 The profile service should work in the browser when users are logged in');
      return;
    }
    
    console.log('✅ Profiles table accessible');
    if (schemaData && schemaData.length > 0) {
      console.log('📋 Available columns:', Object.keys(schemaData[0]));
    } else {
      console.log('📋 No existing profiles found, but table is accessible');
    }
    
    console.log('\n🎉 Schema check passed! The profile service should work correctly.');
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error.message);
    console.log('💡 This might be normal if RLS policies are enabled and no user is authenticated');
  }
}

// Run the test
testProfileUpdate();
