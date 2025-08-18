import { supabase } from './supabase';

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  points: number;
  advertiser: string;
  category: string;
  thumbnail: string;
  video_url: string;
  is_active: boolean;
  max_views_per_day: number;
  target_audience: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Fetches all active advertisements
 * @returns Promise with the advertisements data
 */
export async function getAdvertisements() {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching advertisements:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching advertisements:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Fetches advertisements by category
 * @param category The category to filter by
 * @returns Promise with the filtered advertisements data
 */
export async function getAdvertisementsByCategory(category: string) {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching advertisements by category:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching advertisements by category:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Records an ad view for a user
 * @param adId The ID of the advertisement
 * @param userId The user's ID
 * @returns Promise with the result of the operation
 */
export async function recordAdView(adId: string, userId: string) {
  try {
    // Get the advertisement details
    const { data: adData, error: adError } = await supabase
      .from('advertisements')
      .select('*')
      .eq('id', adId)
      .eq('is_active', true)
      .single();
    
    if (adError || !adData) {
      return { success: false, error: 'Advertisement not found or inactive' };
    }

    // Create transaction record for points earned
    const { error: transactionError } = await supabase
      .from('transaction_history')
      .insert([{
        user_id: userId,
        type: 'ad_watch',
        description: `Watched ad: ${adData.title}`,
        amount: adData.points,
        status: 'completed',
        reference_id: adId,
        metadata: {
          ad_id: adId,
          ad_title: adData.title,
          ad_duration: adData.duration
        }
      }]);
    
    if (transactionError) {
      console.error('Error creating transaction record for ad view:', transactionError.message);
      return { success: false, error: transactionError.message };
    }

    return { success: true, data: adData };
  } catch (err) {
    console.error('Unexpected error recording ad view:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Gets the total points earned from ads for a user today
 * @param userId The user's ID
 * @returns Promise with the total points earned today
 */
export async function getTodayAdPoints(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('transaction_history')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'ad_watch')
      .eq('status', 'completed')
      .gte('created_at', today.toISOString());
    
    if (error) {
      console.error('Error getting today ad points:', error.message);
      return { success: false, error: error.message };
    }
    
    const totalPoints = data.reduce((sum, transaction) => sum + transaction.amount, 0);
    return { success: true, totalPoints };
  } catch (err) {
    console.error('Unexpected error getting today ad points:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Gets the number of ads watched by a user today
 * @param userId The user's ID
 * @returns Promise with the number of ads watched today
 */
export async function getTodayAdCount(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count, error } = await supabase
      .from('transaction_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'ad_watch')
      .eq('status', 'completed')
      .gte('created_at', today.toISOString());
    
    if (error) {
      console.error('Error getting today ad count:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, count: count || 0 };
  } catch (err) {
    console.error('Unexpected error getting today ad count:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Checks if a user can watch more ads today (consumer limit is 5)
 * @param userId The user's ID
 * @returns Promise with whether the user can watch more ads
 */
export async function canWatchMoreAds(userId: string) {
  try {
    const { count, error } = await getTodayAdCount(userId);
    
    if (error) {
      return { success: false, error };
    }
    
    const canWatch = count < 5; // Consumer limit
    return { success: true, canWatch, adsWatched: count, adsRemaining: Math.max(0, 5 - count) };
  } catch (err) {
    console.error('Unexpected error checking if user can watch more ads:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
