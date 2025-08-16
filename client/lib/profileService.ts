import { supabase } from './supabase'

/**
 * Ensures that the required storage buckets exist
 * @returns Promise with the result of bucket creation
 */
export async function ensureStorageBucketsExist() {
  try {
    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return { success: false, error: listError.message };
    }
    
    const bucketNames = ['Avatar', 'profiles'];
    
    for (const bucketName of bucketNames) {
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (createError) {
          console.error(`Error creating ${bucketName} bucket:`, createError);
          return { success: false, error: createError.message };
        }
        
        console.log(`Created ${bucketName} bucket successfully`);
      }
    }
    
    return { success: true };
  } catch (err) {
    console.error('Unexpected error ensuring buckets exist:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Uploads an avatar file to Supabase Storage and updates the user's profile
 */
export async function uploadAvatar(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log('🚀 Starting simplified avatar upload process...');
    
    if (!file) {
      console.error('❌ No file provided');
      return { success: false, error: 'No file provided' };
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('❌ User authentication error:', userError);
      return { success: false, error: userError.message };
    }
    if (!user) {
      console.error('❌ User not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    console.log('✅ User authenticated:', { userId: user.id, email: user.email });

    // Generate file path inside UID folder (simplified approach)
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    console.log('📂 Generated file path:', filePath);
    console.log('📁 File details:', { name: file.name, size: file.size, type: file.type });

    // Upload to "Avatar" bucket
    console.log('⬆️ Starting upload to Avatar bucket...');
    const { error: uploadError } = await supabase.storage
      .from('Avatar')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('❌ Storage upload failed:', uploadError);
      return { success: false, error: `Storage upload failed: ${uploadError.message}` };
    }

    console.log('✅ File uploaded successfully');

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('Avatar').getPublicUrl(filePath);
    console.log('✅ Public URL generated:', publicUrl);

    // Update profile with avatar URL
    console.log('💾 Updating profile with avatar URL...');
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id); // ✅ Uses 'id' to match actual schema

    if (profileUpdateError) {
      console.error('❌ Profile update failed:', profileUpdateError);
      // Return success for upload but note profile update failed
      return { 
        success: true, 
        url: publicUrl, 
        error: `Avatar uploaded but profile update failed: ${profileUpdateError.message}` 
      };
    }

    console.log('✅ Profile updated successfully');
    console.log('🎉 Avatar upload completed successfully!');
    
    return { success: true, url: publicUrl };

  } catch (err: any) {
    console.error('❌ Unexpected error in uploadAvatar:', err);
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
}

/**
 * Gets a user's profile from the profiles table
 * @param userId The user's ID from Supabase Auth
 * @returns Promise with the user's profile data
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)  // Query by id primary key (actual schema)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, profile: data };
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Creates a profile for a new user in the profiles table
 * @param userId The user's ID from Supabase Auth
 * @param userData User metadata including name, phone, and user_type
 * @returns Promise with the result of the profile creation
 */
export async function createUserProfile(userId: string, userData: any) {
  try {
    // Extract user data from the metadata
    const { name, phone, user_type, address, avatar_url } = userData;
    
    // Create a profile entry in the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        { 
          id: userId,  // Use id as primary key matching auth user ID (actual schema)
          full_name: name || '',  // Use full_name column (actual schema)
          phone_number: phone || '',  // Use phone_number column (actual schema)
          user_type,
          address: address || '',
          avatar_url: avatar_url || ''
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating profile:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error creating profile:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Updates a user's profile in the profiles table
 * @param userId The user's ID from Supabase Auth
 * @param profileData The profile data to update
 * @returns Promise with the result of the profile update
 */
export async function updateUserProfile(userId: string, profileData: any) {
  try {
    // Map frontend field names to database column names
    const dataToUpdate = { ...profileData };
    
    // Map 'name' to 'full_name' for database compatibility
    if (dataToUpdate.name) {
      dataToUpdate.full_name = dataToUpdate.name;
      delete dataToUpdate.name;
    }
    
    // Map 'phone' to 'phone_number' for database compatibility
    if (dataToUpdate.phone) {
      dataToUpdate.phone_number = dataToUpdate.phone;
      delete dataToUpdate.phone;
    }
    
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)  // Query by id primary key (actual schema)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking profile existence:', checkError);
      return { success: false, error: checkError.message };
    }
    
    if (!existingProfile) {
      // Profile doesn't exist, create it
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,  // Uses 'id' for INSERT policy compliance
          ...dataToUpdate
        }])
        .select();
        
      if (insertError) {
        console.error('Error creating profile:', insertError.message);
        return { success: false, error: insertError.message };
      }
      
      // If avatar_url was updated, also update user metadata for consistency
      if (dataToUpdate.avatar_url) {
        try {
          const { error: metadataError } = await supabase.auth.updateUser({
            data: { avatar_url: dataToUpdate.avatar_url }
          });
          if (metadataError) {
            console.warn('Failed to update user metadata with avatar_url:', metadataError);
          }
        } catch (err) {
          console.warn('Error updating user metadata:', err);
        }
      }
      
      return { success: true, data: insertData[0] };
    }

    // Profile exists, update it using id
    const { data, error } = await supabase
      .from('profiles')
      .update(dataToUpdate)
      .eq('id', userId)  // Uses 'id' for UPDATE policy compliance
      .select();

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }

    // If avatar_url was updated, also update user metadata for consistency
    if (dataToUpdate.avatar_url) {
      try {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { avatar_url: dataToUpdate.avatar_url }
        });
        if (metadataError) {
          console.warn('Failed to update user metadata with avatar_url:', metadataError);
        }
      } catch (err) {
        console.warn('Error updating user metadata:', err);
      }
    }

    return { success: true, data: data[0] };
  } catch (err) {
    console.error('Unexpected error updating profile:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}