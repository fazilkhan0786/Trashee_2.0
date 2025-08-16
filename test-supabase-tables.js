// Script to test Supabase database tables
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

async function testTables() {
  try {
    console.log('Testing Supabase database tables...');
    
    // Try to query some potential tables based on the application context
    const tables = [
      'users',
      'profiles',
      'coupons',
      'smart_bins',
      'scan_history',
      'requests',
      'partners',
      'collectors'
    ];
    
    for (const table of tables) {
      console.log(`Attempting to query table: ${table}`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`Table '${table}' does not exist or you don't have access to it.`);
        } else {
          console.log(`Error querying table '${table}':`, error.message);
        }
      } else {
        console.log(`Successfully queried table '${table}':`, data);
      }
    }
    
    // Try to get database schema information
    console.log('\nAttempting to get database schema information...');
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_schema_information');
      
    if (schemaError) {
      console.log('Error getting schema information:', schemaError.message);
    } else {
      console.log('Schema information:', schemaData);
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error testing Supabase tables:', err);
    return false;
  }
}

testTables().then(result => {
  console.log(`\nDatabase tables test ${result ? 'completed' : 'failed'}`);
});