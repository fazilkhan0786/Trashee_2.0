// Simple script to test Supabase connection
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ascqdjqxiuygvvmawyrx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzY3FkanF4aXV5Z3Z2bWF3eXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzc5MjQsImV4cCI6MjA3MDY1MzkyNH0.64i-QDqj3Fb4anYglDticz9r5cytIa5_nwpdbxHYOok";

if (!SUPABASE_URL) {
  throw new Error('Missing Supabase URL');
}

if (!SUPABASE_KEY) {
  console.warn('Warning: Missing Supabase Key');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  try {
    // Try to get the session - this doesn't require a specific table
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      return false;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Session data:', data);
    return true;
  } catch (err) {
    console.error('Unexpected error testing Supabase connection:', err);
    return false;
  }
}

testConnection().then(result => {
  console.log(`Connection test ${result ? 'passed' : 'failed'}`);
});