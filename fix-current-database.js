// Script to fix the current database setup
// This will work with your existing schema

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

async function fixDatabaseSetup() {
  console.log('🔧 Fixing database setup for user role saving...\n');

  try {
    // Test 1: Check current profiles table structure
    console.log('1. Checking current profiles table structure...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ Cannot access profiles table:', profilesError.message);
      return;
    }

    console.log('✅ Profiles table accessible');
    if (profiles && profiles.length > 0) {
      console.log('📊 Sample profile structure:', Object.keys(profiles[0]));
    }

    // Test 2: Try to create a profile with simple text values
    console.log('\n2. Testing profile creation with simple text values...');
    
    const testUserId = '00000000-0000-0000-0000-000000000001';
    const testValues = ['consumer', 'partner', 'collector', 'CONSUMER', 'PARTNER', 'COLLECTOR'];

    for (const userType of testValues) {
      try {
        // First, delete any existing test record
        await supabase.from('profiles').delete().eq('id', testUserId);

        const { error } = await supabase
          .from('profiles')
          .insert({
            id: testUserId,
            user_type: userType,
            full_name: 'Test User',
            email: 'test@example.com',
            phone_number: '1234567890'
          });

        if (error) {
          if (error.message.includes('row-level security')) {
            console.log(`⚠️  "${userType}" - RLS policy blocking (but value might be valid)`);
          } else {
            console.log(`❌ "${userType}" - Error:`, error.message);
          }
        } else {
          console.log(`✅ "${userType}" - SUCCESS! This value works`);
          // Clean up
          await supabase.from('profiles').delete().eq('id', testUserId);
          break;
        }
      } catch (err) {
        console.log(`❌ "${userType}" - Exception:`, err.message);
      }
    }

    // Test 3: Check if we can update an existing profile (bypassing RLS for inserts)
    console.log('\n3. Testing profile update (if any profiles exist)...');
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id, user_type')
      .limit(1);

    if (existingProfiles && existingProfiles.length > 0) {
      const existingProfile = existingProfiles[0];
      console.log(`📊 Found existing profile with ID: ${existingProfile.id.substring(0, 8)}...`);
      
      // Try to update it with different user_type values
      for (const userType of ['consumer', 'CONSUMER', 'partner', 'PARTNER']) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ user_type: userType })
            .eq('id', existingProfile.id);

          if (error) {
            console.log(`❌ Update with "${userType}" failed:`, error.message);
          } else {
            console.log(`✅ Update with "${userType}" succeeded!`);
            // Restore original value
            await supabase
              .from('profiles')
              .update({ user_type: existingProfile.user_type })
              .eq('id', existingProfile.id);
            break;
          }
        } catch (err) {
          console.log(`❌ Update with "${userType}" exception:`, err.message);
        }
      }
    } else {
      console.log('ℹ️  No existing profiles found to test updates');
    }

    console.log('\n🎉 Database setup analysis completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Based on the results above, update the UserTypeSelection component');
    console.log('2. Use the working user_type values (likely lowercase)');
    console.log('3. Handle RLS policies if needed');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixDatabaseSetup();
