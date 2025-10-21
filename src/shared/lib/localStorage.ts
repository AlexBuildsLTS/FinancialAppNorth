import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * A platform-agnostic wrapper for secure key-value storage.
 * Uses Expo's hardware-backed SecureStore on native (iOS/Android)
 * and falls back to localStorage on Web.
 */
export const secureStorage = {
  /**
   * Asynchronously saves a value to secure storage.
   * @param key The key to save.
   * @param value The value to save.
   */
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error("Failed to save to localStorage:", e);
      }
    } else {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (e) {
        console.error("Failed to save to SecureStore:", e);
      }
    }
  },

  /**
   * Asynchronously retrieves a value from secure storage.
   * @param key The key to retrieve.
   * @returns The stored value, or null if it doesn't exist.
   */
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error("Failed to read from localStorage:", e);
        return null;
      }
    } else {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (e) {
        console.error("Failed to read from SecureStore:", e);
        return null;
      }
    }
  },

  /**
   * Asynchronously deletes a key-value pair from secure storage.
   * @param key The key to delete.
   */
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error("Failed to remove from localStorage:", e);
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (e) {
        console.error("Failed to remove from SecureStore:", e);
      }
    }
  },
};