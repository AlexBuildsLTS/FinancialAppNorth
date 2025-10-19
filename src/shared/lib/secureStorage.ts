import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Minimal secure storage abstraction:
 * - Native: expo-secure-store
 * - Web: localStorage fallback (not cryptographically secure; use only as fallback)
 */
export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch {
      return Promise.resolve(null);
    }
  }
  return await SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch {
      return Promise.reject(new Error('localStorage set failed'));
    }
  }
  return await SecureStore.setItemAsync(key, value);
}

export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch {
      return Promise.reject(new Error('localStorage remove failed'));
    }
  }
  return await SecureStore.deleteItemAsync(key);
}
