import { supabase } from '@/shared/lib/supabase';

interface ApiKeys {
  openai_key?: string;
  gemini_key?: string;
  claude_key?: string;
}

/**
 * Saves the user's API keys to their profile.
 * This should update a secure, possibly encrypted, column in the 'profiles' table.
 * @param userId - The ID of the user.
 * @param keys - The API keys to save.
 */
export const saveApiKeys = async (userId: string, keys: ApiKeys): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ api_keys: keys }) // Assumes an 'api_keys' JSONB column on the profiles table
    .eq('id', userId);

  if (error) {
    console.error('Error saving API keys:', error);
    throw error;
  }
};

/**
 * Retrieves the user's saved API keys.
 * @param userId - The ID of the user.
 */
export const getApiKeys = async (userId: string): Promise<ApiKeys> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('api_keys')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Error fetching API keys:', error);
        throw error;
    }
    return data?.api_keys || {};
};

/**
 * A mock function to test an API key connection.
 * In a real app, this would make a simple call to the provider's API.
 */
export const testApiKeyConnection = async (provider: 'openai' | 'gemini' | 'claude', apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    // Simulate API call
    return new Promise(resolve => {
        setTimeout(() => {
            // Simple validation for demonstration
            resolve(apiKey.length > 10);
        }, 500);
    });
};