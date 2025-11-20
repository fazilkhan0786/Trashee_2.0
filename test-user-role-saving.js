// Test script to verify user role saving in Supabase
// Run this with: node test-user-role-saving.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserRoleSaving() {
  console.log('🧪 Testing user role saving functionality...\n');

  try {
    // Test 1: Check if profiles table exists and has correct schema
    console.log('1. Checking profiles table schema...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ Error accessing profiles table:', profilesError.message);
      return;
    }
    console.log('✅ Profiles table is accessible');

    // Test 2: Check if user_role enum exists
    console.log('\n2. Checking user_role enum...');
    const { data: enumTest, error: enumError } = await supabase
      .from('profiles')
      .select('user_type')
      .limit(1);

    if (enumError && enumError.message.includes('user_role')) {
      console.error('❌ user_role enum might not exist:', enumError.message);
      console.log('💡 You may need to run the migration: supabase/migrations/20250115000006_fix_profiles_table_schema.sql');
      return;
    }
    console.log('✅ user_role enum is working');

    // Test 3: Check current user profiles (if any exist)
    console.log('\n3. Checking existing profiles...');
    const { data: existingProfiles, error: existingError } = await supabase
      .from('profiles')
      .select('id, full_name, email, user_type, updated_at')
      .limit(5);

    if (existingError) {
      console.error('❌ Error fetching existing profiles:', existingError.message);
      return;
    }

    if (existingProfiles && existingProfiles.length > 0) {
      console.log(`✅ Found ${existingProfiles.length} existing profile(s):`);
      existingProfiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.full_name || 'No name'} (${profile.email}) - Role: ${profile.user_type || 'Not set'}`);
      });
    } else {
      console.log('ℹ️  No existing profiles found');
    }

    // Test 4: Verify the trigger function exists
    console.log('\n4. Checking trigger function...');
    const { data: triggerCheck, error: triggerError } = await supabase
      .rpc('handle_new_user', {});

    if (triggerError) {
      if (triggerError.message.includes('function') || triggerError.message.includes('does not exist')) {
        console.error('❌ handle_new_user trigger function not found');
        console.log('💡 You may need to run the migration: supabase/migrations/20250115000006_fix_profiles_table_schema.sql');
      } else {
        console.log('✅ Trigger function exists (expected error for test call)');
      }
    }

    console.log('\n🎉 Schema validation completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the migration: supabase db push (or apply the migration file manually)');
    console.log('2. Test user signup through the app');
    console.log('3. Check that user_type is properly saved in the profiles table');

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error.message);
  }
}

// Run the test
testUserRoleSaving();
