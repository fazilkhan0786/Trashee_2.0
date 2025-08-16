import { supabase } from './supabase';

/**
 * Example function demonstrating how to sign up a new user with Supabase
 * @param email User's email address
 * @param password User's password
 * @returns Promise with the signup result
 */
export async function signUpUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({ 
      email: email, 
      password: password 
    });
    
    if (error) {
      console.error('Error signing up:', error.message);
      return { success: false, error: error.message };
    }
    
    // Check if email confirmation is required
    if (data && !data.session) {
      return { 
        success: true, 
        message: 'Please check your email to confirm your account before signing in.',
        requiresEmailConfirmation: true,
        user: data.user
      };
    }
    
    return { 
      success: true, 
      message: 'Signup successful!',
      requiresEmailConfirmation: false,
      session: data.session,
      user: data.user
    };
  } catch (err) {
    console.error('Unexpected error during signup:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Example function demonstrating how to sign in a user with email and password
 * @param email User's email address
 * @param password User's password
 * @returns Promise with the signin result
 */
export async function signInUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email, 
      password: password 
    });
    
    if (error) {
      console.error('Error signing in:', error.message);
      return { success: false, error: error.message };
    }
    
    return { 
      success: true, 
      message: 'Sign in successful!',
      session: data.session,
      user: data.user
    };
  } catch (err) {
    console.error('Unexpected error during sign in:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Example usage for signup:
 * 
 * // Basic signup
 * let { data, error } = await supabase.auth.signUp({ 
 *   email: 'someone@email.com', 
 *   password: 'JsKBtYaIunDwoopdPFNf' 
 * });
 * 
 * // Signup with additional user metadata
 * let { data, error } = await supabase.auth.signUp({
 *   email: 'someone@email.com',
 *   password: 'JsKBtYaIunDwoopdPFNf',
 *   options: {
 *     data: {
 *       name: 'John Doe',
 *       phone: '555-123-4567',
 *       user_type: '0' // 0 for Consumer, 1 for Partner, 2 for Collector
 *     }
 *   }
 * });
 * 
 * // Sign in with email and password
 * let { data, error } = await supabase.auth.signInWithPassword({ 
 *   email: 'someone@email.com', 
 *   password: 'JsKBtYaIunDwoopdPFNf' 
 * });
 */