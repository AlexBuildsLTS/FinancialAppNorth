import { supabase } from '@/lib/supabase';

export const updateUserPassword = async (newPassword: string): Promise<void> => {
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        throw new Error('Failed to update password: No data returned.');
    }
};
