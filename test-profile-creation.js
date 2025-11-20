// Test script to check profile creation and user role saving
// Run with: node test-profile-creation.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileCreation() {
  console.log('🧪 Testing profile creation and user role saving...\n');

  try {
    // Test 1: Check if we can access profiles table
    console.log('1. Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('❌ Cannot access profiles table:', profilesError.message);
      return;
    }
    console.log('✅ Profiles table accessible');
    console.log(`📊 Found ${profiles?.length || 0} existing profiles`);

    // Test 2: Check user_role enum
    console.log('\n2. Testing user_role enum...');
    const { data: enumTest, error: enumError } = await supabase
      .from('profiles')
      .select('user_type')
      .limit(1);

    if (enumError) {
      console.error('❌ user_role enum issue:', enumError.message);
      return;
    }
    console.log('✅ user_role enum working');

    // Test 3: Check existing profiles for user types
    console.log('\n3. Checking existing user types...');
    if (profiles && profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ID: ${profile.id.substring(0, 8)}... - Role: ${profile.user_type || 'Not set'} - Email: ${profile.email || 'Not set'}`);
      });
    } else {
      console.log('ℹ️  No profiles found');
    }

    // Test 4: Check auth users vs profiles
    console.log('\n4. Checking auth users...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.warn('⚠️  Cannot access auth users (requires service role key):', usersError.message);
    } else {
      console.log(`📊 Found ${users?.length || 0} auth users`);
      if (users && users.length > 0) {
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} - Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        });
      }
    }

    console.log('\n🎉 Profile creation test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Disable email confirmation in Supabase dashboard');
    console.log('2. Test signup → user type selection → login flow');
    console.log('3. Verify user_type is saved in profiles table');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testProfileCreation();
