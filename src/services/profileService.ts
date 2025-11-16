// src/shared/services/profileService.ts
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import { Platform } from 'react-native';

// Optional: use expo-file-system only when running in Expo-managed React Native
let ExpoFileSystem: typeof import('expo-file-system') | null = null;
if (Platform.OS !== 'web') {
  try {
    // dynamic import to avoid bundling issues on web
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ExpoFileSystem = require('expo-file-system');
  } catch (e) {
    ExpoFileSystem = null;
  }
}

export const updateProfile = async (
  userId: string,
  updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'role'>>
): Promise<{ updatedProfile: Profile | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { updatedProfile: data as Profile, error: null };
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
    return { profile: data as Profile, error: null };
  } catch (error: any) {
    return { profile: null, error: new Error(error.message || 'An unknown error occurred.') };
  }
};

type UploadResult = {
  filePath: string | null;
  publicUrl: string | null;
  error: Error | null;
};

/**
 * uploadAvatar
 * - Accepts a file descriptor with .uri, optional .name, optional .mimeType
 * - Uploads to storage bucket "avatars" under path `${userId}/avatar-<timestamp>.<ext>`
 * - Returns filePath and either a publicUrl or a signed URL (if bucket is private)
 * - Optionally updates profiles.avatar_url when `updateProfileAfterUpload` is true
 */
export const uploadAvatar = async (
  userId: string,
  file: { uri: string; name?: string; mimeType?: string },
  options?: { updateProfileAfterUpload?: boolean; signedUrlTtlSec?: number }
): Promise<UploadResult> => {
  const updateProfileAfterUpload = options?.updateProfileAfterUpload ?? false;
  const signedUrlTtlSec = options?.signedUrlTtlSec ?? 60 * 60 * 24; // 24 hours default

  try {
    if (!file?.uri) throw new Error('No file provided');

    // Derive filename and extension
    const guessedName = file.name ?? file.uri.split('/').pop() ?? `avatar`;
    const ext = (guessedName.split('.').pop() || 'png').split('?')[0];
    const filename = `avatar-${Date.now()}.${ext}`;
    const path = `${userId}/${filename}`;

    // Prepare Blob or ArrayBuffer for upload
    let uploadData: Blob | ArrayBuffer | Uint8Array;

    if (Platform.OS === 'web') {
      // On web, fetch the file and get a Blob
      const res = await fetch(file.uri);
      if (!res.ok) throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`);
      uploadData = await res.blob();
    } else {
      // On native (Expo or React Native), try to use expo-file-system to read base64
      if (ExpoFileSystem && typeof ExpoFileSystem.readAsStringAsync === 'function') {
        const base64 = await ExpoFileSystem.readAsStringAsync(file.uri, { encoding: ExpoFileSystem.EncodingType.Base64 });
        // Convert base64 to ArrayBuffer/Uint8Array. Use globalThis.atob for web compatibility.
        const binary = typeof globalThis.atob === 'function' ? globalThis.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        uploadData = bytes;
      } else {
        // Last-resort: fetch the uri (should work with RN >=0.60+)
        const res = await fetch(file.uri);
        if (!res.ok) throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`);
        // Some RN environments return blob support; otherwise get ArrayBuffer
        try {
          uploadData = await res.blob();
        } catch {
          uploadData = await res.arrayBuffer();
        }
      }
    }

    // Upload to storage
    const contentType = file.mimeType ?? ((uploadData as Blob).type || `image/${ext}`);
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, uploadData as any, {
        cacheControl: '3600',
        upsert: true,
        contentType,
      });

    if (uploadError) throw new Error(uploadError.message);

    // Try public URL first
    const publicRes: any = supabase.storage.from('avatars').getPublicUrl(path);
    let publicUrl: string | null = publicRes?.data?.publicUrl ?? null;

    // If no public URL (private bucket), create signed URL
    if (!publicUrl) {
      const { data: signedData, error: signedErr } = await supabase.storage.from('avatars').createSignedUrl(path, signedUrlTtlSec);
      if (signedErr) {
        // Not fatal — return path but warn
        console.warn('Could not create signed URL for avatar:', signedErr);
      } else {
        publicUrl = signedData.signedUrl;
      }
    }

    // Optionally update the profile record's avatar_url
    if (updateProfileAfterUpload) {
      try {
        const avatarField = publicUrl ? publicUrl : path; // store URL when available, otherwise store path
        await supabase.from('profiles').update({ avatar_url: avatarField }).eq('id', userId);
        // ignore errors here — caller can refresh profile separately
      } catch (e) {
        console.warn('Failed to update profile avatar_url after upload:', e);
      }
    }

    return { filePath: path, publicUrl, error: null };
  } catch (err: any) {
    console.error('uploadAvatar error:', err);
    return { filePath: null, publicUrl: null, error: new Error(err.message || 'An unknown error occurred during upload.') };
  }
};