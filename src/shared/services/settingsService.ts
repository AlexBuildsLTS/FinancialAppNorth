import { supabase } from '../../lib/supabase';
import { AppSettings } from '../../types';
import { encryptMessage, decryptMessage } from '../../lib/crypto'; 

// In-memory cache to prevent redundant decryption and database hits during a session
const keyCache: Record<string, string> = {};

export const settingsService = {
  /**
   * Updates user profile preferences (Currency, Country, Theme, etc.)
   * Uses robust error handling and returns the updated data.
   */
  async updatePreferences(userId: string, preferences: Partial<AppSettings>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          currency: preferences.currency,
          country: preferences.country,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("[Settings] Update Preferences Error:", error);
      throw error;
    }
  },

  /**
   * Securely encrypts and saves an API Key to the database.
   * Uses UPSERT logic to handle both creation and updates seamlessly.
   */
  async saveApiKey(userId: string, service: 'openai' | 'gemini' | 'claude', rawKey: string) {
    try {
      // 1. Encrypt the key locally before it ever leaves the device
      const encryptedKey = encryptMessage(rawKey);

      // 2. Save to Supabase (User Secrets Table)
      const { error } = await supabase
        .from('user_secrets')
        .upsert({ 
          user_id: userId, 
          service: service,
          api_key_encrypted: encryptedKey,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,service' });

      if (error) throw error;
      
      // 3. Update local memory cache immediately so the app feels instant
      keyCache[service] = rawKey;
      
      return true;
    } catch (error) {
      console.error(`[Settings] Save ${service} Key Error:`, error);
      throw new Error(`Failed to save API key for ${service}. Please try again.`);
    }
  },

  /**
   * Retrieves and decrypts an API Key.
   * Uses memory caching to reduce database calls during chat sessions.
   * Handles "Key Not Found" gracefully without crashing.
   */
  async getApiKey(userId: string, service: 'openai' | 'gemini' | 'claude'): Promise<string | null> {
    // 1. Check Memory Cache First (Fastest)
    if (keyCache[service]) {
      return keyCache[service];
    }

    try {
      // 2. Fetch from DB
      // Use maybeSingle() instead of single() to avoid 406 errors if the key doesn't exist yet.
      const { data, error } = await supabase
        .from('user_secrets')
        .select('api_key_encrypted')
        .eq('user_id', userId)
        .eq('service', service)
        .maybeSingle();

      if (error) {
        console.warn(`[Settings] Fetch warning for ${service}:`, error.message);
        return null;
      }

      if (!data?.api_key_encrypted) return null;

      // 3. Decrypt the key
      const decryptedKey = decryptMessage(data.api_key_encrypted);
      
      // 4. Update Cache
      keyCache[service] = decryptedKey;
      
      return decryptedKey;

    } catch (error) {
      console.error(`[Settings] Failed to decrypt ${service} key:`, error);
      return null;
    }
  },

  /**
   * Clears the local memory cache.
   * Should be called on Logout to ensure security.
   */
  clearCache() {
    Object.keys(keyCache).forEach(key => delete keyCache[key]);
  }
};

// Legacy Export compatibility (allows other files to import getGeminiApiKey directly if needed)
export const getGeminiApiKey = async (userId: string) => {
  return await settingsService.getApiKey(userId, 'gemini');
};