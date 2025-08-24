import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Conditional import for AsyncStorage
let AsyncStorage;
if (Platform.OS !== 'web') {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in your environment variables.");
}

let storage;
if (Platform.OS === 'web') {
  if (typeof window !== 'undefined' && window.localStorage) {
    storage = window.localStorage;
  } else {
    // In-memory storage for SSR or environments without localStorage
    const inMemoryStorage: { [key: string]: string } = {};
    storage = {
      getItem: (key: string) => inMemoryStorage[key] || null,
      setItem: (key: string, value: string) => {
        inMemoryStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete inMemoryStorage[key];
      },
    };
  }
} else {
  // For native platforms (iOS, Android), use AsyncStorage
  storage = AsyncStorage;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
