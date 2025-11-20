import { supabase } from './supabase'

/**
 * Ensures that the required storage buckets exist
 * @returns Promise with the result of bucket creation
 */
export async function ensureStorageBucketsExist() {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;
    
    const requiredBuckets = ['avatars', 'shop-images', 'business_documents'];
    
    for (const bucketName of requiredBuckets) {
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
        if (createError) throw createError;
        console.log(`✅ Created '${bucketName}' bucket successfully.`);
      }
    }
    return { success: true };
  } catch (err) {
    console.error('❌ Error in ensureStorageBucketsExist:', err);
    return { success: false, error: 'An unexpected error occurred while checking buckets.' };
  }
}

/**
 * Gets a user's profile from the 'profiles' table.
 * @param {string} userId The user's ID from Supabase Auth.
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, profile: data };
  } catch (err) {
    console.error('❌ Error fetching profile:', err);
    return { success: false, error: 'Failed to fetch profile.' };
  }
}

/**
 * Updates a user's profile in the 'profiles' table.
 * @param {string} userId The user's ID.
 * @param {object} profileData The data to update.
 */
export async function updateUserProfile(userId, profileData) {
  try {
    const { error } = await supabase.from('profiles').upsert({ id: userId, ...profileData });
    if (error) throw error;
    return { success: true, error: null };
  } catch (err) {
    console.error('❌ Error updating user profile:', err);
    return { success: false, error: 'Failed to update user profile.' };
  }
}

/**
 * Updates a partner's shop details in the 'partner_shops' table.
 * @param {string} partnerId The partner's user ID.
 * @param {object} shopData The shop data to update.
 */
export async function updateShopProfile(partnerId, shopData) {
  try {
    // This will now correctly UPDATE an existing shop profile instead of creating a duplicate.
    const { error } = await supabase
      .from('partner_shops')
      .upsert({ partner_id: partnerId, ...shopData }, { onConflict: 'partner_id' });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ Error updating shop profile:', error);
    return { success: false, error: 'Failed to update shop profile.' };
  }
}

/**
 * A generic function to upload any file to a specified Supabase Storage bucket.
 * @param {File} file The file to upload.
 * @param {string} bucket The name of the destination bucket.
 */
export async function uploadFile(file, bucket) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    
    return { success: true, url: data.publicUrl, error: null };
  } catch (error) {
    console.error(`❌ Error uploading to bucket '${bucket}':`, error);
    return { success: false, url: null, error: `Failed to upload file to ${bucket}.` };
  }
}

/**
 * A specific wrapper for uploadFile, used for user avatars.
 * @param {File} file The avatar image file.
 */
export async function uploadAvatar(file) {
    return uploadFile(file, 'avatars');
}

