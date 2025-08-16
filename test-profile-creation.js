// Script to test profile creation
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ascqdjqxiuygvvmawyrx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzY3FkanF4aXV5Z3Z2bWF3eXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzc5MjQsImV4cCI6MjA3MDY1MzkyNH0.64i-QDqj3Fb4anYglDticz9r5cytIa5_nwpdbxHYOok";

if (!SUPABASE_URL) {
  throw new Error('Missing Supabase URL');
}

if (!SUPABASE_KEY) {
  throw new Error('Missing Supabase Key');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testProfileCreation() {
  try {
    console.log('Testing profile creation...');
    
    // 1. Create a test user
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';
    
    console.log(`Creating test user with email: ${email}`);
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: 'Test User',
          phone: '555-123-4567',
          user_type: '0' // Consumer
        }
      }
    });
    
    if (signupError) {
      console.error('Error creating test user:', signupError.message);
      return false;
    }
    
    console.log('Test user created successfully');
    console.log('User ID:', signupData.user.id);
    
    // 2. Wait a moment for the trigger to execute
    console.log('Waiting for database trigger to execute...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Check if profile was created
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', signupData.user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
      return false;
    }
    
    if (!profileData) {
      console.error('Profile not found for the test user');
      return false;
    }
    
    console.log('Profile created successfully:');
    console.log(profileData);
    
    // 4. Clean up - delete the test user
    // Note: This requires admin privileges which the anon key doesn't have
    // In a real test environment, you would use a service role key to clean up
    
    return true;
  } catch (err) {
    console.error('Unexpected error testing profile creation:', err);
    return false;
  }
}

testProfileCreation().then(result => {
  console.log(`\nProfile creation test ${result ? 'passed' : 'failed'}`);
});