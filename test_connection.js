import { createClient } from '@supabase/supabase-js';

// Remote Supabase configuration
const supabaseUrl = 'https://ascqdjqxiuygvvmawyrx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzY3FkanF4aXV5Z3Z2bWF3eXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzc5MjQsImV4cCI6MjA3MDY1MzkyNH0.64i-QDqj3Fb4anYglDticz9r5cytIa5_nwpdbxHYOok';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing connection to remote Supabase...');
    
    // Test 1: Check if we can connect
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('coupons_store').select('count').limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      if (error.message.includes('relation "coupons_store" does not exist')) {
        console.log('💡 The coupons_store table does not exist yet. Please run the migrations in your Supabase dashboard.');
      }
    } else {
      console.log('✅ Connection successful!');
    }
    
    // Test 2: Try to get data from each table
    const tables = ['coupons_store', 'locations', 'notifications', 'owned_coupons', 'transaction_history', 'advertisements'];
    
    for (const table of tables) {
      console.log(`2. Testing ${table} table...`);
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Connected successfully (${data?.length || 0} records)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testConnection();
