// Script to apply database migrations
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file if available
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Read migration files
    const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure correct order
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Apply each migration
    for (const file of migrationFiles) {
      console.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Execute the SQL directly
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`Error applying migration ${file}:`, error);
        // Continue with next migration instead of stopping
      } else {
        console.log(`Successfully applied migration: ${file}`);
      }
    }
    
    // Create storage bucket for profiles if it doesn't exist
    console.log('Creating profiles storage bucket...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    } else {
      const profilesBucketExists = buckets.some(bucket => bucket.name === 'profiles');
      
      if (!profilesBucketExists) {
        const { error: createBucketError } = await supabase.storage.createBucket('profiles', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (createBucketError) {
          console.error('Error creating profiles bucket:', createBucketError);
        } else {
          console.log('Profiles bucket created successfully');
        }
      } else {
        console.log('Profiles bucket already exists');
      }
    }
    
    console.log('Database migrations completed');
  } catch (error) {
    console.error('Unexpected error during migrations:', error);
  }
}

// Run the migrations
applyMigrations();