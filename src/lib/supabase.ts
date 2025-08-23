// src/lib/supabase.ts

import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing from environment variables.");
}

// Custom adapter to use SecureStore with Supabase on native platforms
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

const supabaseOptions: SupabaseClientOptions<'public'> = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    ...(Platform.OS !== 'web' && { storage: ExpoSecureStoreAdapter }),
  },
};

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);