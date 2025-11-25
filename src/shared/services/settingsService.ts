import { supabase } from '../../lib/supabase';
import { AppSettings } from '../../types';

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
        api_key_encrypted: key 
      }, { onConflict: 'user_id,service' }); // Removed space for safety

    if (error) {
      console.error("Save API Key Error:", error);
      throw error;
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
      if (error.code !== 'PGRST116') console.error("Get API Key Error:", error);
      return null;
    }
    return data?.api_key_encrypted;
  }
};