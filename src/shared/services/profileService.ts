import { supabase } from '@/shared/lib/supabase';
import { Profile } from '@/shared/types';
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

export const getProfile = async (userId: string): Promise<{ profile: Profile | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);
    return { profile: data, error: null };
  } catch (error: any) {
    return { profile: null, error: new Error(error.message || 'An unknown error occurred.') };
  }
};

export const uploadAvatar = async (userId: string, file: any): Promise<{ filePath: string | null; error: Error | null }> => {
  try {
    const fileExt = file.uri.split('.').pop() || 'png';
    const path = `${userId}/avatar.${fileExt}`;

    if (Platform.OS === 'web') {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.error(e);
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", file.uri, true);
            xhr.send(null);
        });

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, blob as Blob, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.mimeType,
            });

        if (uploadError) {
            throw new Error(uploadError.message);
        }
    } else {
      const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: 'base64' });
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, decode(base64), {
          cacheControl: '3600',
          upsert: true,
          contentType: file.mimeType,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }
    }

    return { filePath: path, error: null };
  } catch (error: any) {
    return { filePath: null, error: new Error(error.message || 'An unknown error occurred during upload.') };
  }
};