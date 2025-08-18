import { supabase } from './supabase';

export interface Location {
  id: string;
  type: 'bin' | 'partner';
  name: string;
  address: string;
  pincode: string;
  latitude: number;
  longitude: number;
  fill_level?: number;
  last_scanned?: string;
  last_scanned_by?: string;
  distance: string;
  status: 'active' | 'inactive' | 'full' | 'maintenance';
  rating?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches all active locations
 * @returns Promise with the locations data
 */
export async function getLocations() {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching locations:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching locations:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Fetches locations by type
 * @param type The type to filter by ('bin' or 'partner')
 * @returns Promise with the filtered locations data
 */
export async function getLocationsByType(type: 'bin' | 'partner') {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .eq('type', type)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching locations by type:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching locations by type:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Fetches locations by status
 * @param status The status to filter by
 * @returns Promise with the filtered locations data
 */
export async function getLocationsByStatus(status: string) {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching locations by status:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching locations by status:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Updates the fill level of a bin location
 * @param locationId The ID of the location
 * @param fillLevel The new fill level (0-100)
 * @returns Promise with the result of the update
 */
export async function updateBinFillLevel(locationId: string, fillLevel: number) {
  try {
    const { data, error } = await supabase
      .from('locations')
      .update({ 
        fill_level: fillLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', locationId)
      .eq('type', 'bin')
      .select()
      .single();
    
    if (error) {
      console.error('Error updating bin fill level:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error updating bin fill level:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Updates the last scanned information for a bin
 * @param locationId The ID of the location
 * @param scannedBy The user who scanned the bin
 * @returns Promise with the result of the update
 */
export async function updateLastScanned(locationId: string, scannedBy: string) {
  try {
    const { data, error } = await supabase
      .from('locations')
      .update({ 
        last_scanned: new Date().toISOString(),
        last_scanned_by: scannedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', locationId)
      .eq('type', 'bin')
      .select()
      .single();
    
    if (error) {
      console.error('Error updating last scanned:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error updating last scanned:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Searches locations by name, address, or pincode
 * @param searchQuery The search query
 * @returns Promise with the search results
 */
export async function searchLocations(searchQuery: string) {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,pincode.ilike.%${searchQuery}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error searching locations:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error searching locations:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
