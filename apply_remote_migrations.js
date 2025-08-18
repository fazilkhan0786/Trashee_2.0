import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Remote Supabase configuration
const supabaseUrl = 'https://ascqdjqxiuygvvmawyrx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzY3FkanF4aXV5Z3Z2bWF3eXJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA3NzkyNCwiZXhwIjoyMDcwNjUzOTI0fQ.hgII9RSaeAVSsYpx-jrF2m10Ssjo_kcR21GlpOoX7Y8';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  try {
    console.log('Creating tables in remote Supabase...');
    
    // Create coupons_store table
    console.log('Creating coupons_store table...');
    const { error: couponsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS coupons_store (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          product_name TEXT NOT NULL,
          product_image TEXT,
          shop_logo TEXT,
          shop_name TEXT NOT NULL,
          points_cost INTEGER NOT NULL,
          original_price DECIMAL(10,2) NOT NULL,
          discounted_price DECIMAL(10,2) NOT NULL,
          expiry_date DATE NOT NULL,
          category TEXT,
          distance TEXT,
          rating DECIMAL(3,2),
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (couponsError) {
      console.log('Note: coupons_store table might already exist or exec_sql function not available');
    } else {
      console.log('coupons_store table created successfully');
    }

    // Create locations table
    console.log('Creating locations table...');
    const { error: locationsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS locations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          type TEXT NOT NULL CHECK (type IN ('bin', 'partner')),
          name TEXT NOT NULL,
          address TEXT NOT NULL,
          pincode TEXT NOT NULL,
          latitude DECIMAL(10,8),
          longitude DECIMAL(11,8),
          fill_level INTEGER,
          last_scanned TIMESTAMP WITH TIME ZONE,
          last_scanned_by TEXT,
          distance TEXT,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'full', 'maintenance')),
          rating DECIMAL(3,2),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (locationsError) {
      console.log('Note: locations table might already exist or exec_sql function not available');
    } else {
      console.log('locations table created successfully');
    }

    // Create notifications table
    console.log('Creating notifications table...');
    const { error: notificationsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('broadcast', 'alert', 'coupon', 'reward', 'system')),
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
          is_read BOOLEAN DEFAULT false,
          action_url TEXT,
          action_label TEXT,
          sender TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (notificationsError) {
      console.log('Note: notifications table might already exist or exec_sql function not available');
    } else {
      console.log('notifications table created successfully');
    }

    // Create owned_coupons table
    console.log('Creating owned_coupons table...');
    const { error: ownedCouponsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS owned_coupons (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          coupon_id UUID REFERENCES coupons_store(id) ON DELETE CASCADE NOT NULL,
          product_name TEXT NOT NULL,
          shop_name TEXT NOT NULL,
          shop_logo TEXT,
          product_image TEXT,
          value DECIMAL(10,2) NOT NULL,
          discounted_price DECIMAL(10,2) NOT NULL,
          redeemed_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expiry_date DATE NOT NULL,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'used')),
          qr_code TEXT,
          shop_address TEXT,
          shop_phone TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (ownedCouponsError) {
      console.log('Note: owned_coupons table might already exist or exec_sql function not available');
    } else {
      console.log('owned_coupons table created successfully');
    }

    // Create transaction_history table
    console.log('Creating transaction_history table...');
    const { error: transactionHistoryError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS transaction_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('coupon_redemption', 'points_earned', 'points_spent', 'ad_watch', 'scan_reward')),
          description TEXT NOT NULL,
          amount INTEGER NOT NULL,
          status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
          reference_id TEXT,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (transactionHistoryError) {
      console.log('Note: transaction_history table might already exist or exec_sql function not available');
    } else {
      console.log('transaction_history table created successfully');
    }

    // Create advertisements table
    console.log('Creating advertisements table...');
    const { error: advertisementsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS advertisements (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT,
          duration INTEGER NOT NULL,
          points INTEGER NOT NULL,
          advertiser TEXT NOT NULL,
          category TEXT,
          thumbnail TEXT,
          video_url TEXT,
          is_active BOOLEAN DEFAULT true,
          max_views_per_day INTEGER DEFAULT 1000,
          target_audience TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (advertisementsError) {
      console.log('Note: advertisements table might already exist or exec_sql function not available');
    } else {
      console.log('advertisements table created successfully');
    }

    console.log('Table creation process completed. Please check your Supabase dashboard for any errors.');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Run the table creation
createTables();
