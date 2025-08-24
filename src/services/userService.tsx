import { supabase } from '@/lib/supabase';

export const updateProfile = async (userId: string, updates: { display_name?: string; avatar_url?: string }) => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const updateUserPassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
        console.error("Error updating password:", error);
        throw error;
    }
};