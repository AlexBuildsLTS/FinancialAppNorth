import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import
 { setItemAsync, getItemAsync, deleteItemAsync } from "expo-secure-store";
// Define a secure storage adapter for native platforms using expo-secure-store
const NativeSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// Use standard localStorage for the web, which is the correct practice
const WebLocalStorageAdapter = {
  getItem: async (key: string) => (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null),
  setItem: async (key: string, value: string) => { if (typeof localStorage !== 'undefined') localStorage.setItem(key, value); },
  removeItem: async (key: string) => { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); },
};
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is not set in your environment variables. Check your .env file.");
}

// Conditionally choose the storage adapter based on the platform
const storageAdapter = Platform.OS === 'web' ? WebLocalStorageAdapter : NativeSecureStoreAdapter;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

// Refreshes the session when the app comes to the foreground on native platforms
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
