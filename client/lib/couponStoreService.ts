import { supabase } from "./supabase";

// TypeScript interface for a coupon available in the store
export interface Coupon {
  id: string;
  product_name: string;
  product_image: string | null;
  shop_logo: string | null;
  shop_name: string;
  points_cost: number;
  original_price: number;
  discounted_price: number;
  expiry_date: string;
  category: string | null;
  distance: string | null;
  rating: number | null;
  quantity: number;
}

// TypeScript interface for a coupon that a user has redeemed and now owns
// REVERTED: This interface now reflects the 'owned_coupons' table schema which is where coupons are stored.
export interface OwnedCoupon {
  id: string; // The ID of the entry in the owned_coupons table
  status: 'active' | 'expired' | 'used';
  redeemed_date: string; // The timestamp when the user spent points to get the coupon
  claimed_at: string | null; // The timestamp when the coupon was marked as 'used' in-store
  coupons_store: Coupon; // Contains all the original details of the coupon
}

/**
 * Fetches all active and in-stock coupons from the store.
 * @returns {Promise<{success: boolean, data: Coupon[] | null, error: string | null}>}
 */
export async function getCoupons() {
  try {
    const { data, error } = await supabase
      .from("coupons_store")
      .select("*")
      .eq("is_active", true)
      .gt("quantity", 0) // Only fetch coupons that are in stock
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching coupons:", error);
      return { success: false, data: null, error: "Failed to load coupons." };
    }
    return { success: true, data: data as Coupon[], error: null };
  } catch (err) {
    console.error("Unexpected error in getCoupons:", err);
    return { success: false, data: null, error: "An unexpected error occurred." };
  }
}

/**
 * Redeems a coupon by calling a secure database function.
 * This handles deducting points, creating the owned coupon, and decrementing stock in one transaction.
 * @param {string} couponId - The UUID of the coupon from the coupons_store table.
 * @returns {Promise<{success: boolean, error: string | null, newBalance?: number}>}
 */
export async function redeemCoupon(couponId: string) {
  try {
    // Calls the secure 'redeem_coupon_with_points' function you created in the Supabase SQL Editor.
    const { data, error } = await supabase.rpc('redeem_coupon_with_points', {
      coupon_id_input: couponId
    });

    if (error) {
      console.error("Error calling redeem RPC:", error);
      return { success: false, error: error.message };
    }

    // The RPC function returns a JSON object. We check the 'success' field inside it.
    if (data && data.success) {
      return { success: true, error: null, newBalance: data.newBalance };
    } else {
      // Handle cases where the RPC ran but returned a logical error (e.g., "Insufficient points")
      return { success: false, error: data.error || "Redemption failed in database." };
    }
  } catch (err: any) {
    console.error("Unexpected error in redeemCoupon:", err);
    return { success: false, error: "An unexpected client-side error occurred." };
  }
}

/**
 * Fetches all coupons owned by the currently authenticated user.
 * @returns {Promise<{success: boolean, data: OwnedCoupon[] | null, error: string | null}>}
 */
export async function getOwnedCoupons() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated.");
    }

    // REVERTED: Fetches from the 'owned_coupons' table, which is where the redeem RPC saves data.
    const { data, error } = await supabase
      .from('owned_coupons')
      .select(`
        id,
        status,
        redeemed_date,
        claimed_at, 
        coupons_store ( * )
      `)
      .eq('user_id', user.id)
      .order('redeemed_date', { ascending: false });

    if (error) {
      console.error("Error fetching owned coupons:", error);
      return { success: false, data: null, error: "Failed to get your coupons." };
    }

    // Filter out any results where the nested coupon data might be missing
    const validData = data?.filter(c => c.coupons_store) || [];

    return { success: true, data: validData as OwnedCoupon[], error: null };
  } catch (err) {
    const error = err as Error;
    console.error("Unexpected error in getOwnedCoupons:", error);
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Generates a short-lived, secure JWT for a specific owned coupon.
 * This token can be converted to a QR code for in-store redemption.
 * @param {string} ownedCouponId - The UUID of the coupon from the owned_coupons table.
 * @returns {Promise<{success: boolean, token: string | null, error: string | null}>}
 */
export async function generateCouponToken(ownedCouponId: string) {
  try {
    const { data, error } = await supabase.rpc('generate_coupon_jwt', {
      owned_coupon_id: ownedCouponId
    });

    if (error) {
      console.error("Error generating coupon token:", error);
      return { success: false, token: null, error: error.message };
    }

    return { success: true, token: data, error: null };
  } catch (err: any) {
    console.error("Unexpected error in generateCouponToken:", err);
    return { success: false, token: null, error: "An unexpected error occurred." };
  }
}

