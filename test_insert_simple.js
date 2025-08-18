import { createClient } from '@supabase/supabase-js';

// Remote Supabase configuration
const supabaseUrl = 'https://ascqdjqxiuygvvmawyrx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzY3FkanF4aXV5Z3Z2bWF3eXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzc5MjQsImV4cCI6MjA3MDY1MzkyNH0.64i-QDqj3Fb4anYglDticz9r5cytIa5_nwpdbxHYOok';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSimpleInsert() {
  try {
    console.log('Testing simple inserts to check table schemas...');
    
    // Test coupons_store with minimal data
    console.log('\n1. Testing coupons_store insert...');
    const { data: couponData, error: couponError } = await supabase
      .from('coupons_store')
      .insert({
        product_name: 'Test Pizza',
        shop_name: 'Test Shop',
        points_cost: 50,
        original_price: 100.00,
        discounted_price: 80.00,
        expiry_date: '2025-02-15'
      })
      .select();

    if (couponError) {
      console.log('❌ Coupons error:', couponError.message);
    } else {
      console.log('✅ Coupon inserted successfully');
      console.log('📊 Coupon columns:', Object.keys(couponData[0]));
    }

    // Test locations with minimal data
    console.log('\n2. Testing locations insert...');
    const { data: locationData, error: locationError } = await supabase
      .from('locations')
      .insert({
        type: 'bin',
        name: 'Test Bin',
        address: 'Test Address',
        pincode: '123456'
      })
      .select();

    if (locationError) {
      console.log('❌ Locations error:', locationError.message);
    } else {
      console.log('✅ Location inserted successfully');
      console.log('📊 Location columns:', Object.keys(locationData[0]));
    }

    // Test advertisements with minimal data
    console.log('\n3. Testing advertisements insert...');
    const { data: adData, error: adError } = await supabase
      .from('advertisements')
      .insert({
        title: 'Test Ad',
        duration: 30,
        points: 5
      })
      .select();

    if (adError) {
      console.log('❌ Advertisements error:', adError.message);
    } else {
      console.log('✅ Advertisement inserted successfully');
      console.log('📊 Advertisement columns:', Object.keys(adData[0]));
    }
    
  } catch (error) {
    console.error('❌ Error testing inserts:', error);
  }
}

// Run the test
testSimpleInsert();
