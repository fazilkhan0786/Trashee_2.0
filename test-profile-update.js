const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY // Use service role for testing
);

async function testProfileUpdate() {
  console.log('🧪 Testing Profile Update Functionality...\n');

  try {
    // First, let's check the current schema
    console.log('1. Checking profiles table schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ Schema check failed:', schemaError.message);
      return;
    }
    
    console.log('✅ Profiles table accessible');
    
    // Test creating a test profile
    console.log('\n2. Testing profile creation...');
    const testUserId = 'test-user-' + Date.now();
    
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert([{
        user_id: testUserId,
        name: 'Test User',
        phone: '+1234567890',
        user_type: 'consumer',
        status: 'active',
        address: '123 Test Street',
        avatar_url: 'https://example.com/avatar.jpg',
        points: 0
      }])
      .select();
    
    if (insertError) {
      console.error('❌ Profile creation failed:', insertError.message);
      return;
    }
    
    console.log('✅ Profile created successfully:', insertData[0]);
    
    // Test updating the profile
    console.log('\n3. Testing profile update...');
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({
        name: 'Updated Test User',
        address: '456 Updated Street',
        avatar_url: 'https://example.com/new-avatar.jpg',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', testUserId)
      .select();
    
    if (updateError) {
      console.error('❌ Profile update failed:', updateError.message);
      return;
    }
    
    console.log('✅ Profile updated successfully:', updateData[0]);
    
    // Clean up - delete test profile
    console.log('\n4. Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', testUserId);
    
    if (deleteError) {
      console.error('⚠️  Cleanup failed:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up');
    }
    
    console.log('\n🎉 All profile tests passed! The schema is working correctly.');
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error.message);
  }
}

// Run the test
testProfileUpdate();
