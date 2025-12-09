import { supabase } from '../../lib/supabase';
import { AppSettings } from '../../types';

// Simple in-memory cache to prevent hitting DB on every AI request
let cachedGeminiApiKey: string | null = null;

export const getGeminiApiKey = async (userId: string): Promise<string | null> => {
  if (cachedGeminiApiKey) {
    return cachedGeminiApiKey;
  }

  const encryptedKey = await settingsService.getApiKey(userId, 'gemini');
  if (encryptedKey) {
    // In a real app, use a library like 'crypto-js' or 'expo-crypto' here
    const decryptedKey = decrypt(encryptedKey);
    cachedGeminiApiKey = decryptedKey;
    return decryptedKey;
  }
  return null;
};

// Helper function to simulate decryption
// TODO: Replace with actual AES decryption in production
function decrypt(encryptedKey: string): string {
  return encryptedKey; 
}

export const settingsService = {
  // Update Currency / Theme / Notifications
  async updatePreferences(userId: string, preferences: Partial<AppSettings>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        currency: preferences.currency,
        country: preferences.country
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error("Update Prefs Error:", error);
      throw error;
    }
    return data;
  },

  // Securely save API Keys
  async saveApiKey(userId: string, service: 'openai' | 'gemini' | 'claude', key: string) {
    // We use 'upsert' to Insert or Update based on (user_id, service)
    const { error } = await supabase
      .from('user_secrets')
      .upsert({ 
        user_id: userId, 
        service: service,
        // TODO: Encrypt 'key' before sending to DB in production
        api_key_encrypted: key 
      }, { onConflict: 'user_id,service' });

    if (error) {
      console.error("Save API Key Error:", error);
      throw error;
    }
    
    // Update cache immediately
    if (service === 'gemini') {
      cachedGeminiApiKey = key;
    }
  },

  // Get API Key
  async getApiKey(userId: string, service: 'openai' | 'gemini' | 'claude') {
    const { data, error } = await supabase
      .from('user_secrets')
      .select('api_key_encrypted')
      .eq('user_id', userId)
      .eq('service', service)
      .single();

    if (error) {
      // Don't throw on "not found", just return null
      if (error.code !== 'PGRST116') console.warn(`API Key for ${service} not found.`);
      return null;
    }
    return data?.api_key_encrypted;
  }
};