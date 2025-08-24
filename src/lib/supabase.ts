
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';


const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing from environment variables.");
}

let storage: any;

// Define a simple in-memory storage for server-side environments
const inMemoryStorage = {
  getItem: (key: string) => Promise.resolve(null),
  setItem: (key: string, value: string) => Promise.resolve(),
  removeItem: (key: string) => Promise.resolve(),
};

if (Platform.OS === 'web') {
  // For web, use localStorage if available (client-side), otherwise in-memory storage for SSR
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    storage = window.localStorage;
  } else {
    storage = inMemoryStorage;
  }
} else {
  // For native platforms, use AsyncStorage if available, otherwise in-memory storage for bundler/Node.js
  try {
    // Attempt to require AsyncStorage. This will fail in a pure Node.js environment.
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    storage = AsyncStorage;
  } catch (e) {
    // Fallback to in-memory storage if AsyncStorage cannot be required (e.g., during bundling/SSR for native)
    storage = inMemoryStorage;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
