// src/lib/localStorage.ts
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const storage = {
  getItem(key: string): string | null {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (err) {
      console.warn('[storage] getItem failed', err);
      return null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (err) {
      console.warn('[storage] setItem failed', err);
    }
  },

  removeItem(key: string): void {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn('[storage] removeItem failed', err);
    }
  },

  clear(): void {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
    } catch (err) {
      console.warn('[storage] clear failed', err);
    }
  },
};

export default storage;