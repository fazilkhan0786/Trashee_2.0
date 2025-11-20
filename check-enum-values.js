// Script to check the actual user_role enum values in the database
// Run with: node check-enum-values.js

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

async function checkEnumValues() {
  console.log('🔍 Checking user_role enum values in database...\n');

  try {
    // Method 1: Try to query the enum values directly
    console.log('1. Trying to query enum values directly...');
    try {
      const { data, error } = await supabase
        .rpc('get_enum_values', { enum_name: 'user_role' });
      
      if (error) {
        console.log('❌ Direct enum query failed:', error.message);
      } else {
        console.log('✅ Enum values:', data);
      }
    } catch (err) {
      console.log('❌ Direct enum query not available');
    }

    // Method 2: Try to insert different values to see what works
    console.log('\n2. Testing different enum values...');
    
    const testValues = [
      'CONSUMER',
      'consumer', 
      'Consumer',
      'CONSUMER_ROLE',
      'consumer_role',
      'PARTNER',
      'partner',
      'Partner',
      'COLLECTOR',
      'collector',
      'Collector'
    ];

    for (const value of testValues) {
      try {
        // Try to create a test profile with this enum value
        const testId = '00000000-0000-0000-0000-000000000001';
        
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: testId,
            user_type: value,
            full_name: 'Test User',
            email: 'test@example.com'
          });

        if (error) {
          if (error.message.includes('invalid input value for enum')) {
            console.log(`❌ "${value}" - Invalid enum value`);
          } else if (error.message.includes('duplicate key')) {
            console.log(`✅ "${value}" - Valid enum value (duplicate key error is expected)`);
          } else {
            console.log(`⚠️  "${value}" - Other error:`, error.message);
          }
        } else {
          console.log(`✅ "${value}" - Valid enum value!`);
          // Clean up the test record
          await supabase.from('profiles').delete().eq('id', testId);
        }
      } catch (err) {
        console.log(`❌ "${value}" - Error:`, err.message);
      }
    }

    // Method 3: Check existing profiles to see what enum values are already in use
    console.log('\n3. Checking existing enum values in profiles table...');
    const { data: existingProfiles, error: existingError } = await supabase
      .from('profiles')
      .select('user_type')
      .not('user_type', 'is', null);

    if (existingError) {
      console.log('❌ Error fetching existing profiles:', existingError.message);
    } else {
      const uniqueValues = [...new Set(existingProfiles?.map(p => p.user_type))];
      console.log('📊 Existing enum values in database:', uniqueValues);
    }

    // Method 4: Try to get the enum definition from information_schema
    console.log('\n4. Checking enum definition from information_schema...');
    try {
      const { data: enumDef, error: enumDefError } = await supabase
        .rpc('get_enum_definition', { enum_name: 'user_role' });
      
      if (enumDefError) {
        console.log('❌ Could not get enum definition:', enumDefError.message);
      } else {
        console.log('✅ Enum definition:', enumDef);
      }
    } catch (err) {
      console.log('❌ Enum definition query not available');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkEnumValues();
