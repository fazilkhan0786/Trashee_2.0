import { supabase } from './supabase';

export interface ScanHistoryItem {
  id?: string;
  user_id?: string;
  bin_id: string;
  location: string;
  points: number;
  scan_type?: 'organic' | 'plastic' | 'paper' | 'general';
  status: 'completed' | 'pending' | 'expired';
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches scan history for a user from Supabase
 * @param userId The user's ID from Supabase Auth
 * @returns Promise with the scan history data
 */
export async function getUserScanHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('scan_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching scan history:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching scan history:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Adds a new scan history record to Supabase
 * @param scanData The scan history data to add
 * @returns Promise with the result of the operation
 */
export async function addScanHistory(scanData: ScanHistoryItem) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Add user_id to scan data
    const dataToInsert = {
      ...scanData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('scan_history')
      .insert([dataToInsert])
      .select();
    
    if (error) {
      console.error('Error adding scan history:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data[0] };
  } catch (err) {
    console.error('Unexpected error adding scan history:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Clears all scan history for a user
 * @param userId The user's ID from Supabase Auth
 * @returns Promise with the result of the operation
 */
export async function clearScanHistory(userId: string) {
  try {
    const { error } = await supabase
      .from('scan_history')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error clearing scan history:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Unexpected error clearing scan history:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}