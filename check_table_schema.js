import { createClient } from '@supabase/supabase-js';

// Remote Supabase configuration
const supabaseUrl = 'https://ascqdjqxiuygvvmawyrx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzY3FkanF4aXV5Z3Z2bWF3eXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzc5MjQsImV4cCI6MjA3MDY1MzkyNH0.64i-QDqj3Fb4anYglDticz9r5cytIa5_nwpdbxHYOok';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableSchema() {
  try {
    console.log('Checking table schemas in remote Supabase...');
    
    const tables = ['coupons_store', 'locations', 'notifications', 'owned_coupons', 'transaction_history', 'advertisements'];
    
    for (const table of tables) {
      console.log(`\n📋 Checking ${table} table schema...`);
      
      // Try to get one record to see what columns exist
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.log(`❌ Error accessing ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table} table exists`);
        if (data && data.length > 0) {
          console.log(`📊 Sample record columns:`, Object.keys(data[0]));
        } else {
          console.log(`📊 Table is empty, but accessible`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking table schemas:', error);
  }
}

// Run the schema check
checkTableSchema();
