import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store'; // This import is correct for Expo projects.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Minimal storage adapter interface compatible with @supabase/auth-js
interface StorageAdapter {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}

// Native: use expo-secure-store (encrypted keychain/keystore)
const NativeSecureStoreAdapter: StorageAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

// Web: fall back to localStorage (default for supabase-js)
// Note: localStorage is susceptible to XSS; for higher security on web,
// prefer a cookie-based approach (outside the scope of RN/Expo).
const WebLocalStorageAdapter: StorageAdapter = {
  getItem: (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key, value) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail fast with a clear error when env vars are missing
  throw new Error(
    'Supabase URL or Anon Key is not set. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are defined.'
  );
}

// Choose appropriate storage per platform
const storageAdapter = Platform.OS === 'web' ? WebLocalStorageAdapter : NativeSecureStoreAdapter;

// Make the client a stable singleton across Fast Refresh
declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient: SupabaseClient | undefined;
  // eslint-disable-next-line no-var
  var __supabaseAppStateSub: { remove: () => void } | undefined;
}

const client =
  globalThis.__supabaseClient ??
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      // Only detect session in URL on web (native uses deep-links/custom handlers).
      detectSessionInUrl: Platform.OS === 'web',
      // PKCE is recommended for native apps and works fine for web when applicable.
      flowType: 'pkce',
    },
  });

if (!globalThis.__supabaseClient) {
  globalThis.__supabaseClient = client;
}

export const supabase = client;

// Manage token auto-refresh based on app foreground/background (native only)
if (Platform.OS !== 'web') {
  // Start auto refresh immediately if app is already active
  const currentState = AppState.currentState;
  if (currentState === 'active') {
    client.auth.startAutoRefresh();
  } else {
    client.auth.stopAutoRefresh();
  }

  // Avoid registering multiple listeners during Fast Refresh
  if (!globalThis.__supabaseAppStateSub) {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        client.auth.startAutoRefresh();
      } else {
        client.auth.stopAutoRefresh();
      }
    });

    globalThis.__supabaseAppStateSub = sub;
  }
}
