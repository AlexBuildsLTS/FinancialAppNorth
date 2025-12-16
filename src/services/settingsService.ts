import { supabase } from '../lib/supabase';
import { AppSettings } from '../types';
import { encryptMessage, decryptMessage } from '../lib/crypto'; 

// Cache to prevent decrypting on every single chat message
const keyCache: Record<string, string> = {};

export const settingsService = {
  /**
   * Updates user profile preferences
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
      console.error("[Settings] Update Prefs Error:", error);
      throw error;
    }
  },

  /**
   * Securely encrypts and saves an API Key.
   */
  async saveApiKey(userId: string, service: 'openai' | 'gemini' | 'claude', rawKey: string) {
    try {
      if (!rawKey || !rawKey.trim()) return; 

      // 1. Encrypt (Titan 1 Security)
      const encryptedKey = encryptMessage(rawKey.trim());

      // 2. Save to DB (Clean payload)
      const { error } = await supabase
        .from('user_secrets')
        .upsert({ 
          user_id: userId, 
          service: service,
          api_key_encrypted: encryptedKey
        }, { onConflict: 'user_id,service' });

      if (error) throw error;
      
      // 3. Update Cache
      keyCache[service] = rawKey.trim();
      
      return true;
    } catch (error: any) {
      console.error(`[Settings] Save ${service} Key Error:`, error);
      throw error;
    }
  },

  /**
   * Retrieves and decrypts an API Key.
   */
  async getApiKey(userId: string, service: 'openai' | 'gemini' | 'claude'): Promise<string | null> {
    if (keyCache[service]) return keyCache[service];

    try {
      const { data, error } = await supabase
        .from('user_secrets')
        .select('api_key_encrypted')
        .eq('user_id', userId)
        .eq('service', service)
        .maybeSingle(); 

      if (error) return null;
      if (!data?.api_key_encrypted) return null;

      const decryptedKey = decryptMessage(data.api_key_encrypted);
      keyCache[service] = decryptedKey;
      
      return decryptedKey;

    } catch (error) {
      console.error(`[Settings] Decrypt error for ${service}:`, error);
      return null;
    }
  },

  clearCache() {
    Object.keys(keyCache).forEach(key => delete keyCache[key]);
  }
};