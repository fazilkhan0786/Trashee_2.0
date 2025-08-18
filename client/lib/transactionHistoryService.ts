import { supabase } from './supabase';

export interface TransactionHistory {
  id: string;
  user_id: string;
  type: 'coupon_redemption' | 'points_earned' | 'points_spent' | 'ad_watch' | 'scan_reward';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  reference_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches transaction history for a user
 * @param userId The user's ID
 * @returns Promise with the transaction history data
 */
export async function getUserTransactionHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('transaction_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching transaction history:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching transaction history:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Fetches transaction history by type
 * @param userId The user's ID
 * @param type The transaction type to filter by
 * @returns Promise with the filtered transaction history data
 */
export async function getTransactionHistoryByType(userId: string, type: string) {
  try {
    const { data, error } = await supabase
      .from('transaction_history')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching transaction history by type:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching transaction history by type:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Creates a new transaction record
 * @param transactionData The transaction data to create
 * @returns Promise with the result of the creation
 */
export async function createTransaction(transactionData: Omit<TransactionHistory, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('transaction_history')
      .insert([{
        ...transactionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating transaction:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error creating transaction:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Updates the status of a transaction
 * @param transactionId The ID of the transaction
 * @param status The new status
 * @returns Promise with the result of the update
 */
export async function updateTransactionStatus(transactionId: string, status: 'completed' | 'pending' | 'failed') {
  try {
    const { data, error } = await supabase
      .from('transaction_history')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating transaction status:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error updating transaction status:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Gets the total points earned by a user
 * @param userId The user's ID
 * @returns Promise with the total points earned
 */
export async function getTotalPointsEarned(userId: string) {
  try {
    const { data, error } = await supabase
      .from('transaction_history')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('amount', 0);
    
    if (error) {
      console.error('Error getting total points earned:', error.message);
      return { success: false, error: error.message };
    }
    
    const totalEarned = data.reduce((sum, transaction) => sum + transaction.amount, 0);
    return { success: true, totalEarned };
  } catch (err) {
    console.error('Unexpected error getting total points earned:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Gets the total points spent by a user
 * @param userId The user's ID
 * @returns Promise with the total points spent
 */
export async function getTotalPointsSpent(userId: string) {
  try {
    const { data, error } = await supabase
      .from('transaction_history')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .lt('amount', 0);
    
    if (error) {
      console.error('Error getting total points spent:', error.message);
      return { success: false, error: error.message };
    }
    
    const totalSpent = Math.abs(data.reduce((sum, transaction) => sum + transaction.amount, 0));
    return { success: true, totalSpent };
  } catch (err) {
    console.error('Unexpected error getting total points spent:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Gets the current balance (earned - spent) for a user
 * @param userId The user's ID
 * @returns Promise with the current balance
 */
export async function getCurrentBalance(userId: string) {
  try {
    const { data, error } = await supabase
      .from('transaction_history')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'completed');
    
    if (error) {
      console.error('Error getting current balance:', error.message);
      return { success: false, error: error.message };
    }
    
    const balance = data.reduce((sum, transaction) => sum + transaction.amount, 0);
    return { success: true, balance };
  } catch (err) {
    console.error('Unexpected error getting current balance:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
