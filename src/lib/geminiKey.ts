import { supabase } from './supabase';
import { encryptMessage, decryptMessage } from './crypto';

export const saveGeminiKey = async (userId: string, apiKey: string) => {
    const encrypted = encryptMessage(apiKey.trim());
    const { error } = await supabase
        .from('user_secrets')
        .upsert({
            user_id: userId,
            service: 'gemini',
            api_key_encrypted: encrypted
        }, { onConflict: 'user_id,service' });

    if (error) throw error;
};

export const getGeminiKey = async (userId: string) => {
    const { data } = await supabase
        .from('user_secrets')
        .select('api_key_encrypted')
        .eq('user_id', userId)
        .eq('service', 'gemini')
        .maybeSingle();

    if (data?.api_key_encrypted) {
        return decryptMessage(data.api_key_encrypted);
    }
    return null;
};