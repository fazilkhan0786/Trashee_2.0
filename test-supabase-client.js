// Simple script to test client-side Supabase connection
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

async function testClientConnection() {
  try {
    // Try to get the session - this doesn't require a specific table
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error connecting to Supabase (client):', error.message);
      return false;
    }
    
    console.log('Successfully connected to Supabase (client)!');
    console.log('Session data:', data);
    
    // Test auth API
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('Auth API test: No authenticated user');
    } else {
      console.log('Auth API test: User data available', authData);
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error testing Supabase connection (client):', err);
    return false;
  }
}

testClientConnection().then(result => {
  console.log(`Client connection test ${result ? 'passed' : 'failed'}`);
});