import { supabase } from '../../lib/supabase';
import { AppSettings } from '../../types';

export const settingsService = {
  // Update Currency / Theme / Notifications
  async updatePreferences(userId: string, preferences: Partial<AppSettings>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        // We assume your profiles table has columns for these, or a jsonb 'preferences' column
        // Adjust based on your actual schema. Here we use specific columns for clarity.
        currency: preferences.currency,
        country: preferences.country
        // theme and notifications might be local-only or stored in a preferences JSON column
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Securely save API Keys (using RLS-protected table)
  async saveApiKey(userId: string, service: 'openai' | 'gemini' | 'claude', key: string) {
    // Upsert the key into user_secrets
    const { error } = await supabase
      .from('user_secrets')
      .upsert({ 
        user_id: userId, 
        service: service,
        api_key_encrypted: key // In a real prod app, encrypt this before sending or use an Edge Function!
      }, { onConflict: 'user_id, service' });

    if (error) throw error;
  },

  // Get API Key (for local usage, though ideally backend handles this)
  async getApiKey(userId: string, service: 'openai' | 'gemini' | 'claude') {
    const { data, error } = await supabase
      .from('user_secrets')
      .select('api_key_encrypted')
      .eq('user_id', userId)
      .eq('service', service)
      .single();

    if (error) return null;
    return data?.api_key_encrypted;
  }
};