import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ascqdjqxiuygvvmawyrx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzY3FkanF4aXV5Z3Z2bWF3eXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzc5MjQsImV4cCI6MjA3MDY1MzkyNH0.64i-QDqj3Fb4anYglDticz9r5cytIa5_nwpdbxHYOok'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
})
