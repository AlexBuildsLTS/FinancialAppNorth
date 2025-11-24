// src/lib/secureStorage.ts
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// The Supabase JS client expects an object with async methods:
// getItem(key): Promise<string | null>
// setItem(key, value): Promise<void>
// removeItem(key): Promise<void>
//
// For web, we map to localStorage; for native, use expo-secure-store.

const isWeb = Platform.OS === 'web';

const webSecureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(key);
    } catch (err) {
      console.warn('[secureStorage] web getItem failed', err);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (err) {
      console.warn('[secureStorage] web setItem failed', err);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn('[secureStorage] web removeItem failed', err);
    }
  },
};

const nativeSecureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.warn('[secureStorage] native getItem failed', err);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.warn('[secureStorage] native setItem failed', err);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.warn('[secureStorage] native removeItem failed', err);
    }
  },
};

export const secureStorage = isWeb ? webSecureStorage : nativeSecureStorage;
export default secureStorage;