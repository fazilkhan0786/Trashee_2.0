import { createClient } from '@supabase/supabase-js';

// Remote Supabase configuration
const supabaseUrl = 'https://ascqdjqxiuygvvmawyrx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzY3FkanF4aXV5Z3Z2bWF3eXJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA3NzkyNCwiZXhwIjoyMDcwNjUzOTI0fQ.hgII9RSaeAVSsYpx-jrF2m10Ssjo_kcR21GlpOoX7Y8';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertSampleData() {
  try {
    console.log('Inserting sample data into remote Supabase...');
    
    // Insert sample coupons
    console.log('1. Inserting sample coupons...');
    const { data: couponsData, error: couponsError } = await supabase
      .from('coupons_store')
      .insert([
        {
          product_name: 'Pizza Margherita',
          product_image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
          shop_logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100',
          shop_name: 'Pizza Palace',
          points_cost: 50,
          original_price: 299.00,
          discounted_price: 199.00,
          expiry_date: '2025-02-15',
          category: 'Food',
          distance: '0.5 km',
          rating: 4.5,
          description: 'Delicious Margherita pizza with fresh mozzarella and basil'
        },
        {
          product_name: 'Coffee & Pastry',
          product_image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
          shop_logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100',
          shop_name: 'Café Central',
          points_cost: 30,
          original_price: 150.00,
          discounted_price: 99.00,
          expiry_date: '2025-02-10',
          category: 'Food',
          distance: '0.8 km',
          rating: 4.2,
          description: 'Premium coffee with a fresh pastry of your choice'
        },
        {
          product_name: 'Movie Ticket',
          product_image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
          shop_logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100',
          shop_name: 'CineMax',
          points_cost: 100,
          original_price: 500.00,
          discounted_price: 350.00,
          expiry_date: '2025-02-20',
          category: 'Entertainment',
          distance: '1.2 km',
          rating: 4.7,
          description: 'Watch any movie of your choice'
        },
        {
          product_name: 'Gym Session',
          product_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          shop_logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100',
          shop_name: 'FitLife Gym',
          points_cost: 75,
          original_price: 400.00,
          discounted_price: 250.00,
          expiry_date: '2025-02-25',
          category: 'Health',
          distance: '1.5 km',
          rating: 4.3,
          description: 'Full day access to gym facilities'
        },
        {
          product_name: 'Book Store Voucher',
          product_image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
          shop_logo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100',
          shop_name: 'Readers Corner',
          points_cost: 40,
          original_price: 200.00,
          discounted_price: 150.00,
          expiry_date: '2025-02-12',
          category: 'Lifestyle',
          distance: '0.9 km',
          rating: 4.1,
          description: 'Get any book of your choice'
        }
      ]);

    if (couponsError) {
      console.log('❌ Error inserting coupons:', couponsError.message);
    } else {
      console.log('✅ Sample coupons inserted successfully');
    }

    // Insert sample locations
    console.log('2. Inserting sample locations...');
    const { data: locationsData, error: locationsError } = await supabase
      .from('locations')
      .insert([
        {
          type: 'bin',
          name: 'Smart Bin - Central Park',
          address: 'Central Park, Main Street',
          pincode: '380001',
          latitude: 23.0258,
          longitude: 72.5873,
          fill_level: 65,
          distance: '0.3 km',
          status: 'active'
        },
        {
          type: 'bin',
          name: 'Smart Bin - Mall Entrance',
          address: 'City Mall, Shopping District',
          pincode: '380002',
          latitude: 23.0268,
          longitude: 72.5883,
          fill_level: 85,
          distance: '0.7 km',
          status: 'active'
        },
        {
          type: 'bin',
          name: 'Smart Bin - Metro Station',
          address: 'Metro Station, Transport Hub',
          pincode: '380003',
          latitude: 23.0278,
          longitude: 72.5893,
          fill_level: 45,
          distance: '1.1 km',
          status: 'active'
        },
        {
          type: 'partner',
          name: 'Pizza Palace',
          address: '123 Food Street, Downtown',
          pincode: '380001',
          latitude: 23.0288,
          longitude: 72.5903,
          distance: '0.5 km',
          status: 'active',
          rating: 4.5
        },
        {
          type: 'partner',
          name: 'Café Central',
          address: '456 Coffee Lane, Midtown',
          pincode: '380002',
          latitude: 23.0298,
          longitude: 72.5913,
          distance: '0.8 km',
          status: 'active',
          rating: 4.2
        },
        {
          type: 'partner',
          name: 'CineMax',
          address: '789 Entertainment Blvd, Uptown',
          pincode: '380003',
          latitude: 23.0308,
          longitude: 72.5923,
          distance: '1.2 km',
          status: 'active',
          rating: 4.7
        }
      ]);

    if (locationsError) {
      console.log('❌ Error inserting locations:', locationsError.message);
    } else {
      console.log('✅ Sample locations inserted successfully');
    }

    // Insert sample advertisements
    console.log('3. Inserting sample advertisements...');
    const { data: adsData, error: adsError } = await supabase
      .from('advertisements')
      .insert([
        {
          title: 'Eco-Friendly Products',
          description: 'Discover our range of sustainable products that help protect the environment',
          duration: 30,
          points: 5,
          advertiser: 'GreenLife',
          category: 'Lifestyle',
          thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
          video_url: 'https://example.com/video1.mp4'
        },
        {
          title: 'Healthy Living Tips',
          description: 'Learn simple ways to lead a healthier lifestyle',
          duration: 45,
          points: 8,
          advertiser: 'HealthFirst',
          category: 'Health',
          thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          video_url: 'https://example.com/video2.mp4'
        },
        {
          title: 'Local Business Spotlight',
          description: 'Support local businesses in your community',
          duration: 25,
          points: 3,
          advertiser: 'LocalBiz',
          category: 'Business',
          thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
          video_url: 'https://example.com/video3.mp4'
        },
        {
          title: 'Recycling Guide',
          description: 'Master the art of proper recycling',
          duration: 35,
          points: 6,
          advertiser: 'RecycleNow',
          category: 'Education',
          thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
          video_url: 'https://example.com/video4.mp4'
        },
        {
          title: 'Sustainable Fashion',
          description: 'Explore eco-friendly fashion choices',
          duration: 40,
          points: 7,
          advertiser: 'EcoFashion',
          category: 'Fashion',
          thumbnail: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
          video_url: 'https://example.com/video5.mp4'
        }
      ]);

    if (adsError) {
      console.log('❌ Error inserting advertisements:', adsError.message);
    } else {
      console.log('✅ Sample advertisements inserted successfully');
    }

    console.log('🎉 Sample data insertion completed!');
    
  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
}

// Run the data insertion
insertSampleData();
