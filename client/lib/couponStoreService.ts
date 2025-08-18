import { supabase } from './supabase';

export interface Coupon {
  id: string;
  product_name: string;
  product_image: string;
  shop_logo: string;
  shop_name: string;
  points_cost: number;
  original_price: number;
  discounted_price: number;
  expiry_date: string;
  category: string;
  distance: string;
  rating: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OwnedCoupon {
  id: string;
  user_id: string;
  coupon_id: string;
  product_name: string;
  shop_name: string;
  shop_logo: string;
  product_image: string;
  value: number;
  discounted_price: number;
  redeemed_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'used';
  qr_code: string;
  shop_address: string;
  shop_phone: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches all active coupons from the store
 * @returns Promise with the coupons data
 */
export async function getCoupons() {
  try {
    const { data, error } = await supabase
      .from('coupons_store')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching coupons:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching coupons:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Fetches coupons by category
 * @param category The category to filter by
 * @returns Promise with the filtered coupons data
 */
export async function getCouponsByCategory(category: string) {
  try {
    const { data, error } = await supabase
      .from('coupons_store')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching coupons by category:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching coupons by category:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Redeems a coupon for a user
 * @param couponId The ID of the coupon to redeem
 * @returns Promise with the result of the redemption
 */
export async function redeemCoupon(couponId: string) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // First, get the coupon details
    const { data: couponData, error: couponError } = await supabase
      .from('coupons_store')
      .select('*')
      .eq('id', couponId)
      .eq('is_active', true)
      .single();
    
    if (couponError || !couponData) {
      return { success: false, error: 'Coupon not found or inactive' };
    }

    // Generate QR code
    const qrCode = `COUPON-${couponId}-${user.id}-${Date.now()}`;

    // Create owned coupon record
    const { data: ownedCoupon, error: ownedError } = await supabase
      .from('owned_coupons')
      .insert([{
        user_id: user.id,
        coupon_id: couponId,
        product_name: couponData.product_name,
        shop_name: couponData.shop_name,
        shop_logo: couponData.shop_logo,
        product_image: couponData.product_image,
        value: couponData.original_price,
        discounted_price: couponData.discounted_price,
        expiry_date: couponData.expiry_date,
        qr_code: qrCode,
        shop_address: '123 Main Street, City', // Default address
        shop_phone: '+91 98765 43210' // Default phone
      }])
      .select()
      .single();
    
    if (ownedError) {
      console.error('Error creating owned coupon:', ownedError.message);
      return { success: false, error: ownedError.message };
    }

    // Add transaction record for points spent
    const { error: transactionError } = await supabase
      .from('transaction_history')
      .insert([{
        user_id: user.id,
        type: 'coupon_redemption',
        description: `Redeemed ${couponData.product_name} from ${couponData.shop_name}`,
        amount: -couponData.points_cost,
        status: 'completed',
        reference_id: ownedCoupon.id
      }]);
    
    if (transactionError) {
      console.error('Error creating transaction record:', transactionError.message);
      // Don't fail the redemption if transaction record fails
    }

    return { success: true, data: ownedCoupon };
  } catch (err) {
    console.error('Unexpected error redeeming coupon:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Fetches owned coupons for a user
 * @param userId The user's ID
 * @returns Promise with the owned coupons data
 */
export async function getOwnedCoupons(userId: string) {
  try {
    const { data, error } = await supabase
      .from('owned_coupons')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching owned coupons:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching owned coupons:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Updates the status of an owned coupon
 * @param ownedCouponId The ID of the owned coupon
 * @param status The new status
 * @returns Promise with the result of the update
 */
export async function updateOwnedCouponStatus(ownedCouponId: string, status: 'active' | 'expired' | 'used') {
  try {
    const { data, error } = await supabase
      .from('owned_coupons')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', ownedCouponId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating owned coupon status:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error updating owned coupon status:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
