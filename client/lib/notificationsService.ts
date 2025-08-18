import { supabase } from './supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'broadcast' | 'alert' | 'coupon' | 'reward' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  sender: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches notifications for a user
 * @param userId The user's ID
 * @returns Promise with the notifications data
 */
export async function getUserNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notifications:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching notifications:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Fetches unread notifications for a user
 * @param userId The user's ID
 * @returns Promise with the unread notifications data
 */
export async function getUnreadNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching unread notifications:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching unread notifications:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Marks a notification as read
 * @param notificationId The ID of the notification
 * @returns Promise with the result of the update
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) {
      console.error('Error marking notification as read:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error marking notification as read:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Marks all notifications as read for a user
 * @param userId The user's ID
 * @returns Promise with the result of the update
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();
    
    if (error) {
      console.error('Error marking all notifications as read:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error marking all notifications as read:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Deletes a notification
 * @param notificationId The ID of the notification
 * @returns Promise with the result of the deletion
 */
export async function deleteNotification(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) {
      console.error('Error deleting notification:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Unexpected error deleting notification:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Deletes all notifications for a user
 * @param userId The user's ID
 * @returns Promise with the result of the deletion
 */
export async function deleteAllNotifications(userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting all notifications:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Unexpected error deleting all notifications:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Creates a new notification
 * @param notificationData The notification data to create
 * @returns Promise with the result of the creation
 */
export async function createNotification(notificationData: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        ...notificationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error creating notification:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Gets notification count for a user
 * @param userId The user's ID
 * @returns Promise with the notification count
 */
export async function getNotificationCount(userId: string) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) {
      console.error('Error getting notification count:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, count: count || 0 };
  } catch (err) {
    console.error('Unexpected error getting notification count:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
