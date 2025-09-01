import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Platform } from 'react-native';

export const updateProfile = async (
  userId: string,
  updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>
): Promise<{ updatedProfile: Profile | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { updatedProfile: data, error: null };
  } catch (error: any) {
    return { updatedProfile: null, error: new Error(error.message || 'An unknown error occurred.') };
  }
};

export const uploadAvatar = async (userId: string, file: any): Promise<{ filePath: string | null; error: Error | null }> => {
  try {
    const fileExt = file.uri.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${Date.now()}_${fileName}`;

    if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, blob, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.mimeType,
            });
        if (uploadError) throw new Error(uploadError.message);
    } else {
        const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: 'base64' });
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, decode(base64), {
                cacheControl: '3600',
                upsert: true,
                contentType: file.mimeType,
            });
        if (uploadError) throw new Error(uploadError.message);
    }

    return { filePath, error: null };
  } catch (error: any) {
    return { filePath: null, error: new Error(error.message || 'An unknown error occurred during upload.') };
  }
};