import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * ============================================================================
 * 🔐 NORTHFINANCE SECURE STORAGE (TITAN LAYER)
 * ============================================================================
 * Abstraction layer ensuring secrets (Tokens, Biometric prefs) are stored
 * in the device's hardware Secure Enclave (iOS/Android).
 * * FALLBACK: Uses localStorage for Web.
 * ============================================================================
 */

export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`[SecureStorage] Error setting ${key}:`, error);
    throw error;
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error(`[SecureStorage] Error getting ${key}:`, error);
    return null;
  }
};

export const deleteItem = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`[SecureStorage] Error deleting ${key}:`, error);
  }
};

// Export a storage adapter for Supabase Auth
export const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return await getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await deleteItem(key);
  },
};