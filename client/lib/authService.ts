import { supabase } from './supabase';

interface SignUpForm {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  profilePhoto?: string;
  userType?: string;
}

/**
 * Signs up a new user with Supabase and saves their profile data
 * @param formData The signup form data including email, password, and profile information
 * @returns Promise with the created user
 */
export async function signUpUser(formData: SignUpForm) {
  const { email, password, fullName, phoneNumber, address, profilePhoto, userType } = formData;

  // 1. Sign up the user with metadata
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: fullName,
        phone: phoneNumber,
        user_type: userType || '0',
        address: address,
        avatar_url: profilePhoto
      }
    }
  });

  if (signUpError) throw signUpError;
  if (!authData.user) throw new Error("No user returned after sign-up");

  try {
    // 2. Insert profile data
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: authData.user.id, // Use id as primary key
        full_name: fullName,
        phone_number: phoneNumber || '',
        email: email, // ✅ Save email to profiles table
        address: address || '',
        avatar_url: profilePhoto || '',
        user_type: userType || 'CONSUMER', // Default to CONSUMER if not specified
        email_notifications: true,
        push_notifications: true,
        sms_alerts: false,
        location_tracking: true,
        updated_at: new Date().toISOString()
      },
    ]);

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Continue even if profile creation fails
    }
  } catch (error) {
    console.error('Error in profile creation:', error);
    // Continue even if profile creation fails
  }

  return authData.user;
}

/**
 * Gets the current user's profile from Supabase
 * @returns Promise with the user's profile data
 */
export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    
    // Return basic user data from auth if profile fetch fails
    return {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name,
      email: user.email,
      phone_number: user.user_metadata?.phone_number || user.user_metadata?.phone,
      user_type: user.user_metadata?.user_type || 'CONSUMER',
      email_notifications: true,
      push_notifications: true,
      sms_alerts: false,
      location_tracking: true,
      created_at: user.created_at,
      updated_at: user.created_at
    };
  }
}

/**
 * Updates a user's profile in Supabase
 * @param profileData The profile data to update
 * @returns Promise with the updated profile data
 */
export async function updateUserProfile(profileData: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    // Add updated_at timestamp
    const dataToUpdate = {
      ...profileData,
      updated_at: new Date().toISOString()
    };

    // First, check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (checkError || !existingProfile) {
      // Profile doesn't exist, create it
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            ...dataToUpdate,
            full_name: dataToUpdate.full_name || dataToUpdate.name || user.user_metadata?.full_name || user.user_metadata?.name || '',
            phone_number: dataToUpdate.phone_number || dataToUpdate.phone || user.user_metadata?.phone_number || user.user_metadata?.phone || '',
            email: user.email,
            user_type: user.user_metadata?.user_type || 'CONSUMER',
            email_notifications: dataToUpdate.email_notifications ?? true,
            push_notifications: dataToUpdate.push_notifications ?? true,
            sms_alerts: dataToUpdate.sms_alerts ?? false,
            location_tracking: dataToUpdate.location_tracking ?? true,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        throw insertError;
      }

      return insertData[0];
    }

    // Profile exists, update it
    const { data, error } = await supabase
      .from('profiles')
      .update(dataToUpdate)
      .eq('id', user.id)
      .select();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
}