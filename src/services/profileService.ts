import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

/**
 * Fetches the user's profile from the 'profiles' table.
 * @param userId - The ID of the user.
 */
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error fetching profile:', error);
    throw error;
  }
  return data;
};

/**
 * Updates the user's profile.
 * @param userId - The ID of the user.
 * @param updates - The profile data to update.
 */
export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
  return data;
};

/**
 * Uploads an avatar image to Supabase Storage.
 * @param userId The user's ID, used for the file path.
 * @param file The file object (e.g., from an image picker).
 */
export const uploadAvatar = async (userId: string, file: Blob, fileName: string): Promise<string> => {
    const filePath = `${userId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true, // Overwrite existing file
        });

    if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        throw uploadError;
    }

    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return data.publicUrl;
};